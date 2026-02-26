import type { Check } from '../../domain/models/check.model';
import type { CheckRepository } from '../../domain/repositories/check.repository';

export class GetCheckDetailUseCase {
	constructor(private readonly checkRepository: CheckRepository) {}

	async execute(id: string, userId?: string): Promise<Check> {
		const check = await this.checkRepository.findById(id, userId);
		if (!check) {
			throw new Error('チェック結果が見つかりません');
		}
		return check;
	}
}
