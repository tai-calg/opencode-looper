'use server';

import { getSession } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { z } from 'zod';
import { createRunCheckUseCase } from '../composition/content-check.composition';

const CreateCheckSchema = z.object({
	content: z.string().min(1, '本文は必須です').max(30000, '本文は30,000文字以内で入力してください'),
	platform: z.enum(['youtube', 'x', 'note', 'other']).optional(),
	title: z.string().max(200, 'タイトルは200文字以内で入力してください').optional(),
});

export async function createCheck(params: {
	title?: string;
	platform?: string;
	content: string;
}): Promise<{ success: boolean; error?: string; checkId?: string }> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: '認証が必要です' };
	}

	const parsed = CreateCheckSchema.safeParse(params);
	if (!parsed.success) {
		return { success: false, error: '入力内容が不正です' };
	}

	try {
		const useCase = createRunCheckUseCase();
		// バックグラウンドでチェックを開始し、即座に ID を返す
		const checkId = await useCase.execute({
			...parsed.data,
			source: 'web',
			userId: session.id,
		});
		return { success: true, checkId };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'チェックの開始に失敗しました',
		};
	}
}
