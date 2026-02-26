'use server';

import { revalidatePath } from 'next/cache';
import { createCreateSourceUseCase } from '../composition/source-management.composition';

export async function createSource(params: {
	type: string;
	name: string;
	url: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createCreateSourceUseCase();
		await useCase.execute(params);
		revalidatePath('/knowledge/sources');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '作成に失敗しました',
		};
	}
}
