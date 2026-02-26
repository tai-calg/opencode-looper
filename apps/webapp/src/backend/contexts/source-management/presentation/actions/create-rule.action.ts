'use server';

import { revalidatePath } from 'next/cache';
import { createCreateRuleUseCase } from '../composition/source-management.composition';

export async function createRule(params: {
	ngExpression: string;
	okExpression: string;
	description?: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createCreateRuleUseCase();
		await useCase.execute(params);
		revalidatePath('/rules');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '作成に失敗しました',
		};
	}
}
