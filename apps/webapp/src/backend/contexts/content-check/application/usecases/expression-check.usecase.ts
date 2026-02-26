import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import { z } from 'zod';
import type { ExpressionRuleQueryGateway } from '../../domain/gateways/expression-rule-query.gateway';

const checkResultSchema = z.object({
	issues: z.array(
		z.object({
			quote: z.string().describe('該当箇所の原文引用'),
			message: z.string().describe('指摘メッセージ'),
			suggestion: z.string().optional().describe('修正案'),
			severity: z.enum(['caution', 'needs_fix']).describe('重要度'),
			ruleId: z.string().optional().describe('違反したルールのID'),
		}),
	),
});

type CheckIssueInput = {
	quote: string;
	message: string;
	suggestion?: string;
	severity: 'caution' | 'needs_fix';
	ruleId?: string;
};

export class ExpressionCheckUseCase {
	constructor(
		private readonly aiGateway: AIGateway,
		private readonly expressionRuleQueryGateway: ExpressionRuleQueryGateway,
	) {}

	async execute(sectionContent: string): Promise<CheckIssueInput[]> {
		const rules = await this.expressionRuleQueryGateway.findAllEnabled();

		if (rules.length === 0) {
			return [];
		}

		const rulesContext = rules
			.map((r) => `- ID: ${r.id} | NG: 「${r.ngExpression}」 → OK: 「${r.okExpression}」`)
			.join('\n');

		const result = await this.aiGateway.generateObject(
			`以下のテキストが表現ルールに違反していないか確認してください。
違反がある場合、該当箇所を引用し、どのルールに違反しているか ruleId を含めて指摘してください。
問題がなければ空の配列を返してください。

チェック対象テキスト:
${sectionContent}

表現ルール一覧:
${rulesContext}`,
			checkResultSchema,
			'あなたは表現ルールチェックの専門家です。テキストが定められた表現ルールに違反していないか検証してください。',
		);

		return result.issues;
	}
}
