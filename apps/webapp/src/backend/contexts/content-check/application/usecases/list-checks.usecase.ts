import type { Check } from '../../domain/models/check.model';
import type { CheckRepository } from '../../domain/repositories/check.repository';

export class ListChecksUseCase {
	constructor(private readonly checkRepository: CheckRepository) {}

	async execute(params?: { limit?: number; offset?: number; userId?: string }): Promise<{
		checks: Check[];
		total: number;
	}> {
		const [checks, total] = await Promise.all([
			this.checkRepository.findAll(params),
			this.checkRepository.count(params?.userId),
		]);
		return { checks, total };
	}
}
