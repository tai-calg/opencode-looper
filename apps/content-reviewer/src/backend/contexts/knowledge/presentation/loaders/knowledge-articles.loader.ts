import { createListKnowledgeArticlesUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';

<<<<<<< HEAD
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
=======
export interface KnowledgeArticleDTO {
	id: string;
	title: string;
	content: string;
	sourceType: 'manual' | 'note';
	sourceUrl: string | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export async function loadKnowledgeArticles(): Promise<KnowledgeArticleDTO[]> {
>>>>>>> 2e14ad8a790c4eeb080d80eb1d2b97efc83a09ac
	const useCase = createListKnowledgeArticlesUseCase();
	const articles = await useCase.execute();
	return articles.map((article) => ({
		id: article.id as string,
		title: article.title,
		content: article.content,
<<<<<<< HEAD
		sourceUrl: article.sourceUrl,
		sourceType: article.sourceType,
		createdBy: article.createdBy as string,
		createdAt: article.createdAt,
		updatedAt: article.updatedAt,
=======
		sourceType: article.sourceType,
		sourceUrl: article.sourceUrl,
		createdBy: article.createdBy as string,
		createdAt: article.createdAt.toISOString(),
		updatedAt: article.updatedAt.toISOString(),
>>>>>>> 2e14ad8a790c4eeb080d80eb1d2b97efc83a09ac
	}));
}
