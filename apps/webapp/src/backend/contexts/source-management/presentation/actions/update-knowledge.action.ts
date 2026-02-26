'use server';

import { revalidatePath } from 'next/cache';
import { createUpdateKnowledgeUseCase } from '../composition/source-management.composition';

export async function updateKnowledge(
	id: string,
	params: {
		title: string;
		sourceType: string;
		content: string;
		sourceUrl?: string;
	},
): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createUpdateKnowledgeUseCase();
		await useCase.execute({ id, ...params });
		revalidatePath('/knowledge');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '更新に失敗しました',
		};
	}
}
