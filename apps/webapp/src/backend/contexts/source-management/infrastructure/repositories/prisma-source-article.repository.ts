import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import { SourceArticle } from '../../domain/models/source-article.model';
import type { SourceArticleRepository } from '../../domain/repositories/source-article.repository';

export class PrismaSourceArticleRepository implements SourceArticleRepository {
	async findBySourceId(sourceId: string): Promise<SourceArticle[]> {
		const rows = await prisma.sourceArticle.findMany({
			where: { sourceId },
			orderBy: { publishedAt: 'desc' },
		});
		return rows.map((row) => this.toDomain(row));
	}

	async findByIds(ids: string[]): Promise<SourceArticle[]> {
		const rows = await prisma.sourceArticle.findMany({ where: { id: { in: ids } } });
		return rows.map((row) => this.toDomain(row));
	}

	async save(article: SourceArticle): Promise<void> {
		await prisma.sourceArticle.upsert({
			where: { id: article.id },
			create: {
				id: article.id,
				sourceId: article.sourceId,
				title: article.title,
				url: article.url,
				publishedAt: article.publishedAt?.toDate() ?? null,
				imported: article.imported,
				createdAt: article.createdAt.toDate(),
			},
			update: {
				title: article.title,
				imported: article.imported,
			},
		});
	}

	async saveMany(articles: SourceArticle[]): Promise<void> {
		await prisma.sourceArticle.createMany({
			data: articles.map((a) => ({
				id: a.id,
				sourceId: a.sourceId,
				title: a.title,
				url: a.url,
				publishedAt: a.publishedAt?.toDate() ?? null,
				imported: a.imported,
				createdAt: a.createdAt.toDate(),
			})),
			skipDuplicates: true,
		});
	}

	async countBySourceId(sourceId: string): Promise<{ total: number; imported: number }> {
		const [total, imported] = await Promise.all([
			prisma.sourceArticle.count({ where: { sourceId } }),
			prisma.sourceArticle.count({ where: { sourceId, imported: true } }),
		]);
		return { total, imported };
	}

	private toDomain(row: {
		id: string;
		sourceId: string;
		title: string;
		url: string;
		publishedAt: Date | null;
		imported: boolean;
		createdAt: Date;
	}): SourceArticle {
		return SourceArticle.reconstruct({
			id: row.id,
			sourceId: row.sourceId,
			title: row.title,
			url: row.url,
			publishedAt: row.publishedAt ? Timestamp.fromDate(row.publishedAt) : null,
			imported: row.imported,
			createdAt: Timestamp.fromDate(row.createdAt),
		});
	}
}
