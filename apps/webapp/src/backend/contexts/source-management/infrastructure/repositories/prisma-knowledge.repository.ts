import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import { KnowledgeItem } from '../../domain/models/knowledge-item.model';
import type { SourceType } from '../../domain/models/source-type.model';
import type { KnowledgeRepository } from '../../domain/repositories/knowledge.repository';

export class PrismaKnowledgeRepository implements KnowledgeRepository {
	async findAll(): Promise<KnowledgeItem[]> {
		const rows = await prisma.knowledgeItem.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return rows.map((row) => this.toDomain(row));
	}

	async findById(id: string): Promise<KnowledgeItem | null> {
		const row = await prisma.knowledgeItem.findUnique({ where: { id } });
		return row ? this.toDomain(row) : null;
	}

	async save(item: KnowledgeItem): Promise<void> {
		// 1. Prisma upsert で通常フィールドを保存（embedding は Unsupported 型のため除外）
		await prisma.knowledgeItem.upsert({
			where: { id: item.id },
			create: {
				id: item.id,
				title: item.title,
				sourceType: item.sourceType,
				sourceUrl: item.sourceUrl,
				content: item.content,
				sourceArticleId: item.sourceArticleId,
				createdAt: item.createdAt.toDate(),
				updatedAt: item.updatedAt.toDate(),
			},
			update: {
				title: item.title,
				sourceType: item.sourceType,
				sourceUrl: item.sourceUrl,
				content: item.content,
				updatedAt: item.updatedAt.toDate(),
			},
		});

		// 2. embedding がある場合は pgvector 型で直接書き込み
		if (item.embedding) {
			const embeddingStr = `[${item.embedding.join(',')}]`;
			await prisma.$executeRaw`
				UPDATE knowledge_items
				SET embedding = ${embeddingStr}::vector
				WHERE id = ${item.id}::uuid
			`;
		}
	}

	async delete(id: string): Promise<void> {
		await prisma.knowledgeItem.delete({ where: { id } });
	}

	async findBySourceArticleIds(sourceArticleIds: string[]): Promise<KnowledgeItem[]> {
		if (sourceArticleIds.length === 0) return [];
		const rows = await prisma.knowledgeItem.findMany({
			where: { sourceArticleId: { in: sourceArticleIds } },
		});
		return rows.map((row) => this.toDomain(row));
	}

	private toDomain(row: {
		id: string;
		title: string;
		sourceType: string;
		sourceUrl: string | null;
		content: string;
		sourceArticleId: string | null;
		createdAt: Date;
		updatedAt: Date;
	}): KnowledgeItem {
		return KnowledgeItem.reconstruct({
			id: row.id,
			title: row.title,
			sourceType: row.sourceType as SourceType,
			sourceUrl: row.sourceUrl,
			content: row.content,
			embedding: null, // Prisma の通常クエリでは Unsupported 型は返されない
			sourceArticleId: row.sourceArticleId,
			createdAt: Timestamp.fromDate(row.createdAt),
			updatedAt: Timestamp.fromDate(row.updatedAt),
		});
	}
}
