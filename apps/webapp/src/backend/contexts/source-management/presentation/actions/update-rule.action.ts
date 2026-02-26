'use server';

import { revalidatePath } from 'next/cache';
import { createUpdateRuleUseCase } from '../composition/source-management.composition';

export async function updateRule(
	id: string,
	params: {
		ngExpression: string;
		okExpression: string;
		description?: string;
	},
): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createUpdateRuleUseCase();
		await useCase.execute({ id, ...params });
		revalidatePath('/rules');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '更新に失敗しました',
		};
	}
}
