import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import type { KnowledgeItem } from '../../domain/models/knowledge-item.model';
import type { KnowledgeRepository } from '../../domain/repositories/knowledge.repository';

export class UpdateKnowledgeUseCase {
	constructor(
		private readonly knowledgeRepository: KnowledgeRepository,
		private readonly embeddingGateway: EmbeddingGateway,
	) {}

	async execute(params: {
		id: string;
		title: string;
		sourceType: string;
		content: string;
		sourceUrl?: string;
	}): Promise<KnowledgeItem> {
		const existing = await this.knowledgeRepository.findById(params.id);
		if (!existing) {
			throw new Error('ナレッジが見つかりません');
		}

		const result = existing.update(params);
		if (!result.success) {
			throw new Error(result.error);
		}

		let updated = result.value;
		// content が変更されて embedding がクリアされた場合は再生成
		if (!updated.hasEmbedding) {
			const embedding = await this.embeddingGateway.generateEmbedding(params.content);
			updated = updated.withEmbedding(embedding);
		}

		await this.knowledgeRepository.save(updated);
		return updated;
	}
}
