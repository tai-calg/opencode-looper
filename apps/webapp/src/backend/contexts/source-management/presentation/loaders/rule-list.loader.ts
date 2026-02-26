import { createListRulesUseCase } from '../composition/source-management.composition';

export type RuleListItem = {
	id: string;
	ngExpression: string;
	okExpression: string;
	description: string | null;
	enabled: boolean;
};

export async function loadRuleList(): Promise<RuleListItem[]> {
	const useCase = createListRulesUseCase();
	const rules = await useCase.execute();
	return rules.map((rule) => ({
		id: rule.id,
		ngExpression: rule.ngExpression,
		okExpression: rule.okExpression,
		description: rule.description,
		enabled: rule.enabled,
	}));
}
