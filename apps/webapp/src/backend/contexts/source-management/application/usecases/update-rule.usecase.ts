import type { ExpressionRule } from '../../domain/models/expression-rule.model';
import type { ExpressionRuleRepository } from '../../domain/repositories/expression-rule.repository';

export class UpdateRuleUseCase {
	constructor(private readonly ruleRepository: ExpressionRuleRepository) {}

	async execute(params: {
		id: string;
		ngExpression: string;
		okExpression: string;
		description?: string;
	}): Promise<ExpressionRule> {
		const existing = await this.ruleRepository.findById(params.id);
		if (!existing) {
			throw new Error('ルールが見つかりません');
		}
		const result = existing.update(params);
		if (!result.success) {
			throw new Error(result.error);
		}
		await this.ruleRepository.save(result.value);
		return result.value;
	}
}
