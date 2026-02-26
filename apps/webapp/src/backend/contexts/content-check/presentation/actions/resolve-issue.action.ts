'use server';

import { revalidatePath } from 'next/cache';
import { createResolveIssueUseCase } from '../composition/content-check.composition';

export async function resolveIssue(
	checkId: string,
	issueId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const useCase = createResolveIssueUseCase();
		await useCase.execute({ checkId, issueId });
		revalidatePath(`/checks/${checkId}`);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '更新に失敗しました',
		};
	}
}
