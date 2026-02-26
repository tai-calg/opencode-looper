import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import type {
	KnowledgeSearchGateway,
	KnowledgeSearchResult,
} from '../../domain/gateways/knowledge-search.gateway';

export class PgvectorKnowledgeSearchAdapter implements KnowledgeSearchGateway {
	async searchSimilar(embedding: number[], limit: number): Promise<KnowledgeSearchResult[]> {
		const embeddingStr = `[${embedding.join(',')}]`;
		const results = await prisma.$queryRaw<
			{ id: string; title: string; content: string; similarity: number }[]
		>`
			SELECT
				id,
				title,
				content,
				1 - (embedding <=> ${embeddingStr}::vector) as similarity
			FROM knowledge_items
			WHERE embedding IS NOT NULL
			ORDER BY embedding <=> ${embeddingStr}::vector
			LIMIT ${limit}
		`;
		return results;
	}
}
