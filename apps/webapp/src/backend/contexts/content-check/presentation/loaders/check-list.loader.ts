import { createListChecksUseCase } from '../composition/content-check.composition';

export type CheckListItem = {
	id: string;
	displayTitle: string;
	platform: string | null;
	source: string;
	status: string;
	createdAt: string;
};

export async function loadCheckList(params?: {
	limit?: number;
	offset?: number;
}): Promise<{ checks: CheckListItem[]; total: number }> {
	const useCase = createListChecksUseCase();
	const { checks, total } = await useCase.execute(params);
	return {
		checks: checks.map((check) => ({
			id: check.id,
			displayTitle: check.displayTitle,
			platform: check.platform,
			source: check.source,
			status: check.status,
			createdAt: check.createdAt.toISOString(),
		})),
		total,
	};
}
