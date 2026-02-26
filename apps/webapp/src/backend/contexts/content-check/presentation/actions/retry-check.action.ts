'use server';

import { revalidatePath } from 'next/cache';
import { createRetryCheckUseCase } from '../composition/content-check.composition';

export async function retryCheck(
	checkId: string,
	sectionId?: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createRetryCheckUseCase();
		await useCase.execute({ checkId, sectionId });
		revalidatePath(`/checks/${checkId}`);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '再チェックに失敗しました',
		};
	}
}
