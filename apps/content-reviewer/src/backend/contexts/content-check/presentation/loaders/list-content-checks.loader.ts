import type { ContentCheckListDto } from '@/backend/contexts/content-check/application/usecases/content-check-list.dto';
import type { ContentCheckFilter } from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import type { CheckStatus } from '@/backend/contexts/content-check/domain/models/content-check.model';
import { createListContentChecksUseCase } from '@/backend/contexts/content-check/presentation/composition/content-check.composition';

const VALID_SOURCES = ['web', 'slack'] as const;
const VALID_STATUSES: CheckStatus[] = ['pending', 'processing', 'completed', 'failed'];

export async function loadContentCheckList(params?: {
	source?: string;
	status?: string;
	from?: string;
	to?: string;
}): Promise<ContentCheckListDto> {
	const filter: ContentCheckFilter = {};

	if (params?.source && (VALID_SOURCES as readonly string[]).includes(params.source)) {
		filter.source = params.source as 'web' | 'slack';
	}

	if (params?.status && (VALID_STATUSES as string[]).includes(params.status)) {
		filter.status = params.status as CheckStatus;
	}

	if (params?.from) {
		const date = new Date(params.from);
		if (!Number.isNaN(date.getTime())) {
			filter.createdAfter = date;
		}
	}

	if (params?.to) {
		const date = new Date(params.to);
		if (!Number.isNaN(date.getTime())) {
			filter.createdBefore = date;
		}
	}

	const useCase = createListContentChecksUseCase();
	return useCase.execute(filter);
}
