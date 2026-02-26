import type { ArticleFetchGateway } from '../../domain/gateways/article-fetch.gateway';
import { SourceArticle } from '../../domain/models/source-article.model';
import type { SourceArticleRepository } from '../../domain/repositories/source-article.repository';
import type { SourceRepository } from '../../domain/repositories/source.repository';

export class SyncArticlesUseCase {
	constructor(
		private readonly sourceRepository: SourceRepository,
		private readonly sourceArticleRepository: SourceArticleRepository,
		private readonly articleFetchGateway: ArticleFetchGateway,
	) {}

	async execute(sourceId: string): Promise<{ newCount: number }> {
		const source = await this.sourceRepository.findById(sourceId);
		if (!source) throw new Error('ソースが見つかりません');

		const fetched = await this.articleFetchGateway.fetchArticleList(source.url);
		const existing = await this.sourceArticleRepository.findBySourceId(sourceId);
		const existingUrls = new Set(existing.map((a) => a.url));

		const newArticles: SourceArticle[] = [];
		for (const item of fetched) {
			if (!existingUrls.has(item.url)) {
				const result = SourceArticle.create({
					sourceId,
					title: item.title,
					url: item.url,
					publishedAt: item.publishedAt,
				});
				if (result.success) newArticles.push(result.value);
			}
		}

		if (newArticles.length > 0) {
			await this.sourceArticleRepository.saveMany(newArticles);
		}
		return { newCount: newArticles.length };
	}
}
