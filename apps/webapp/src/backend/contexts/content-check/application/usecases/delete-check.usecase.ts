import type { CheckRepository } from '../../domain/repositories/check.repository';

export class DeleteCheckUseCase {
	constructor(private readonly checkRepository: CheckRepository) {}

	async execute(id: string, userId?: string): Promise<void> {
		const check = await this.checkRepository.findById(id, userId);
		if (!check) {
			throw new Error('チェック結果が見つかりません');
		}
		await this.checkRepository.delete(id, userId);
	}
}
