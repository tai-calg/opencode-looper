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

export class RiskCheckUseCase {
	constructor(private readonly aiGateway: AIGateway) {}

	async execute(sectionContent: string): Promise<CheckIssueInput[]> {
		const result = await this.aiGateway.generateObject(
			`以下のテキストについて、SNS等で炎上するリスクがないか分析してください。
日本の社会文化的文脈を踏まえ、以下の観点で判定してください:
- 差別的・偏見的な表現
- 特定の個人・団体への誹謗中傷
- 不適切なジョークや比喩
- 政治的に過度にセンシティブな表現
- 誤解を招きやすい曖昧な表現
問題がなければ空の配列を返してください。

テキスト:
${sectionContent}`,
			checkResultSchema,
			'あなたは日本の政治・メディアに精通した炎上リスク分析の専門家です。SNSでの炎上リスクを分析してください。',
		);

		return result.issues;
	}
}
