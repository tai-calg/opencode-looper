import { createListExpressionRulesUseCase } from '@/backend/contexts/expression-rule/presentation/composition/expression-rule.composition';

export interface ExpressionRuleDto {
	id: string;
	ngExpression: string;
	recommendedExpression: string;
	description: string | null;
	isActive: boolean;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export async function loadExpressionRules(): Promise<ExpressionRuleDto[]> {
	const useCase = createListExpressionRulesUseCase();
	const rules = await useCase.execute({});
	return rules.map((rule) => ({
		id: rule.id as string,
		ngExpression: rule.ngExpression,
		recommendedExpression: rule.recommendedExpression,
		description: rule.description,
		isActive: rule.isActive,
		createdBy: rule.createdBy as string,
		createdAt: rule.createdAt,
		updatedAt: rule.updatedAt,
	}));
}
