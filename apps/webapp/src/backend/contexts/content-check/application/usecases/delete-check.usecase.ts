import type { CheckRepository } from '../../domain/repositories/check.repository';

export class DeleteCheckUseCase {
	constructor(private readonly checkRepository: CheckRepository) {}

	async execute(id: string): Promise<void> {
		const check = await this.checkRepository.findById(id);
		if (!check) {
			throw new Error('チェック結果が見つかりません');
		}
		await this.checkRepository.delete(id);
	}
}
