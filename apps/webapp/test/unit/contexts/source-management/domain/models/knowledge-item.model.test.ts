import { KnowledgeItem } from '@/backend/contexts/source-management/domain/models/knowledge-item.model';
import { describe, expect, it } from 'vitest';

describe('KnowledgeItem', () => {
	describe('create', () => {
		it('有効なパラメータで作成できる', () => {
			const result = KnowledgeItem.create({
				title: 'テストナレッジ',
				sourceType: 'manual',
				content: 'テスト本文',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.title).toBe('テストナレッジ');
				expect(result.value.sourceType).toBe('manual');
				expect(result.value.content).toBe('テスト本文');
				expect(result.value.sourceUrl).toBeNull();
				expect(result.value.embedding).toBeNull();
				expect(result.value.id).toBeDefined();
			}
		});

		it('タイトルが空の場合はエラー', () => {
			const result = KnowledgeItem.create({
				title: '',
				sourceType: 'manual',
				content: '本文',
			});
			expect(result.success).toBe(false);
		});

		it('本文が空の場合はエラー', () => {
			const result = KnowledgeItem.create({
				title: 'タイトル',
				sourceType: 'manual',
				content: '  ',
			});
			expect(result.success).toBe(false);
		});

		it('無効なソース種別の場合はエラー', () => {
			const result = KnowledgeItem.create({
				title: 'タイトル',
				sourceType: 'invalid',
				content: '本文',
			});
			expect(result.success).toBe(false);
		});

		it('sourceUrl を指定できる', () => {
			const result = KnowledgeItem.create({
				title: 'タイトル',
				sourceType: 'note',
				content: '本文',
				sourceUrl: 'https://example.com',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.sourceUrl).toBe('https://example.com');
			}
		});

		it('前後の空白がトリムされる', () => {
			const result = KnowledgeItem.create({
				title: '  タイトル  ',
				sourceType: 'manual',
				content: '  本文  ',
				sourceUrl: '  https://example.com  ',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.title).toBe('タイトル');
				expect(result.value.content).toBe('本文');
				expect(result.value.sourceUrl).toBe('https://example.com');
			}
		});
	});

	describe('update', () => {
		it('値を更新できる', () => {
			const createResult = KnowledgeItem.create({
				title: '旧タイトル',
				sourceType: 'manual',
				content: '旧本文',
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const updateResult = createResult.value.update({
				title: '新タイトル',
				sourceType: 'note',
				content: '新本文',
				sourceUrl: 'https://example.com',
			});
			expect(updateResult.success).toBe(true);
			if (updateResult.success) {
				expect(updateResult.value.title).toBe('新タイトル');
				expect(updateResult.value.sourceType).toBe('note');
				expect(updateResult.value.content).toBe('新本文');
				expect(updateResult.value.sourceUrl).toBe('https://example.com');
				expect(updateResult.value.id).toBe(createResult.value.id);
			}
		});

		it('content 変更時に embedding がクリアされる', () => {
			const createResult = KnowledgeItem.create({
				title: 'タイトル',
				sourceType: 'manual',
				content: '元の本文',
			});
			if (!createResult.success) return;

			const withEmb = createResult.value.withEmbedding([0.1, 0.2, 0.3]);
			expect(withEmb.embedding).toEqual([0.1, 0.2, 0.3]);

			const updateResult = withEmb.update({
				title: 'タイトル',
				sourceType: 'manual',
				content: '変更後の本文',
			});
			if (updateResult.success) {
				expect(updateResult.value.embedding).toBeNull();
			}
		});

		it('content 未変更時に embedding が維持される', () => {
			const createResult = KnowledgeItem.create({
				title: 'タイトル',
				sourceType: 'manual',
				content: '本文',
			});
			if (!createResult.success) return;

			const withEmb = createResult.value.withEmbedding([0.1, 0.2, 0.3]);
			const updateResult = withEmb.update({
				title: '新タイトル',
				sourceType: 'note',
				content: '本文', // content は同じ
			});
			if (updateResult.success) {
				expect(updateResult.value.embedding).toEqual([0.1, 0.2, 0.3]);
			}
		});
	});

	describe('withEmbedding', () => {
		it('embedding を設定した新しいインスタンスを返す', () => {
			const createResult = KnowledgeItem.create({
				title: 'タイトル',
				sourceType: 'manual',
				content: '本文',
			});
			if (!createResult.success) return;

			expect(createResult.value.hasEmbedding).toBe(false);
			const withEmb = createResult.value.withEmbedding([0.1, 0.2]);
			expect(withEmb.hasEmbedding).toBe(true);
			expect(withEmb.embedding).toEqual([0.1, 0.2]);
			// 元のインスタンスは変更されない
			expect(createResult.value.hasEmbedding).toBe(false);
		});
	});
});
