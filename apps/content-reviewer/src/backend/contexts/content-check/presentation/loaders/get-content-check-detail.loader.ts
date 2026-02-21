import type { ContentCheckDetailDto } from '@/backend/contexts/content-check/application/usecases/content-check-detail.dto';
import { createGetContentCheckDetailUseCase } from '@/backend/contexts/content-check/presentation/composition/content-check.composition';

export async function loadContentCheckDetail(id: string): Promise<ContentCheckDetailDto> {
	const useCase = createGetContentCheckDetailUseCase();
	return useCase.execute(id);
}
