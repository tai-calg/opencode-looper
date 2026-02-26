import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import type {
	ExpressionRuleQueryGateway,
	ExpressionRuleQueryResult,
} from '../../domain/gateways/expression-rule-query.gateway';

export class PrismaExpressionRuleQueryAdapter implements ExpressionRuleQueryGateway {
	async findAllEnabled(): Promise<ExpressionRuleQueryResult[]> {
		const rows = await prisma.expressionRule.findMany({
			where: { enabled: true },
			select: { id: true, ngExpression: true, okExpression: true },
		});
		return rows;
	}
}
