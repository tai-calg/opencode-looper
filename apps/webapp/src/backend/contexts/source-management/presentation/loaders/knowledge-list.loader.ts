import { createListKnowledgeUseCase } from '../composition/source-management.composition';

export type KnowledgeListItem = {
	id: string;
	title: string;
	sourceType: string;
	sourceUrl: string | null;
	content: string;
	createdAt: string; // ISO 8601 文字列（シリアライズ用）
};

export async function loadKnowledgeList(): Promise<KnowledgeListItem[]> {
	const useCase = createListKnowledgeUseCase();
	const items = await useCase.execute();
	return items.map((item) => ({
		id: item.id,
		title: item.title,
		sourceType: item.sourceType,
		sourceUrl: item.sourceUrl,
		content: item.content,
		createdAt: item.createdAt.toISOString(),
	}));
}
