'use server';

import { revalidatePath } from 'next/cache';
import { createCreateKnowledgeUseCase } from '../composition/source-management.composition';

export async function createKnowledge(params: {
	title: string;
	sourceType: string;
	content: string;
	sourceUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createCreateKnowledgeUseCase();
		await useCase.execute(params);
		revalidatePath('/knowledge');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '作成に失敗しました',
		};
	}
}
