'use server';

import { createCreateKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { revalidatePath } from 'next/cache';

<<<<<<< HEAD
const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000001';
=======
const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';
>>>>>>> 2e14ad8a790c4eeb080d80eb1d2b97efc83a09ac

export async function createKnowledgeArticleAction(formData: FormData): Promise<void> {
	const title = formData.get('title');
	const content = formData.get('content');
	const sourceType = formData.get('sourceType');
	const sourceUrl = formData.get('sourceUrl');

	if (typeof title !== 'string' || typeof content !== 'string') {
		throw new Error('title and content are required');
	}

	if (sourceType !== 'manual' && sourceType !== 'note') {
		throw new Error('sourceType must be "manual" or "note"');
	}

	const createdBy = createUserId(
		process.env.NODE_ENV === 'development'
			? DUMMY_USER_ID
			: (process.env.SYSTEM_USER_ID ?? DUMMY_USER_ID),
	);

	const useCase = createCreateKnowledgeArticleUseCase();
	await useCase.execute({
		title,
		content,
		sourceType,
		sourceUrl: typeof sourceUrl === 'string' && sourceUrl.length > 0 ? sourceUrl : null,
		createdBy,
	});

	revalidatePath('/knowledge');
}
