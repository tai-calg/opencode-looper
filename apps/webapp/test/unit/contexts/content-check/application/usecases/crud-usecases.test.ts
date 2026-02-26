import { DeleteCheckUseCase } from '@/backend/contexts/content-check/application/usecases/delete-check.usecase';
import { GetCheckDetailUseCase } from '@/backend/contexts/content-check/application/usecases/get-check-detail.usecase';
import { ListChecksUseCase } from '@/backend/contexts/content-check/application/usecases/list-checks.usecase';
import { ResolveIssueUseCase } from '@/backend/contexts/content-check/application/usecases/resolve-issue.usecase';
import { CheckIssue } from '@/backend/contexts/content-check/domain/models/check-issue.model';
import { CheckSection } from '@/backend/contexts/content-check/domain/models/check-section.model';
import { Check } from '@/backend/contexts/content-check/domain/models/check.model';
import type { CheckRepository } from '@/backend/contexts/content-check/domain/repositories/check.repository';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { describe, expect, it, vi } from 'vitest';

function createMockRepository(): CheckRepository {
	return {
		findById: vi.fn().mockResolvedValue(null),
		findAll: vi.fn().mockResolvedValue([]),
		save: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined),
		count: vi.fn().mockResolvedValue(0),
	};
}

function createTestCheck(): Check {
	const issue = CheckIssue.reconstruct({
		id: 'issue-1',
		category: 'quality',
		severity: 'caution',
		quote: '引用',
		message: '指摘',
		suggestion: null,
		ruleId: null,
		resolved: false,
		createdAt: Timestamp.now(),
	});
	const section = CheckSection.reconstruct({
		id: 'section-1',
		sectionIndex: 0,
		content: 'セクション本文',
		status: 'completed',
		issues: [issue],
		createdAt: Timestamp.now(),
	});
	return Check.reconstruct({
		id: 'check-1',
		title: 'テストチェック',
		platform: null,
		content: 'テスト本文',
		source: 'web',
		slackChannel: null,
		slackThreadTs: null,
		userId: null,
		status: 'completed',
		sections: [section],
		createdAt: Timestamp.now(),
	});
}

describe('GetCheckDetailUseCase', () => {
	it('チェック詳細を返す', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestCheck());
		const useCase = new GetCheckDetailUseCase(repo);
		const result = await useCase.execute('check-1');
		expect(result.id).toBe('check-1');
	});

	it('userId を渡して取得する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestCheck());
		const useCase = new GetCheckDetailUseCase(repo);
		await useCase.execute('check-1', 'user-1');
		expect(repo.findById).toHaveBeenCalledWith('check-1', 'user-1');
	});

	it('存在しない場合は例外を投げる', async () => {
		const repo = createMockRepository();
		const useCase = new GetCheckDetailUseCase(repo);
		await expect(useCase.execute('unknown')).rejects.toThrow('チェック結果が見つかりません');
	});
});

describe('ListChecksUseCase', () => {
	it('チェック一覧と件数を返す', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findAll).mockResolvedValue([createTestCheck()]);
		vi.mocked(repo.count).mockResolvedValue(1);
		const useCase = new ListChecksUseCase(repo);
		const result = await useCase.execute();
		expect(result.checks).toHaveLength(1);
		expect(result.total).toBe(1);
	});

	it('userId を渡して取得する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findAll).mockResolvedValue([createTestCheck()]);
		vi.mocked(repo.count).mockResolvedValue(1);
		const useCase = new ListChecksUseCase(repo);
		await useCase.execute({ userId: 'user-1' });
		expect(repo.findAll).toHaveBeenCalledWith({ userId: 'user-1' });
		expect(repo.count).toHaveBeenCalledWith('user-1');
	});
});

describe('ResolveIssueUseCase', () => {
	it('指摘の resolved を切り替えて保存する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestCheck());
		const useCase = new ResolveIssueUseCase(repo);
		await useCase.execute({ checkId: 'check-1', issueId: 'issue-1' });
		expect(repo.save).toHaveBeenCalledOnce();
	});

	it('userId を渡して取得する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestCheck());
		const useCase = new ResolveIssueUseCase(repo);
		await useCase.execute({ checkId: 'check-1', issueId: 'issue-1', userId: 'user-1' });
		expect(repo.findById).toHaveBeenCalledWith('check-1', 'user-1');
	});
});

describe('DeleteCheckUseCase', () => {
	it('チェックを削除する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestCheck());
		const useCase = new DeleteCheckUseCase(repo);
		await useCase.execute('check-1');
		expect(repo.delete).toHaveBeenCalledWith('check-1', undefined);
	});

	it('userId を渡して削除する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestCheck());
		const useCase = new DeleteCheckUseCase(repo);
		await useCase.execute('check-1', 'user-1');
		expect(repo.findById).toHaveBeenCalledWith('check-1', 'user-1');
		expect(repo.delete).toHaveBeenCalledWith('check-1', 'user-1');
	});
});
