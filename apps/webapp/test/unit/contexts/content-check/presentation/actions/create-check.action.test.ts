import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const CreateCheckSchema = z.object({
	content: z.string().min(1, '本文は必須です').max(30000, '本文は30,000文字以内で入力してください'),
	platform: z.enum(['youtube', 'x', 'note', 'other']).optional(),
	title: z.string().max(200, 'タイトルは200文字以内で入力してください').optional(),
});

describe('CreateCheckSchema', () => {
	it('有効な入力を受け入れる', () => {
		const result = CreateCheckSchema.safeParse({
			content: 'テスト本文',
			platform: 'youtube',
			title: 'テストタイトル',
		});
		expect(result.success).toBe(true);
	});

	it('content のみでも有効', () => {
		const result = CreateCheckSchema.safeParse({
			content: 'テスト本文',
		});
		expect(result.success).toBe(true);
	});

	it('content が空文字の場合は無効', () => {
		const result = CreateCheckSchema.safeParse({
			content: '',
		});
		expect(result.success).toBe(false);
	});

	it('content が 30,000 文字を超える場合は無効', () => {
		const result = CreateCheckSchema.safeParse({
			content: 'a'.repeat(30001),
		});
		expect(result.success).toBe(false);
	});

	it('不正な platform は無効', () => {
		const result = CreateCheckSchema.safeParse({
			content: 'テスト本文',
			platform: 'invalid',
		});
		expect(result.success).toBe(false);
	});

	it('title が 200 文字を超える場合は無効', () => {
		const result = CreateCheckSchema.safeParse({
			content: 'テスト本文',
			title: 'a'.repeat(201),
		});
		expect(result.success).toBe(false);
	});
});
