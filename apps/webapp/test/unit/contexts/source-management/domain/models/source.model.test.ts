import { Source } from '@/backend/contexts/source-management/domain/models/source.model';
import { describe, expect, it } from 'vitest';

describe('Source', () => {
	describe('create', () => {
		it('有効なパラメータで作成できる', () => {
			const result = Source.create({
				type: 'note',
				name: 'テストソース',
				url: 'https://note.com/testuser',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.type).toBe('note');
				expect(result.value.name).toBe('テストソース');
				expect(result.value.url).toBe('https://note.com/testuser');
				expect(result.value.id).toBeDefined();
				expect(result.value.createdAt).toBeDefined();
				expect(result.value.updatedAt).toBeDefined();
			}
		});

		it('ソース名が空の場合はエラー', () => {
			const result = Source.create({
				type: 'note',
				name: '',
				url: 'https://note.com/testuser',
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('ソース名は必須です');
			}
		});

		it('ソース名が空白のみの場合はエラー', () => {
			const result = Source.create({
				type: 'note',
				name: '   ',
				url: 'https://note.com/testuser',
			});
			expect(result.success).toBe(false);
		});

		it('URLが空の場合はエラー', () => {
			const result = Source.create({
				type: 'note',
				name: 'テスト',
				url: '',
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('URLは必須です');
			}
		});

		it('URLが空白のみの場合はエラー', () => {
			const result = Source.create({
				type: 'note',
				name: 'テスト',
				url: '  ',
			});
			expect(result.success).toBe(false);
		});

		it('ソース種別が note 以外の場合はエラー', () => {
			const result = Source.create({
				type: 'rss',
				name: 'テスト',
				url: 'https://example.com',
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('ソース種別は note のみサポートしています');
			}
		});

		it('前後の空白がトリムされる', () => {
			const result = Source.create({
				type: 'note',
				name: '  テストソース  ',
				url: '  https://note.com/testuser  ',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.name).toBe('テストソース');
				expect(result.value.url).toBe('https://note.com/testuser');
			}
		});
	});

	describe('reconstruct', () => {
		it('props からインスタンスを復元できる', () => {
			const result = Source.create({
				type: 'note',
				name: 'テスト',
				url: 'https://note.com/test',
			});
			if (!result.success) return;

			const reconstructed = Source.reconstruct({
				id: result.value.id,
				type: result.value.type,
				name: result.value.name,
				url: result.value.url,
				createdAt: result.value.createdAt,
				updatedAt: result.value.updatedAt,
			});
			expect(reconstructed.id).toBe(result.value.id);
			expect(reconstructed.type).toBe('note');
			expect(reconstructed.name).toBe('テスト');
			expect(reconstructed.url).toBe('https://note.com/test');
		});
	});
});
