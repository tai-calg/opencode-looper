import crypto from 'node:crypto';
import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createCheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type { CheckResultRepository } from '../../domain/gateways/check-result.repository';
import type { ContentCheckRepository } from '../../domain/gateways/content-check.repository';
import type { ContentSegmentRepository } from '../../domain/gateways/content-segment.repository';
import type { ExpressionRuleProvider } from '../../domain/gateways/expression-rule.provider';
import type { KnowledgeSearchGateway } from '../../domain/gateways/knowledge-search.gateway';
import { CheckResult } from '../../domain/models/check-result.model';
import type { CheckType, Severity } from '../../domain/models/check-result.model';
import { ContentCheck } from '../../domain/models/content-check.model';
import { ContentSegment } from '../../domain/models/content-segment.model';
import { ContentReviewService } from '../../domain/services/content-review.service';

export type ProgressEvent =
	| { type: 'segments_created'; data: { total: number } }
	| { type: 'check_started'; data: { segmentId: string; checkType: CheckType } }
	| { type: 'check_completed'; data: { segmentId: string; checkType: CheckType } }
	| {
			type: 'completed';
			data: { contentCheckId: string; summary: { error: number; warning: number; info: number } };
	  }
	| { type: 'error'; data: { reason: string } };

export interface ExecuteContentCheckInput {
	source: string;
	originalText: string;
	userId?: UserId;
	onProgress?: (event: ProgressEvent) => void;
}

export interface ExecuteContentCheckOutput {
	contentCheckId: string;
	summary: { error: number; warning: number; info: number };
}

interface ParsedSegment {
	text: string;
}

interface ParsedCheckResult {
	severity: Severity;
	message: string;
	suggestion?: string | null;
}

export class ExecuteContentCheckUseCase {
	private readonly contentReviewService = new ContentReviewService();

	constructor(
		private readonly aiGateway: AIGateway,
		private readonly embeddingGateway: EmbeddingGateway,
		private readonly contentCheckRepository: ContentCheckRepository,
		private readonly contentSegmentRepository: ContentSegmentRepository,
		private readonly checkResultRepository: CheckResultRepository,
		private readonly expressionRuleProvider: ExpressionRuleProvider,
		private readonly knowledgeSearchGateway: KnowledgeSearchGateway,
	) {}

	async execute(input: ExecuteContentCheckInput): Promise<ExecuteContentCheckOutput> {
		const { source, originalText, userId, onProgress } = input;

		const effectiveUserId = userId ?? createUserId('00000000-0000-0000-0000-000000000000');
		const contentCheckId = createContentCheckId(crypto.randomUUID());

		// (1) ContentCheck.create → save (status: pending)
		const createResult = ContentCheck.create({
			id: contentCheckId,
			userId: effectiveUserId,
			content: originalText,
		});
		if (!createResult.success) {
			throw new Error(`Failed to create ContentCheck: ${createResult.error}`);
		}
		let contentCheck = createResult.value;
		await this.contentCheckRepository.save(contentCheck);

		try {
			// (2) AIGateway.generate でセマンティック段落分割
			const segmentationPrompt = this.buildSegmentationPrompt(originalText);
			const segmentationResponse = await this.aiGateway.generate(segmentationPrompt);
			const parsedSegments = this.parseSegments(segmentationResponse);

			const segments: ContentSegment[] = [];
			for (let i = 0; i < parsedSegments.length; i++) {
				const segmentId = createContentSegmentId(crypto.randomUUID());
				const segResult = ContentSegment.create({
					id: segmentId,
					contentCheckId,
					text: parsedSegments[i].text,
					segmentIndex: i,
				});
				if (!segResult.success) {
					throw new Error(`Failed to create ContentSegment: ${segResult.error}`);
				}
				segments.push(segResult.value);
			}

			await this.contentSegmentRepository.saveMany(segments);
			onProgress?.({ type: 'segments_created', data: { total: segments.length } });

			// (3) status を processing に更新
			const processingResult = contentCheck.startProcessing();
			if (!processingResult.success) {
				throw new Error(`Failed to start processing: ${processingResult.error}`);
			}
			contentCheck = processingResult.value;
			await this.contentCheckRepository.save(contentCheck);

			// (4) 各セグメントに対して5種チェックを並列実行
			const allCheckResults: CheckResult[] = [];
			const CHECK_TYPES: CheckType[] = [
				'fact_check',
				'knowledge_consistency',
				'expression_rule',
				'risk_assessment',
				'quality',
			];

			await Promise.all(
				segments.map(async (segment) => {
					const segmentResults = await Promise.all(
						CHECK_TYPES.map(async (checkType) => {
							onProgress?.({
								type: 'check_started',
								data: { segmentId: segment.id, checkType },
							});

							const parsed = await this.runCheck(segment.text, checkType, source);

							onProgress?.({
								type: 'check_completed',
								data: { segmentId: segment.id, checkType },
							});

							const checkResultId = createCheckResultId(crypto.randomUUID());
							const checkResult = CheckResult.create({
								id: checkResultId,
								segmentId: segment.id,
								contentCheckId,
								checkType,
								severity: parsed.severity,
								message: parsed.message,
								suggestion: parsed.suggestion ?? null,
							});
							if (!checkResult.success) {
								throw new Error(`Failed to create CheckResult: ${checkResult.error}`);
							}
							return checkResult.value;
						}),
					);
					allCheckResults.push(...segmentResults);
				}),
			);

			// (5) CheckResult[] → saveMany
			await this.checkResultRepository.saveMany(allCheckResults);

			// (6) ContentCheck.complete() → save → onProgress('completed')
			const completeResult = contentCheck.complete();
			if (!completeResult.success) {
				throw new Error(`Failed to complete ContentCheck: ${completeResult.error}`);
			}
			contentCheck = completeResult.value;
			await this.contentCheckRepository.save(contentCheck);

			const summary = this.contentReviewService.summarize(allCheckResults);
			onProgress?.({
				type: 'completed',
				data: { contentCheckId, summary },
			});

			return { contentCheckId, summary };
		} catch (err) {
			const reason = err instanceof Error ? err.message : String(err);
			const failResult = contentCheck.fail(reason);
			if (failResult.success) {
				await this.contentCheckRepository.save(failResult.value);
			}
			onProgress?.({ type: 'error', data: { reason } });
			throw err;
		}
	}

	private buildSegmentationPrompt(text: string): string {
		return `以下のテキストをセマンティックな段落（意味のまとまり）に分割してください。
各段落は独立したトピックや主張を表すようにしてください。
JSON配列形式で返してください。各要素は { "text": "段落テキスト" } の形式です。

テキスト:
${text}

出力形式（JSON配列のみ、他のテキストは含めない）:
[{"text": "..."}]`;
	}

	private parseSegments(response: string): ParsedSegment[] {
		const jsonMatch = response.match(/\[[\s\S]*\]/);
		if (!jsonMatch) {
			return [{ text: response.trim() }];
		}
		try {
			const parsed = JSON.parse(jsonMatch[0]) as unknown[];
			if (!Array.isArray(parsed) || parsed.length === 0) {
				return [{ text: response.trim() }];
			}
			return parsed
				.filter(
					(item): item is { text: string } =>
						typeof (item as { text?: unknown }).text === 'string' &&
						(item as { text: string }).text.trim().length > 0,
				)
				.map((item) => ({ text: item.text }));
		} catch {
			return [{ text: response.trim() }];
		}
	}

	private async runCheck(
		segmentText: string,
		checkType: CheckType,
		source: string,
	): Promise<ParsedCheckResult> {
		switch (checkType) {
			case 'fact_check':
				return this.runFactCheck(segmentText);
			case 'knowledge_consistency':
				return this.runKnowledgeConsistencyCheck(segmentText);
			case 'expression_rule':
				return this.runExpressionRuleCheck(segmentText);
			case 'risk_assessment':
				return this.runRiskAssessmentCheck(segmentText, source);
			case 'quality':
				return this.runQualityCheck(segmentText);
		}
	}

	private async runFactCheck(segmentText: string): Promise<ParsedCheckResult> {
		const prompt = `以下のテキストのファクトチェックを行ってください。
事実として確認できない情報や、誤りがある可能性のある記述を特定してください。

テキスト:
${segmentText}

以下のJSON形式で回答してください（他のテキストは含めない）:
{"severity": "info"|"warning"|"error", "message": "チェック結果の説明", "suggestion": "修正提案（任意）"}`;

		const response = await this.aiGateway.generateWithWebSearch(prompt);
		return this.parseCheckResult(response);
	}

	private async runKnowledgeConsistencyCheck(segmentText: string): Promise<ParsedCheckResult> {
		const embedding = await this.embeddingGateway.generateEmbedding(segmentText);
		const similarChunks = await this.knowledgeSearchGateway.searchSimilar(embedding, 3);

		const knowledgeContext = similarChunks.map((c) => c.chunkText).join('\n\n');

		const prompt = `以下のテキストが、参考知識ベースの内容と整合しているか確認してください。

テキスト:
${segmentText}

参考知識ベース:
${knowledgeContext || '（関連知識なし）'}

以下のJSON形式で回答してください（他のテキストは含めない）:
{"severity": "info"|"warning"|"error", "message": "チェック結果の説明", "suggestion": "修正提案（任意）"}`;

		const response = await this.aiGateway.generate(prompt);
		return this.parseCheckResult(response);
	}

	private async runExpressionRuleCheck(segmentText: string): Promise<ParsedCheckResult> {
		const rules = await this.expressionRuleProvider.findActiveRules();

		const rulesText =
			rules.length > 0
				? rules
						.map((r) => `NG: 「${r.ngExpression}」→ 推奨: 「${r.recommendedExpression}」`)
						.join('\n')
				: '（ルールなし）';

		const prompt = `以下のテキストに表現ルール違反がないか確認してください。

テキスト:
${segmentText}

表現ルール:
${rulesText}

以下のJSON形式で回答してください（他のテキストは含めない）:
{"severity": "info"|"warning"|"error", "message": "チェック結果の説明", "suggestion": "修正提案（任意）"}`;

		const response = await this.aiGateway.generate(prompt);
		return this.parseCheckResult(response);
	}

	private async runRiskAssessmentCheck(
		segmentText: string,
		source: string,
	): Promise<ParsedCheckResult> {
		const prompt = `以下のテキストの炎上リスクを評価してください。
炎上につながりうる表現、誤解を招く記述、センシティブなトピックの扱いを確認してください。
情報ソース: ${source}

テキスト:
${segmentText}

以下のJSON形式で回答してください（他のテキストは含めない）:
{"severity": "info"|"warning"|"error", "message": "チェック結果の説明", "suggestion": "修正提案（任意）"}`;

		const response = await this.aiGateway.generate(prompt);
		return this.parseCheckResult(response);
	}

	private async runQualityCheck(segmentText: string): Promise<ParsedCheckResult> {
		const prompt = `以下のテキストの文章クオリティを評価してください。
明確さ、読みやすさ、論理的整合性、文法的正確さを確認してください。

テキスト:
${segmentText}

以下のJSON形式で回答してください（他のテキストは含めない）:
{"severity": "info"|"warning"|"error", "message": "チェック結果の説明", "suggestion": "修正提案（任意）"}`;

		const response = await this.aiGateway.generate(prompt);
		return this.parseCheckResult(response);
	}

	private parseCheckResult(response: string): ParsedCheckResult {
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			return { severity: 'info', message: response.trim() };
		}
		try {
			const parsed = JSON.parse(jsonMatch[0]) as {
				severity?: unknown;
				message?: unknown;
				suggestion?: unknown;
			};

			const severity = this.parseSeverity(parsed.severity);
			const message =
				typeof parsed.message === 'string' && parsed.message.trim().length > 0
					? parsed.message
					: 'チェック完了';
			const suggestion = typeof parsed.suggestion === 'string' ? parsed.suggestion : null;

			return { severity, message, suggestion };
		} catch {
			return { severity: 'info', message: response.trim() };
		}
	}

	private parseSeverity(value: unknown): Severity {
		if (value === 'error' || value === 'warning' || value === 'info') {
			return value;
		}
		return 'info';
	}
}
