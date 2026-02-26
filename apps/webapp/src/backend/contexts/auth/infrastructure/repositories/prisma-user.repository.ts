import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import { User } from '../../domain/models/user.model';
import type { UserRepository } from '../../domain/repositories/user.repository';

export class PrismaUserRepository implements UserRepository {
	async findById(id: string): Promise<User | null> {
		const row = await prisma.user.findUnique({ where: { id } });
		if (!row) return null;
		return User.reconstruct({
			id: row.id,
			email: row.email,
			name: row.name,
			avatarUrl: row.avatarUrl,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		});
	}

	async upsert(user: User): Promise<void> {
		await prisma.user.upsert({
			where: { id: user.id.toString() },
			update: {
				email: user.email,
				name: user.name,
				avatarUrl: user.avatarUrl,
			},
			create: {
				id: user.id.toString(),
				email: user.email,
				name: user.name,
				avatarUrl: user.avatarUrl,
			},
		});
	}
}
