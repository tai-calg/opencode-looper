'use server';

import { revalidatePath } from 'next/cache';
import { createSyncArticlesUseCase } from '../composition/source-management.composition';

export async function syncArticles(
	sourceId: string,
): Promise<{ success: boolean; newCount?: number; error?: string }> {
	try {
		const useCase = createSyncArticlesUseCase();
		const result = await useCase.execute(sourceId);
		revalidatePath(`/knowledge/sources/${sourceId}`);
		return { success: true, newCount: result.newCount };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '同期に失敗しました',
		};
	}
}
