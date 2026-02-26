import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { KnowledgeItem } from '../../domain/models/knowledge-item.model';
import type { KnowledgeRepository } from '../../domain/repositories/knowledge.repository';

export class CreateKnowledgeUseCase {
	constructor(
		private readonly knowledgeRepository: KnowledgeRepository,
		private readonly embeddingGateway: EmbeddingGateway,
	) {}

	async execute(params: {
		title: string;
		sourceType: string;
		content: string;
		sourceUrl?: string;
	}): Promise<KnowledgeItem> {
		const result = KnowledgeItem.create(params);
		if (!result.success) {
			throw new Error(result.error);
		}

		const embedding = await this.embeddingGateway.generateEmbedding(params.content);
		const itemWithEmbedding = result.value.withEmbedding(embedding);

		await this.knowledgeRepository.save(itemWithEmbedding);
		return itemWithEmbedding;
	}
}
