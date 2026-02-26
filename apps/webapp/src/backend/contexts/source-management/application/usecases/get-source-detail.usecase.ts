import type { SourceArticle } from '../../domain/models/source-article.model';
import type { Source } from '../../domain/models/source.model';
import type { KnowledgeRepository } from '../../domain/repositories/knowledge.repository';
import type { SourceArticleRepository } from '../../domain/repositories/source-article.repository';
import type { SourceRepository } from '../../domain/repositories/source.repository';

export type SourceDetailResult = {
	source: Source;
	articles: SourceArticle[];
	knowledgeMapping: Map<string, string>; // sourceArticleId → knowledgeItemId
};

export class GetSourceDetailUseCase {
	constructor(
		private readonly sourceRepository: SourceRepository,
		private readonly sourceArticleRepository: SourceArticleRepository,
		private readonly knowledgeRepository: KnowledgeRepository,
	) {}

	async execute(sourceId: string): Promise<SourceDetailResult> {
		const source = await this.sourceRepository.findById(sourceId);
		if (!source) throw new Error('ソースが見つかりません');

		const articles = await this.sourceArticleRepository.findBySourceId(sourceId);
		const importedArticleIds = articles.filter((a) => a.imported).map((a) => a.id);

		let knowledgeMapping = new Map<string, string>();
		if (importedArticleIds.length > 0) {
			const knowledgeItems =
				await this.knowledgeRepository.findBySourceArticleIds(importedArticleIds);
			knowledgeMapping = new Map(
				knowledgeItems
					.filter((k): k is typeof k & { sourceArticleId: string } => k.sourceArticleId !== null)
					.map((k) => [k.sourceArticleId, k.id]),
			);
		}

		return { source, articles, knowledgeMapping };
	}
}
