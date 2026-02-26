'use server';

import { createRunCheckUseCase } from '../composition/content-check.composition';

export async function createCheck(params: {
	title?: string;
	platform?: string;
	content: string;
}): Promise<{ success: boolean; error?: string; checkId?: string }> {
	try {
		const useCase = createRunCheckUseCase();
		// バックグラウンドでチェックを開始し、即座に ID を返す
		const checkId = await useCase.execute({
			...params,
			source: 'web',
		});
		return { success: true, checkId };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'チェックの開始に失敗しました',
		};
	}
}
