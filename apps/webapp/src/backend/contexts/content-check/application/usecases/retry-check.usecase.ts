import type { CheckRepository } from '../../domain/repositories/check.repository';

export class RetryCheckUseCase {
	constructor(private readonly checkRepository: CheckRepository) {}

	async execute(params: { checkId: string; sectionId?: string; userId?: string }): Promise<void> {
		const check = await this.checkRepository.findById(params.checkId, params.userId);
		if (!check) {
			throw new Error('チェック結果が見つかりません');
		}

		let updated = check;
		for (const section of check.sections) {
			if (!params.sectionId || section.id === params.sectionId) {
				if (section.status === 'failed' || section.status === 'completed') {
					const resetSection = section.markChecking();
					updated = updated.updateSection(resetSection);
				}
			}
		}

		const recalculated = updated.recalculateStatus();
		await this.checkRepository.save(recalculated);
	}
}
