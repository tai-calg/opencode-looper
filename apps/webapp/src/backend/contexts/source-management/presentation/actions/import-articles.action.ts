'use server';

import { revalidatePath } from 'next/cache';
import { createImportArticlesUseCase } from '../composition/source-management.composition';

export async function importArticles(
	articleIds: string[],
	sourceId: string,
): Promise<{ success: boolean; importedCount?: number; error?: string }> {
	try {
		const useCase = createImportArticlesUseCase();
		const result = await useCase.execute(articleIds);
		revalidatePath(`/knowledge/sources/${sourceId}`);
		revalidatePath('/knowledge');
		return { success: true, importedCount: result.importedCount };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '取り込みに失敗しました',
		};
	}
}
