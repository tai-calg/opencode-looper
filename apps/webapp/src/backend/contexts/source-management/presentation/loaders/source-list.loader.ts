import { createListSourcesUseCase } from '../composition/source-management.composition';

export type SourceListItem = {
	id: string;
	type: string;
	name: string;
	url: string;
	articleCount: number;
	importedCount: number;
	createdAt: string; // ISO 8601
};

export async function loadSourceList(): Promise<SourceListItem[]> {
	const useCase = createListSourcesUseCase();
	const items = await useCase.execute();
	return items.map((item) => ({
		id: item.source.id,
		type: item.source.type,
		name: item.source.name,
		url: item.source.url,
		articleCount: item.articleCount,
		importedCount: item.importedCount,
		createdAt: item.source.createdAt.toISOString(),
	}));
}
