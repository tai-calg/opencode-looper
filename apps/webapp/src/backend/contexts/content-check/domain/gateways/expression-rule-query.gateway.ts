export type ExpressionRuleQueryResult = {
	id: string;
	ngExpression: string;
	okExpression: string;
};

export interface ExpressionRuleQueryGateway {
	findAllEnabled(): Promise<ExpressionRuleQueryResult[]>;
}
