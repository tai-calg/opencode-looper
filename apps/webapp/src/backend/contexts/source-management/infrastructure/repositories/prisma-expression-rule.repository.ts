import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import type { ExpressionRule as PrismaExpressionRule } from '@prisma/client';
import { ExpressionRule } from '../../domain/models/expression-rule.model';
import type { ExpressionRuleRepository } from '../../domain/repositories/expression-rule.repository';

export class PrismaExpressionRuleRepository implements ExpressionRuleRepository {
	async findAll(): Promise<ExpressionRule[]> {
		const rows = await prisma.expressionRule.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return rows.map(this.toDomain);
	}

	async findById(id: string): Promise<ExpressionRule | null> {
		const row = await prisma.expressionRule.findUnique({ where: { id } });
		return row ? this.toDomain(row) : null;
	}

	async save(rule: ExpressionRule): Promise<void> {
		await prisma.expressionRule.upsert({
			where: { id: rule.id },
			create: {
				id: rule.id,
				ngExpression: rule.ngExpression,
				okExpression: rule.okExpression,
				description: rule.description,
				enabled: rule.enabled,
				createdAt: rule.createdAt.toDate(),
				updatedAt: rule.updatedAt.toDate(),
			},
			update: {
				ngExpression: rule.ngExpression,
				okExpression: rule.okExpression,
				description: rule.description,
				enabled: rule.enabled,
				updatedAt: rule.updatedAt.toDate(),
			},
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.expressionRule.delete({ where: { id } });
	}

	private toDomain(row: PrismaExpressionRule): ExpressionRule {
		return ExpressionRule.reconstruct({
			id: row.id,
			ngExpression: row.ngExpression,
			okExpression: row.okExpression,
			description: row.description,
			enabled: row.enabled,
			createdAt: Timestamp.fromDate(row.createdAt),
			updatedAt: Timestamp.fromDate(row.updatedAt),
		});
	}
}
