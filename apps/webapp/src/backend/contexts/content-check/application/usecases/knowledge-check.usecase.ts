import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { z } from 'zod';
import type { KnowledgeSearchGateway } from '../../domain/gateways/knowledge-search.gateway';

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

export class KnowledgeCheckUseCase {
	constructor(
		private readonly aiGateway: AIGateway,
		private readonly embeddingGateway: EmbeddingGateway,
		private readonly knowledgeSearchGateway: KnowledgeSearchGateway,
	) {}

	async execute(sectionContent: string): Promise<CheckIssueInput[]> {
		const embedding = await this.embeddingGateway.generateEmbedding(sectionContent);
		const knowledgeItems = await this.knowledgeSearchGateway.searchSimilar(embedding, 5);

		if (knowledgeItems.length === 0) {
			return [];
		}

		const knowledgeContext = knowledgeItems
			.map((k) => `【${k.title}】\n${k.content}`)
			.join('\n\n---\n\n');

		const result = await this.aiGateway.generateObject(
			`以下のテキストが、参照ナレッジの内容と矛盾していないか確認してください。
矛盾や不整合があれば指摘してください。問題がなければ空の配列を返してください。

チェック対象テキスト:
${sectionContent}

参照ナレッジ:
${knowledgeContext}`,
			checkResultSchema,
			'あなたはナレッジ整合性チェックの専門家です。テキストと参照ナレッジの間に矛盾がないか検証してください。',
		);

		return result.issues;
	}
}
