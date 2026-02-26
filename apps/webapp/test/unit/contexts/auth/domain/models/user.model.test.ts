import { User } from '@/backend/contexts/auth/domain/models/user.model';
import { describe, expect, it } from 'vitest';

describe('User', () => {
	describe('create', () => {
		it('正しいプロパティで作成できる', () => {
			const user = User.create({
				id: 'supabase-uid-123',
				email: 'taro@team-mir.ai',
				name: 'Taro',
				avatarUrl: 'https://example.com/avatar.png',
			});
			expect(user.id.toString()).toBe('supabase-uid-123');
			expect(user.email).toBe('taro@team-mir.ai');
			expect(user.name).toBe('Taro');
			expect(user.avatarUrl).toBe('https://example.com/avatar.png');
			expect(user.createdAt).toBeDefined();
			expect(user.updatedAt).toBeDefined();
		});

		it('空の id で UserId.create 経由でエラーになる', () => {
			expect(() =>
				User.create({
					id: '',
					email: 'taro@team-mir.ai',
					name: 'Taro',
					avatarUrl: null,
				}),
			).toThrow('UserId cannot be empty');
		});
	});

	describe('reconstruct', () => {
		it('既存データから復元できる', () => {
			const createdAt = new Date('2025-01-01T00:00:00Z');
			const updatedAt = new Date('2025-06-01T00:00:00Z');
			const user = User.reconstruct({
				id: 'existing-uid',
				email: 'hanako@team-mir.ai',
				name: 'Hanako',
				avatarUrl: null,
				createdAt,
				updatedAt,
			});
			expect(user.id.toString()).toBe('existing-uid');
			expect(user.email).toBe('hanako@team-mir.ai');
			expect(user.name).toBe('Hanako');
			expect(user.avatarUrl).toBeNull();
			expect(user.createdAt.toDate()).toEqual(createdAt);
			expect(user.updatedAt.toDate()).toEqual(updatedAt);
		});
	});

	describe('emailDomain', () => {
		it('メールアドレスのドメイン部分を返す', () => {
			const user = User.create({
				id: 'uid-1',
				email: 'taro@team-mir.ai',
				name: null,
				avatarUrl: null,
			});
			expect(user.emailDomain).toBe('team-mir.ai');
		});
	});

	describe('belongsToDomain', () => {
		it('正しいドメインで true を返す', () => {
			const user = User.create({
				id: 'uid-1',
				email: 'taro@team-mir.ai',
				name: null,
				avatarUrl: null,
			});
			expect(user.belongsToDomain('team-mir.ai')).toBe(true);
		});

		it('異なるドメインで false を返す', () => {
			const user = User.create({
				id: 'uid-1',
				email: 'taro@gmail.com',
				name: null,
				avatarUrl: null,
			});
			expect(user.belongsToDomain('team-mir.ai')).toBe(false);
		});
	});
});
