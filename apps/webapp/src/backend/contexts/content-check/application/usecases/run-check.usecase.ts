import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import type { ExpressionRuleQueryGateway } from '../../domain/gateways/expression-rule-query.gateway';
import type { KnowledgeSearchGateway } from '../../domain/gateways/knowledge-search.gateway';
import { CheckIssue } from '../../domain/models/check-issue.model';
import { CheckSection } from '../../domain/models/check-section.model';
import { Check } from '../../domain/models/check.model';
import type { CheckRepository } from '../../domain/repositories/check.repository';
import { ExpressionCheckUseCase } from './expression-check.usecase';
import { FactCheckUseCase } from './fact-check.usecase';
import { KnowledgeCheckUseCase } from './knowledge-check.usecase';
import { QualityCheckUseCase } from './quality-check.usecase';
import { RiskCheckUseCase } from './risk-check.usecase';
import { SplitContentUseCase } from './split-content.usecase';

export class RunCheckUseCase {
	private readonly splitContentUseCase: SplitContentUseCase;
	private readonly factCheckUseCase: FactCheckUseCase;
	private readonly knowledgeCheckUseCase: KnowledgeCheckUseCase;
	private readonly expressionCheckUseCase: ExpressionCheckUseCase;
	private readonly riskCheckUseCase: RiskCheckUseCase;
	private readonly qualityCheckUseCase: QualityCheckUseCase;

	constructor(
		private readonly checkRepository: CheckRepository,
		aiGateway: AIGateway,
		embeddingGateway: EmbeddingGateway,
		expressionRuleQueryGateway: ExpressionRuleQueryGateway,
		knowledgeSearchGateway: KnowledgeSearchGateway,
	) {
		this.splitContentUseCase = new SplitContentUseCase(aiGateway);
		this.factCheckUseCase = new FactCheckUseCase(aiGateway);
		this.knowledgeCheckUseCase = new KnowledgeCheckUseCase(
			aiGateway,
			embeddingGateway,
			knowledgeSearchGateway,
		);
		this.expressionCheckUseCase = new ExpressionCheckUseCase(aiGateway, expressionRuleQueryGateway);
		this.riskCheckUseCase = new RiskCheckUseCase(aiGateway);
		this.qualityCheckUseCase = new QualityCheckUseCase(aiGateway);
	}

	async execute(params: {
		title?: string;
		platform?: string;
		content: string;
		source?: string;
		slackChannel?: string;
		slackThreadTs?: string;
		userId?: string;
	}): Promise<string> {
		// 1. Check 作成
		const result = Check.create({
			...params,
			source: params.source ?? 'web',
		});
		if (!result.success) {
			throw new Error(result.error);
		}
		let check = result.value;
		await this.checkRepository.save(check);

		// 2. テキスト分割
		const sectionContents = await this.splitContentUseCase.execute(check.content);
		const sections = sectionContents.map((content, index) =>
			CheckSection.create({ sectionIndex: index, content }),
		);
		check = check.addSections(sections);
		await this.checkRepository.save(check);

		// 3. 各セクションを並列チェック（セクション間は直列、観点間は並列）
		for (const section of check.sections) {
			const checkingSection = section.markChecking();
			check = check.updateSection(checkingSection);
			await this.checkRepository.save(check);

			try {
				const issueInputs = await this.runAllChecks(section.content);
				const issues = issueInputs.map((input) =>
					CheckIssue.create({
						category: input.category,
						severity: input.severity,
						quote: input.quote,
						message: input.message,
						suggestion: input.suggestion,
						ruleId: input.ruleId,
					}),
				);
				const completedSection = section.markCompleted(issues);
				check = check.updateSection(completedSection);
			} catch {
				const failedSection = section.markFailed();
				check = check.updateSection(failedSection);
			}

			check = check.recalculateStatus();
			await this.checkRepository.save(check);
		}

		return check.id;
	}

	private async runAllChecks(sectionContent: string): Promise<
		{
			category: 'fact' | 'knowledge' | 'expression' | 'risk' | 'quality';
			severity: 'caution' | 'needs_fix';
			quote: string;
			message: string;
			suggestion?: string;
			ruleId?: string;
		}[]
	> {
		const [factIssues, knowledgeIssues, expressionIssues, riskIssues, qualityIssues] =
			await Promise.all([
				this.factCheckUseCase.execute(sectionContent),
				this.knowledgeCheckUseCase.execute(sectionContent),
				this.expressionCheckUseCase.execute(sectionContent),
				this.riskCheckUseCase.execute(sectionContent),
				this.qualityCheckUseCase.execute(sectionContent),
			]);

		return [
			...factIssues.map((i) => ({ ...i, category: 'fact' as const })),
			...knowledgeIssues.map((i) => ({ ...i, category: 'knowledge' as const })),
			...expressionIssues.map((i) => ({ ...i, category: 'expression' as const })),
			...riskIssues.map((i) => ({ ...i, category: 'risk' as const })),
			...qualityIssues.map((i) => ({ ...i, category: 'quality' as const })),
		];
	}
}
