import type { ExpressionRule } from '../models/expression-rule.model';

export interface ExpressionRuleRepository {
	findAll(): Promise<ExpressionRule[]>;
	findById(id: string): Promise<ExpressionRule | null>;
	save(rule: ExpressionRule): Promise<void>;
	delete(id: string): Promise<void>;
}
