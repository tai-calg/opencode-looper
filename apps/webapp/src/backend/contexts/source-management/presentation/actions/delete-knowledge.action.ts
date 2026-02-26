'use server';

import { revalidatePath } from 'next/cache';
import { createDeleteKnowledgeUseCase } from '../composition/source-management.composition';

export async function deleteKnowledge(id: string): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createDeleteKnowledgeUseCase();
		await useCase.execute(id);
		revalidatePath('/knowledge');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '削除に失敗しました',
		};
	}
}
