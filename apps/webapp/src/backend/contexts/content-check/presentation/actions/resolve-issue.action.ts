'use server';

import { getSession } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { revalidatePath } from 'next/cache';
import { createResolveIssueUseCase } from '../composition/content-check.composition';

export async function resolveIssue(
	checkId: string,
	issueId: string,
): Promise<{ success: boolean; error?: string }> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: '認証が必要です' };
	}

	try {
		const useCase = createResolveIssueUseCase();
		await useCase.execute({ checkId, issueId, userId: session.id });
		revalidatePath(`/checks/${checkId}`);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '更新に失敗しました',
		};
	}
}
