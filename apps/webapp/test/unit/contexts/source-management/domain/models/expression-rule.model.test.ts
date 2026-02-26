import { ExpressionRule } from '@/backend/contexts/source-management/domain/models/expression-rule.model';
import { describe, expect, it } from 'vitest';

describe('ExpressionRule', () => {
	describe('create', () => {
		it('有効なパラメータで作成できる', () => {
			const result = ExpressionRule.create({
				ngExpression: '問題ない',
				okExpression: '問題はない',
				description: 'ら抜き言葉',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.ngExpression).toBe('問題ない');
				expect(result.value.okExpression).toBe('問題はない');
				expect(result.value.description).toBe('ら抜き言葉');
				expect(result.value.enabled).toBe(true);
				expect(result.value.id).toBeDefined();
			}
		});

		it('NG表現が空の場合はエラー', () => {
			const result = ExpressionRule.create({
				ngExpression: '',
				okExpression: 'OK表現',
			});
			expect(result.success).toBe(false);
		});

		it('OK表現が空の場合はエラー', () => {
			const result = ExpressionRule.create({
				ngExpression: 'NG表現',
				okExpression: '  ',
			});
			expect(result.success).toBe(false);
		});

		it('description は省略可能', () => {
			const result = ExpressionRule.create({
				ngExpression: 'NG',
				okExpression: 'OK',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.description).toBeNull();
			}
		});

		it('前後の空白がトリムされる', () => {
			const result = ExpressionRule.create({
				ngExpression: '  NG表現  ',
				okExpression: '  OK表現  ',
				description: '  説明  ',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.ngExpression).toBe('NG表現');
				expect(result.value.okExpression).toBe('OK表現');
				expect(result.value.description).toBe('説明');
			}
		});
	});

	describe('update', () => {
		it('値を更新できる', () => {
			const createResult = ExpressionRule.create({
				ngExpression: '旧NG',
				okExpression: '旧OK',
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const updateResult = createResult.value.update({
				ngExpression: '新NG',
				okExpression: '新OK',
				description: '新しい説明',
			});
			expect(updateResult.success).toBe(true);
			if (updateResult.success) {
				expect(updateResult.value.ngExpression).toBe('新NG');
				expect(updateResult.value.okExpression).toBe('新OK');
				expect(updateResult.value.description).toBe('新しい説明');
				expect(updateResult.value.id).toBe(createResult.value.id);
			}
		});
	});

	describe('toggleEnabled', () => {
		it('有効→無効に切り替わる', () => {
			const createResult = ExpressionRule.create({
				ngExpression: 'NG',
				okExpression: 'OK',
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			expect(createResult.value.enabled).toBe(true);
			const toggled = createResult.value.toggleEnabled();
			expect(toggled.enabled).toBe(false);
			expect(toggled.id).toBe(createResult.value.id);
		});

		it('無効→有効に切り替わる', () => {
			const createResult = ExpressionRule.create({
				ngExpression: 'NG',
				okExpression: 'OK',
			});
			if (!createResult.success) return;

			const disabled = createResult.value.toggleEnabled();
			const reEnabled = disabled.toggleEnabled();
			expect(reEnabled.enabled).toBe(true);
		});
	});
});
