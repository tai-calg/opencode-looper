import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { CreateRuleUseCase } from '@/backend/contexts/source-management/application/usecases/create-rule.usecase';
import { DeleteRuleUseCase } from '@/backend/contexts/source-management/application/usecases/delete-rule.usecase';
import { ListRulesUseCase } from '@/backend/contexts/source-management/application/usecases/list-rules.usecase';
import { ToggleRuleUseCase } from '@/backend/contexts/source-management/application/usecases/toggle-rule.usecase';
import { UpdateRuleUseCase } from '@/backend/contexts/source-management/application/usecases/update-rule.usecase';
import { ExpressionRule } from '@/backend/contexts/source-management/domain/models/expression-rule.model';
import type { ExpressionRuleRepository } from '@/backend/contexts/source-management/domain/repositories/expression-rule.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createMockRepository(): ExpressionRuleRepository {
	return {
		findAll: vi.fn().mockResolvedValue([]),
		findById: vi.fn().mockResolvedValue(null),
		save: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined),
	};
}

function createTestRule(
	overrides?: Partial<{
		id: string;
		ngExpression: string;
		okExpression: string;
		description: string | null;
		enabled: boolean;
	}>,
): ExpressionRule {
	const now = Timestamp.now();
	return ExpressionRule.reconstruct({
		id: overrides?.id ?? 'test-id',
		ngExpression: overrides?.ngExpression ?? 'NG表現',
		okExpression: overrides?.okExpression ?? 'OK表現',
		description: overrides?.description ?? null,
		enabled: overrides?.enabled ?? true,
		createdAt: now,
		updatedAt: now,
	});
}

describe('CreateRuleUseCase', () => {
	it('ルールを作成して保存する', async () => {
		const repo = createMockRepository();
		const useCase = new CreateRuleUseCase(repo);

		const result = await useCase.execute({
			ngExpression: 'NG',
			okExpression: 'OK',
			description: '説明',
		});

		expect(result.ngExpression).toBe('NG');
		expect(result.okExpression).toBe('OK');
		expect(repo.save).toHaveBeenCalledOnce();
	});

	it('バリデーションエラーで例外を投げる', async () => {
		const repo = createMockRepository();
		const useCase = new CreateRuleUseCase(repo);

		await expect(useCase.execute({ ngExpression: '', okExpression: 'OK' })).rejects.toThrow();
		expect(repo.save).not.toHaveBeenCalled();
	});
});

describe('UpdateRuleUseCase', () => {
	it('既存ルールを更新する', async () => {
		const repo = createMockRepository();
		const existing = createTestRule();
		vi.mocked(repo.findById).mockResolvedValue(existing);
		const useCase = new UpdateRuleUseCase(repo);

		const result = await useCase.execute({
			id: 'test-id',
			ngExpression: '新NG',
			okExpression: '新OK',
		});

		expect(result.ngExpression).toBe('新NG');
		expect(repo.save).toHaveBeenCalledOnce();
	});

	it('存在しないルールで例外を投げる', async () => {
		const repo = createMockRepository();
		const useCase = new UpdateRuleUseCase(repo);

		await expect(
			useCase.execute({ id: 'unknown', ngExpression: 'NG', okExpression: 'OK' }),
		).rejects.toThrow('ルールが見つかりません');
	});
});

describe('DeleteRuleUseCase', () => {
	it('既存ルールを削除する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestRule());
		const useCase = new DeleteRuleUseCase(repo);

		await useCase.execute('test-id');
		expect(repo.delete).toHaveBeenCalledWith('test-id');
	});

	it('存在しないルールで例外を投げる', async () => {
		const repo = createMockRepository();
		const useCase = new DeleteRuleUseCase(repo);

		await expect(useCase.execute('unknown')).rejects.toThrow('ルールが見つかりません');
	});
});

describe('ToggleRuleUseCase', () => {
	it('有効/無効を切り替える', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestRule({ enabled: true }));
		const useCase = new ToggleRuleUseCase(repo);

		const result = await useCase.execute('test-id');
		expect(result.enabled).toBe(false);
		expect(repo.save).toHaveBeenCalledOnce();
	});
});

describe('ListRulesUseCase', () => {
	it('全ルールを返す', async () => {
		const repo = createMockRepository();
		const rules = [createTestRule({ id: '1' }), createTestRule({ id: '2' })];
		vi.mocked(repo.findAll).mockResolvedValue(rules);
		const useCase = new ListRulesUseCase(repo);

		const result = await useCase.execute();
		expect(result).toHaveLength(2);
	});
});
