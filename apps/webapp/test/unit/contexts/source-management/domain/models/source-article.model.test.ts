import { SourceArticle } from '@/backend/contexts/source-management/domain/models/source-article.model';
import { describe, expect, it } from 'vitest';

describe('SourceArticle', () => {
	describe('create', () => {
		it('有効なパラメータで作成できる', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: 'テスト記事',
				url: 'https://note.com/test/n/article1',
				publishedAt: new Date('2024-01-15'),
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.sourceId).toBe('source-1');
				expect(result.value.title).toBe('テスト記事');
				expect(result.value.url).toBe('https://note.com/test/n/article1');
				expect(result.value.publishedAt).not.toBeNull();
				expect(result.value.publishedAt?.toDate()).toEqual(new Date('2024-01-15'));
				expect(result.value.imported).toBe(false);
				expect(result.value.id).toBeDefined();
				expect(result.value.createdAt).toBeDefined();
			}
		});

		it('publishedAt が省略された場合は null になる', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: 'テスト記事',
				url: 'https://note.com/test/n/article1',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.publishedAt).toBeNull();
			}
		});

		it('publishedAt が null の場合は null になる', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: 'テスト記事',
				url: 'https://note.com/test/n/article1',
				publishedAt: null,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.publishedAt).toBeNull();
			}
		});

		it('タイトルが空の場合はエラー', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: '',
				url: 'https://note.com/test/n/article1',
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('タイトルは必須です');
			}
		});

		it('タイトルが空白のみの場合はエラー', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: '   ',
				url: 'https://note.com/test/n/article1',
			});
			expect(result.success).toBe(false);
		});

		it('URLが空の場合はエラー', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: 'テスト',
				url: '',
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('URLは必須です');
			}
		});

		it('URLが空白のみの場合はエラー', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: 'テスト',
				url: '  ',
			});
			expect(result.success).toBe(false);
		});

		it('前後の空白がトリムされる', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: '  テスト記事  ',
				url: '  https://note.com/test/n/article1  ',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.title).toBe('テスト記事');
				expect(result.value.url).toBe('https://note.com/test/n/article1');
			}
		});
	});

	describe('markAsImported', () => {
		it('取込済みに変更した新しいインスタンスを返す', () => {
			const createResult = SourceArticle.create({
				sourceId: 'source-1',
				title: 'テスト記事',
				url: 'https://note.com/test/n/article1',
			});
			if (!createResult.success) return;

			expect(createResult.value.imported).toBe(false);
			const imported = createResult.value.markAsImported();
			expect(imported.imported).toBe(true);
			expect(imported.id).toBe(createResult.value.id);
			expect(imported.title).toBe(createResult.value.title);
			// 元のインスタンスは変更されない
			expect(createResult.value.imported).toBe(false);
		});
	});

	describe('reconstruct', () => {
		it('props からインスタンスを復元できる', () => {
			const result = SourceArticle.create({
				sourceId: 'source-1',
				title: 'テスト記事',
				url: 'https://note.com/test/n/article1',
				publishedAt: new Date('2024-01-15'),
			});
			if (!result.success) return;

			const reconstructed = SourceArticle.reconstruct({
				id: result.value.id,
				sourceId: result.value.sourceId,
				title: result.value.title,
				url: result.value.url,
				publishedAt: result.value.publishedAt,
				imported: result.value.imported,
				createdAt: result.value.createdAt,
			});
			expect(reconstructed.id).toBe(result.value.id);
			expect(reconstructed.sourceId).toBe('source-1');
			expect(reconstructed.title).toBe('テスト記事');
		});
	});
});
