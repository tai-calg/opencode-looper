import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import type {
	Check as PrismaCheck,
	CheckIssue as PrismaCheckIssue,
	CheckSection as PrismaCheckSection,
} from '@prisma/client';
import type { CheckCategory } from '../../domain/models/check-category.model';
import { CheckIssue } from '../../domain/models/check-issue.model';
import { CheckSection, type SectionStatus } from '../../domain/models/check-section.model';
import { Check } from '../../domain/models/check.model';
import type { Severity } from '../../domain/models/severity.model';
import type { CheckRepository } from '../../domain/repositories/check.repository';

export class PrismaCheckRepository implements CheckRepository {
	async findById(id: string, userId?: string): Promise<Check | null> {
		const row = await prisma.check.findFirst({
			where: { id, ...(userId !== undefined ? { userId } : {}) },
			include: {
				sections: {
					include: { issues: true },
					orderBy: { sectionIndex: 'asc' },
				},
			},
		});
		return row ? this.toDomain(row) : null;
	}

	async findAll(params?: { limit?: number; offset?: number; userId?: string }): Promise<Check[]> {
		const rows = await prisma.check.findMany({
			where: params?.userId !== undefined ? { userId: params.userId } : {},
			orderBy: { createdAt: 'desc' },
			take: params?.limit ?? 20,
			skip: params?.offset ?? 0,
			include: {
				sections: {
					include: { issues: true },
					orderBy: { sectionIndex: 'asc' },
				},
			},
		});
		return rows.map((row) => this.toDomain(row));
	}

	async save(check: Check): Promise<void> {
		await prisma.$transaction(async (tx) => {
			// 1. Check 本体を upsert
			await tx.check.upsert({
				where: { id: check.id },
				create: {
					id: check.id,
					title: check.title,
					platform: check.platform,
					content: check.content,
					source: check.source,
					slackChannel: check.slackChannel,
					slackThreadTs: check.slackThreadTs,
					userId: check.userId,
					status: check.status,
					createdAt: check.createdAt.toDate(),
				},
				update: {
					title: check.title,
					platform: check.platform,
					status: check.status,
				},
			});

			// 2. 既存の sections と issues を削除して再作成
			await tx.checkIssue.deleteMany({
				where: { section: { checkId: check.id } },
			});
			await tx.checkSection.deleteMany({
				where: { checkId: check.id },
			});

			// 3. sections + issues を作成
			for (const section of check.sections) {
				await tx.checkSection.create({
					data: {
						id: section.id,
						checkId: check.id,
						sectionIndex: section.sectionIndex,
						content: section.content,
						status: section.status,
						createdAt: section.createdAt.toDate(),
					},
				});
				for (const issue of section.issues) {
					await tx.checkIssue.create({
						data: {
							id: issue.id,
							sectionId: section.id,
							category: issue.category,
							severity: issue.severity,
							quote: issue.quote,
							message: issue.message,
							suggestion: issue.suggestion,
							ruleId: issue.ruleId,
							resolved: issue.resolved,
							createdAt: issue.createdAt.toDate(),
						},
					});
				}
			}
		});
	}

	async delete(id: string, userId?: string): Promise<void> {
		if (userId !== undefined) {
			const result = await prisma.check.deleteMany({ where: { id, userId } });
			if (result.count === 0) {
				throw new Error('チェック結果が見つかりません');
			}
		} else {
			await prisma.check.delete({ where: { id } });
		}
	}

	async count(userId?: string): Promise<number> {
		return prisma.check.count(userId !== undefined ? { where: { userId } } : undefined);
	}

	private toDomain(
		row: PrismaCheck & {
			sections: (PrismaCheckSection & { issues: PrismaCheckIssue[] })[];
		},
	): Check {
		const sections = row.sections.map((s) => {
			const issues = s.issues.map((i) =>
				CheckIssue.reconstruct({
					id: i.id,
					category: i.category as CheckCategory,
					severity: i.severity as Severity,
					quote: i.quote,
					message: i.message,
					suggestion: i.suggestion,
					ruleId: i.ruleId,
					resolved: i.resolved,
					createdAt: Timestamp.fromDate(i.createdAt),
				}),
			);
			return CheckSection.reconstruct({
				id: s.id,
				sectionIndex: s.sectionIndex,
				content: s.content,
				status: s.status as SectionStatus,
				issues,
				createdAt: Timestamp.fromDate(s.createdAt),
			});
		});

		return Check.reconstruct({
			id: row.id,
			title: row.title,
			platform: row.platform,
			content: row.content,
			source: row.source,
			slackChannel: row.slackChannel,
			slackThreadTs: row.slackThreadTs,
			userId: row.userId,
			status: row.status as 'processing' | 'completed' | 'failed',
			sections,
			createdAt: Timestamp.fromDate(row.createdAt),
		});
	}
}
