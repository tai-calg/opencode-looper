import { ExpressionRule } from '../../domain/models/expression-rule.model';
import type { ExpressionRuleRepository } from '../../domain/repositories/expression-rule.repository';

export class CreateRuleUseCase {
	constructor(private readonly ruleRepository: ExpressionRuleRepository) {}

	async execute(params: {
		ngExpression: string;
		okExpression: string;
		description?: string;
	}): Promise<ExpressionRule> {
		const result = ExpressionRule.create(params);
		if (!result.success) {
			throw new Error(result.error);
		}
		await this.ruleRepository.save(result.value);
		return result.value;
	}
}
