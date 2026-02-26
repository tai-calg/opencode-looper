import { User } from '@/backend/contexts/auth/domain/models/user.model';
import { PrismaUserRepository } from '@/backend/contexts/auth/infrastructure/repositories/prisma-user.repository';
import { describe, expect, it, vi } from 'vitest';

// prisma をモック
vi.mock('@/backend/contexts/shared/infrastructure/db/prisma-client', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			upsert: vi.fn(),
		},
	},
}));

// モックされた prisma を取得
const { prisma } = await import('@/backend/contexts/shared/infrastructure/db/prisma-client');
const mockPrisma = prisma as unknown as {
	user: {
		findUnique: ReturnType<typeof vi.fn>;
		upsert: ReturnType<typeof vi.fn>;
	};
};

describe('PrismaUserRepository', () => {
	const repository = new PrismaUserRepository();

	describe('findById', () => {
		it('ユーザーが存在する場合 User ドメインモデルを返す', async () => {
			const createdAt = new Date('2025-01-01T00:00:00Z');
			const updatedAt = new Date('2025-06-01T00:00:00Z');
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'uid-123',
				email: 'taro@team-mir.ai',
				name: 'Taro',
				avatarUrl: 'https://example.com/avatar.png',
				createdAt,
				updatedAt,
			});

			const user = await repository.findById('uid-123');

			expect(user).not.toBeNull();
			expect(user?.id.toString()).toBe('uid-123');
			expect(user?.email).toBe('taro@team-mir.ai');
			expect(user?.name).toBe('Taro');
			expect(user?.avatarUrl).toBe('https://example.com/avatar.png');
			expect(user?.createdAt.toDate()).toEqual(createdAt);
			expect(user?.updatedAt.toDate()).toEqual(updatedAt);
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { id: 'uid-123' },
			});
		});

		it('ユーザーが存在しない場合 null を返す', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);

			const user = await repository.findById('non-existent');

			expect(user).toBeNull();
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { id: 'non-existent' },
			});
		});
	});

	describe('upsert', () => {
		it('User ドメインモデルで prisma.user.upsert を呼ぶ', async () => {
			mockPrisma.user.upsert.mockResolvedValue({});

			const user = User.create({
				id: 'uid-456',
				email: 'hanako@team-mir.ai',
				name: 'Hanako',
				avatarUrl: null,
			});

			await repository.upsert(user);

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { id: 'uid-456' },
				update: {
					email: 'hanako@team-mir.ai',
					name: 'Hanako',
					avatarUrl: null,
				},
				create: {
					id: 'uid-456',
					email: 'hanako@team-mir.ai',
					name: 'Hanako',
					avatarUrl: null,
				},
			});
		});
	});
});
