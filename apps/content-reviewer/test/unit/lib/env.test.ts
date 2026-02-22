import { afterEach, describe, expect, it, vi } from 'vitest';

describe('env', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe('getSupabaseUrl', () => {
		it('returns the env var value when set', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
			const { getSupabaseUrl } = await import('@/lib/env');
			expect(getSupabaseUrl()).toBe('https://test.supabase.co');
		});

		it('throws when env var is missing', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
			const { getSupabaseUrl } = await import('@/lib/env');
			expect(() => getSupabaseUrl()).toThrow(
				'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL',
			);
		});
	});

	describe('getSupabaseAnonKey', () => {
		it('returns the env var value when set', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
			const { getSupabaseAnonKey } = await import('@/lib/env');
			expect(getSupabaseAnonKey()).toBe('test-anon-key');
		});

		it('throws when env var is missing', async () => {
			vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
			const { getSupabaseAnonKey } = await import('@/lib/env');
			expect(() => getSupabaseAnonKey()).toThrow(
				'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY',
			);
		});
	});

	describe('getSlackSigningSecret', () => {
		it('returns the env var value when set', async () => {
			vi.stubEnv('SLACK_SIGNING_SECRET', 'test-signing-secret');
			const { getSlackSigningSecret } = await import('@/lib/env');
			expect(getSlackSigningSecret()).toBe('test-signing-secret');
		});

		it('throws when env var is missing', async () => {
			vi.stubEnv('SLACK_SIGNING_SECRET', '');
			const { getSlackSigningSecret } = await import('@/lib/env');
			expect(() => getSlackSigningSecret()).toThrow(
				'Missing environment variable: SLACK_SIGNING_SECRET',
			);
		});
	});

	describe('getSlackBotToken', () => {
		it('returns the env var value when set', async () => {
			vi.stubEnv('SLACK_BOT_TOKEN', 'xoxb-test-token');
			const { getSlackBotToken } = await import('@/lib/env');
			expect(getSlackBotToken()).toBe('xoxb-test-token');
		});

		it('throws when env var is missing', async () => {
			vi.stubEnv('SLACK_BOT_TOKEN', '');
			const { getSlackBotToken } = await import('@/lib/env');
			expect(() => getSlackBotToken()).toThrow('Missing environment variable: SLACK_BOT_TOKEN');
		});
	});
});
