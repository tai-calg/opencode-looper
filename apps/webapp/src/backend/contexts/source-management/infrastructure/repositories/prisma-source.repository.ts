import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import { Source } from '../../domain/models/source.model';
import type { SourceRepository } from '../../domain/repositories/source.repository';

export class PrismaSourceRepository implements SourceRepository {
	async findAll(): Promise<Source[]> {
		const rows = await prisma.source.findMany({ orderBy: { createdAt: 'desc' } });
		return rows.map((row) => this.toDomain(row));
	}

	async findById(id: string): Promise<Source | null> {
		const row = await prisma.source.findUnique({ where: { id } });
		return row ? this.toDomain(row) : null;
	}

	async save(source: Source): Promise<void> {
		await prisma.source.upsert({
			where: { id: source.id },
			create: {
				id: source.id,
				type: source.type,
				name: source.name,
				url: source.url,
				createdAt: source.createdAt.toDate(),
				updatedAt: source.updatedAt.toDate(),
			},
			update: {
				type: source.type,
				name: source.name,
				url: source.url,
				updatedAt: source.updatedAt.toDate(),
			},
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.source.delete({ where: { id } });
	}

	private toDomain(row: {
		id: string;
		type: string;
		name: string;
		url: string;
		createdAt: Date;
		updatedAt: Date;
	}): Source {
		return Source.reconstruct({
			id: row.id,
			type: row.type,
			name: row.name,
			url: row.url,
			createdAt: Timestamp.fromDate(row.createdAt),
			updatedAt: Timestamp.fromDate(row.updatedAt),
		});
	}
}
