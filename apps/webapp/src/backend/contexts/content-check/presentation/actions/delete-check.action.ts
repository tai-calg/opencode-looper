'use server';

import { getSession } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { createDeleteCheckUseCase } from '../composition/content-check.composition';

export async function deleteCheck(id: string): Promise<{ success: boolean; error?: string }> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: '認証が必要です' };
	}

	try {
		const useCase = createDeleteCheckUseCase();
		await useCase.execute(id, session.id);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '削除に失敗しました',
		};
	}
}
