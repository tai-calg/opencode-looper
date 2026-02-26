import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import { z } from 'zod';

const checkResultSchema = z.object({
	issues: z.array(
		z.object({
			quote: z.string().describe('該当箇所の原文引用'),
			message: z.string().describe('指摘メッセージ'),
			suggestion: z.string().optional().describe('修正案'),
			severity: z.enum(['caution', 'needs_fix']).describe('重要度'),
		}),
	),
});

type CheckIssueInput = {
	quote: string;
	message: string;
	suggestion?: string;
	severity: 'caution' | 'needs_fix';
};

export class QualityCheckUseCase {
	constructor(private readonly aiGateway: AIGateway) {}

	async execute(sectionContent: string): Promise<CheckIssueInput[]> {
		const result = await this.aiGateway.generateObject(
			`以下のテキストの文章品質をチェックしてください。
以下の観点で問題を指摘してください:
- 誤字脱字
- 文法エラー
- 同一動詞の過度な繰り返し
- 冗長な表現
- 主語と述語のねじれ
問題がなければ空の配列を返してください。

テキスト:
${sectionContent}`,
			checkResultSchema,
			'あなたは日本語の文章校正の専門家です。テキストの品質問題を指摘してください。',
		);

		return result.issues;
	}
}
