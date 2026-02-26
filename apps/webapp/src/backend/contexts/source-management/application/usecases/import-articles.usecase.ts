import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import type { ArticleFetchGateway } from '../../domain/gateways/article-fetch.gateway';
import { KnowledgeItem } from '../../domain/models/knowledge-item.model';
import type { KnowledgeRepository } from '../../domain/repositories/knowledge.repository';
import type { SourceArticleRepository } from '../../domain/repositories/source-article.repository';

export class ImportArticlesUseCase {
	constructor(
		private readonly sourceArticleRepository: SourceArticleRepository,
		private readonly articleFetchGateway: ArticleFetchGateway,
		private readonly knowledgeRepository: KnowledgeRepository,
		private readonly embeddingGateway: EmbeddingGateway,
	) {}

	async execute(articleIds: string[]): Promise<{ importedCount: number }> {
		const articles = await this.sourceArticleRepository.findByIds(articleIds);
		let importedCount = 0;

		for (const article of articles) {
			if (article.imported) continue;

			// 1. 記事本文を note API から取得
			const content = await this.articleFetchGateway.fetchArticleContent(article.url);

			// 2. KnowledgeItem を作成（sourceArticleId を紐付け）
			const itemResult = KnowledgeItem.create({
				title: article.title,
				sourceType: 'note',
				content,
				sourceUrl: article.url,
				sourceArticleId: article.id,
			});
			if (!itemResult.success) continue;

			// 3. Embedding を生成
			const embedding = await this.embeddingGateway.generateEmbedding(content);
			const itemWithEmbedding = itemResult.value.withEmbedding(embedding);

			// 4. ナレッジを保存
			await this.knowledgeRepository.save(itemWithEmbedding);

			// 5. 記事を取込済みに更新
			const updatedArticle = article.markAsImported();
			await this.sourceArticleRepository.save(updatedArticle);

			importedCount++;
		}

		return { importedCount };
	}
}
