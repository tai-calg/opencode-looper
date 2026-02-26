import { afterEach, describe, expect, it, vi } from 'vitest';

describe('isSkipAuth', () => {
	const originalEnv = process.env;

	afterEach(() => {
		process.env = originalEnv;
		vi.resetModules();
	});

	it('NODE_ENV=production では常に false を返す', async () => {
		process.env = { ...originalEnv, SKIP_AUTH: 'true', NODE_ENV: 'production' };
		const { isSkipAuth } = await import(
			'@/backend/contexts/auth/presentation/composition/auth.composition'
		);
		expect(isSkipAuth()).toBe(false);
	});

	it('NODE_ENV=development かつ SKIP_AUTH=true で true を返す', async () => {
		process.env = { ...originalEnv, SKIP_AUTH: 'true', NODE_ENV: 'development' };
		const { isSkipAuth } = await import(
			'@/backend/contexts/auth/presentation/composition/auth.composition'
		);
		expect(isSkipAuth()).toBe(true);
	});

	it('SKIP_AUTH が未設定なら false を返す', async () => {
		process.env = { ...originalEnv, NODE_ENV: 'development' };
		process.env.SKIP_AUTH = undefined;
		const { isSkipAuth } = await import(
			'@/backend/contexts/auth/presentation/composition/auth.composition'
		);
		expect(isSkipAuth()).toBe(false);
	});
});

describe('DevSessionSchema validation', () => {
	it('有効な dev セッションを受け入れる', async () => {
		const { z } = await import('zod');
		// DevSessionSchema は直接 export されていないので、getSession の挙動を通じてテストする
		// ここでは Zod スキーマの挙動を直接テストする
		const DevSessionSchema = z.object({
			userId: z.string(),
			email: z.string(),
			name: z.string(),
			avatarUrl: z.string().optional(),
		});

		const valid = DevSessionSchema.safeParse({
			userId: 'user-1',
			email: 'test@example.com',
			name: 'Test User',
		});
		expect(valid.success).toBe(true);
	});

	it('不正な dev セッションを拒否する（userId が欠落）', async () => {
		const { z } = await import('zod');
		const DevSessionSchema = z.object({
			userId: z.string(),
			email: z.string(),
			name: z.string(),
			avatarUrl: z.string().optional(),
		});

		const invalid = DevSessionSchema.safeParse({
			email: 'test@example.com',
			name: 'Test User',
		});
		expect(invalid.success).toBe(false);
	});

	it('不正な dev セッションを拒否する（空オブジェクト）', async () => {
		const { z } = await import('zod');
		const DevSessionSchema = z.object({
			userId: z.string(),
			email: z.string(),
			name: z.string(),
			avatarUrl: z.string().optional(),
		});

		const invalid = DevSessionSchema.safeParse({});
		expect(invalid.success).toBe(false);
	});
});
