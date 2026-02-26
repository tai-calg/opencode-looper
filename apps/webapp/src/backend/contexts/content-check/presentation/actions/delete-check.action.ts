'use server';

import { createDeleteCheckUseCase } from '../composition/content-check.composition';

export async function deleteCheck(id: string): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createDeleteCheckUseCase();
		await useCase.execute(id);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '削除に失敗しました',
		};
	}
}
