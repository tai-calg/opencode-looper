import type { ContentCheckListDto } from '@/backend/contexts/content-check/application/usecases/content-check-list.dto';
import type { ContentCheckFilter } from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import { createListContentChecksUseCase } from '@/backend/contexts/content-check/presentation/composition/content-check.composition';

export async function loadContentCheckList(
	filter?: ContentCheckFilter,
): Promise<ContentCheckListDto> {
	const useCase = createListContentChecksUseCase();
	return useCase.execute(filter);
}
