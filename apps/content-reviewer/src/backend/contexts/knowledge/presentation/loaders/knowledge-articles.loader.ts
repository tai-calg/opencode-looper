import { createListKnowledgeArticlesUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';

export interface KnowledgeArticleDto {
	id: string;
	title: string;
	content: string;
	sourceUrl: string | null;
	sourceType: 'manual' | 'note';
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export async function loadKnowledgeArticles(): Promise<KnowledgeArticleDto[]> {
	const useCase = createListKnowledgeArticlesUseCase();
	const articles = await useCase.execute();
	return articles.map((article) => ({
		id: article.id as string,
		title: article.title,
		content: article.content,
		sourceUrl: article.sourceUrl,
		sourceType: article.sourceType,
		createdBy: article.createdBy as string,
		createdAt: article.createdAt,
		updatedAt: article.updatedAt,
	}));
}
