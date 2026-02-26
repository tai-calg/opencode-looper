'use server';

import { getSession } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { revalidatePath } from 'next/cache';
import { createRetryCheckUseCase } from '../composition/content-check.composition';

export async function retryCheck(
	checkId: string,
	sectionId?: string,
): Promise<{ success: boolean; error?: string }> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: '認証が必要です' };
	}

	try {
		const useCase = createRetryCheckUseCase();
		await useCase.execute({ checkId, sectionId, userId: session.id });
		revalidatePath(`/checks/${checkId}`);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '再チェックに失敗しました',
		};
	}
}
