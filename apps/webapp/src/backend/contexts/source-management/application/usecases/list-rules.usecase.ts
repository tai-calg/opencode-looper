import type { ExpressionRule } from '../../domain/models/expression-rule.model';
import type { ExpressionRuleRepository } from '../../domain/repositories/expression-rule.repository';

export class ListRulesUseCase {
	constructor(private readonly ruleRepository: ExpressionRuleRepository) {}

	async execute(): Promise<ExpressionRule[]> {
		return this.ruleRepository.findAll();
	}
}
