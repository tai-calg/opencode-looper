import { createGetSourceDetailUseCase } from '../composition/source-management.composition';

export type SourceDetailData = {
	source: {
		id: string;
		type: string;
		name: string;
		url: string;
		createdAt: string;
	};
	articles: {
		id: string;
		title: string;
		url: string;
		publishedAt: string | null;
		imported: boolean;
		knowledgeItemId: string | null;
	}[];
};

export async function loadSourceDetail(sourceId: string): Promise<SourceDetailData> {
	const useCase = createGetSourceDetailUseCase();
	const result = await useCase.execute(sourceId);
	return {
		source: {
			id: result.source.id,
			type: result.source.type,
			name: result.source.name,
			url: result.source.url,
			createdAt: result.source.createdAt.toISOString(),
		},
		articles: result.articles.map((a) => ({
			id: a.id,
			title: a.title,
			url: a.url,
			publishedAt: a.publishedAt?.toISOString() ?? null,
			imported: a.imported,
			knowledgeItemId: result.knowledgeMapping.get(a.id) ?? null,
		})),
	};
}
