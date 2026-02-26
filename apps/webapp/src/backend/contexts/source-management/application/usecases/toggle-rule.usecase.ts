import type { ExpressionRule } from '../../domain/models/expression-rule.model';
import type { ExpressionRuleRepository } from '../../domain/repositories/expression-rule.repository';

export class ToggleRuleUseCase {
	constructor(private readonly ruleRepository: ExpressionRuleRepository) {}

	async execute(id: string): Promise<ExpressionRule> {
		const existing = await this.ruleRepository.findById(id);
		if (!existing) {
			throw new Error('ルールが見つかりません');
		}
		const toggled = existing.toggleEnabled();
		await this.ruleRepository.save(toggled);
		return toggled;
	}
}
