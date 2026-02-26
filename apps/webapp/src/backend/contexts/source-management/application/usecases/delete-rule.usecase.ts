import type { ExpressionRuleRepository } from '../../domain/repositories/expression-rule.repository';

export class DeleteRuleUseCase {
	constructor(private readonly ruleRepository: ExpressionRuleRepository) {}

	async execute(id: string): Promise<void> {
		const existing = await this.ruleRepository.findById(id);
		if (!existing) {
			throw new Error('ルールが見つかりません');
		}
		await this.ruleRepository.delete(id);
	}
}
