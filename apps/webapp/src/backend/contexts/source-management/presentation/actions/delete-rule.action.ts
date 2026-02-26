'use server';

import { revalidatePath } from 'next/cache';
import { createDeleteRuleUseCase } from '../composition/source-management.composition';

export async function deleteRule(id: string): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createDeleteRuleUseCase();
		await useCase.execute(id);
		revalidatePath('/rules');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '削除に失敗しました',
		};
	}
}
