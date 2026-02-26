import type { SourceArticle } from '../models/source-article.model';

export interface SourceArticleRepository {
	findBySourceId(sourceId: string): Promise<SourceArticle[]>;
	findByIds(ids: string[]): Promise<SourceArticle[]>;
	save(article: SourceArticle): Promise<void>;
	saveMany(articles: SourceArticle[]): Promise<void>;
	countBySourceId(sourceId: string): Promise<{ total: number; imported: number }>;
}
