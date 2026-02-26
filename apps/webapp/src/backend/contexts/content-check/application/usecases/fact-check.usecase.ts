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

export class FactCheckUseCase {
	constructor(private readonly aiGateway: AIGateway) {}

	async execute(sectionContent: string): Promise<CheckIssueInput[]> {
		const result = await this.aiGateway.generateObjectWithWebSearch(
			`以下のテキストに含まれる事実の主張を検証してください。
Web検索を活用し、事実と異なる記述や不正確な情報を指摘してください。
問題がなければ空の配列を返してください。

テキスト:
${sectionContent}`,
			checkResultSchema,
			'あなたはファクトチェックの専門家です。テキスト内の事実主張をWeb検索で検証し、不正確な情報を指摘してください。',
		);

		return result.issues;
	}
}
