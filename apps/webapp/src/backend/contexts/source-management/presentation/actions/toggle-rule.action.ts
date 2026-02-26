'use server';

import { revalidatePath } from 'next/cache';
import { createToggleRuleUseCase } from '../composition/source-management.composition';

export async function toggleRule(id: string): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createToggleRuleUseCase();
		await useCase.execute(id);
		revalidatePath('/rules');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '切替に失敗しました',
		};
	}
}
