import { createListExpressionRulesUseCase } from '@/backend/contexts/expression-rule/presentation/composition/expression-rule.composition';

<<<<<<< HEAD
export interface ExpressionRuleDto {
=======
export interface ExpressionRuleDTO {
>>>>>>> 2e14ad8a790c4eeb080d80eb1d2b97efc83a09ac
	id: string;
	ngExpression: string;
	recommendedExpression: string;
	description: string | null;
	isActive: boolean;
	createdBy: string;
<<<<<<< HEAD
	createdAt: Date;
	updatedAt: Date;
}

export async function loadExpressionRules(): Promise<ExpressionRuleDto[]> {
=======
	createdAt: string;
	updatedAt: string;
}

export async function loadExpressionRules(): Promise<ExpressionRuleDTO[]> {
>>>>>>> 2e14ad8a790c4eeb080d80eb1d2b97efc83a09ac
	const useCase = createListExpressionRulesUseCase();
	const rules = await useCase.execute({});
	return rules.map((rule) => ({
		id: rule.id as string,
		ngExpression: rule.ngExpression,
		recommendedExpression: rule.recommendedExpression,
		description: rule.description,
		isActive: rule.isActive,
		createdBy: rule.createdBy as string,
<<<<<<< HEAD
		createdAt: rule.createdAt,
		updatedAt: rule.updatedAt,
=======
		createdAt: rule.createdAt.toISOString(),
		updatedAt: rule.updatedAt.toISOString(),
>>>>>>> 2e14ad8a790c4eeb080d80eb1d2b97efc83a09ac
	}));
}
