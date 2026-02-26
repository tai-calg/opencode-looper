import type {
	ExpressionRuleQueryGateway,
	ExpressionRuleQueryResult,
} from '../../domain/gateways/expression-rule-query.gateway';

export class StubExpressionRuleQueryAdapter implements ExpressionRuleQueryGateway {
	async findAllEnabled(): Promise<ExpressionRuleQueryResult[]> {
		return [
			{ id: 'stub-rule-1', ngExpression: 'させていただく', okExpression: 'いたします' },
			{ id: 'stub-rule-2', ngExpression: '問題ない', okExpression: '問題はない' },
		];
	}
}
