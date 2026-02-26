import { HandleSlackMentionUseCase } from '@/backend/contexts/content-check/application/usecases/handle-slack-mention.usecase';
import type { RunCheckUseCase } from '@/backend/contexts/content-check/application/usecases/run-check.usecase';
import type { SlackGateway } from '@/backend/contexts/content-check/domain/gateways/slack.gateway';
import { CheckIssue } from '@/backend/contexts/content-check/domain/models/check-issue.model';
import { CheckSection } from '@/backend/contexts/content-check/domain/models/check-section.model';
import { Check } from '@/backend/contexts/content-check/domain/models/check.model';
import type { CheckRepository } from '@/backend/contexts/content-check/domain/repositories/check.repository';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { describe, expect, it, vi } from 'vitest';

const CHECK_ID = 'check-001';
const CHANNEL = 'C01234567';
const THREAD_TS = '1234567890.123456';
const APP_URL = 'https://example.com';

function createMocks() {
	const slackGateway: SlackGateway = {
		fetchThreadMessages: vi.fn().mockResolvedValue(['メッセージ1', 'メッセージ2']),
		postMessage: vi.fn().mockResolvedValue(undefined),
	};
	const runCheckUseCase = {
		execute: vi.fn().mockResolvedValue(CHECK_ID),
	} as unknown as RunCheckUseCase;
	const checkRepository: CheckRepository = {
		findById: vi.fn().mockResolvedValue(null),
		findAll: vi.fn().mockResolvedValue([]),
		save: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined),
		count: vi.fn().mockResolvedValue(0),
	};
	return { slackGateway, runCheckUseCase, checkRepository };
}

function createCheckWithIssues(issues: CheckIssue[]): Check {
	const section = CheckSection.reconstruct({
		id: 'section-001',
		sectionIndex: 0,
		content: 'テスト本文',
		status: 'completed',
		issues,
		createdAt: Timestamp.now(),
	});
	return Check.reconstruct({
		id: CHECK_ID,
		title: null,
		platform: null,
		content: 'テスト本文',
		source: 'slack',
		slackChannel: CHANNEL,
		slackThreadTs: THREAD_TS,
		userId: null,
		status: 'completed',
		sections: [section],
		createdAt: Timestamp.now(),
	});
}

function createIssue(category: string, severity: string): CheckIssue {
	return CheckIssue.reconstruct({
		id: crypto.randomUUID(),
		category: category as 'fact' | 'knowledge' | 'expression' | 'risk' | 'quality',
		severity: severity as 'caution' | 'needs_fix',
		quote: '引用テキスト',
		message: '指摘メッセージ',
		suggestion: null,
		ruleId: null,
		resolved: false,
		createdAt: Timestamp.now(),
	});
}

describe('HandleSlackMentionUseCase', () => {
	it('スレッドメッセージを取得してチェックを実行し、結果サマリーを投稿する', async () => {
		const mocks = createMocks();
		const check = createCheckWithIssues([
			createIssue('fact', 'needs_fix'),
			createIssue('expression', 'caution'),
		]);
		vi.mocked(mocks.checkRepository.findById).mockResolvedValue(check);

		const useCase = new HandleSlackMentionUseCase(
			mocks.slackGateway,
			mocks.runCheckUseCase,
			mocks.checkRepository,
		);
		await useCase.execute({ channel: CHANNEL, threadTs: THREAD_TS, appUrl: APP_URL });

		expect(mocks.slackGateway.fetchThreadMessages).toHaveBeenCalledWith(CHANNEL, THREAD_TS);
		expect(mocks.runCheckUseCase.execute).toHaveBeenCalled();
		expect(mocks.checkRepository.findById).toHaveBeenCalledWith(CHECK_ID);
		expect(mocks.slackGateway.postMessage).toHaveBeenCalledWith(
			CHANNEL,
			expect.stringContaining('チェックが完了しました'),
			THREAD_TS,
		);
	});

	it('チェック結果に指摘がない場合、「指摘事項はありません」メッセージを投稿する', async () => {
		const mocks = createMocks();
		const check = createCheckWithIssues([]);
		vi.mocked(mocks.checkRepository.findById).mockResolvedValue(check);

		const useCase = new HandleSlackMentionUseCase(
			mocks.slackGateway,
			mocks.runCheckUseCase,
			mocks.checkRepository,
		);
		await useCase.execute({ channel: CHANNEL, threadTs: THREAD_TS, appUrl: APP_URL });

		expect(mocks.slackGateway.postMessage).toHaveBeenCalledWith(
			CHANNEL,
			expect.stringContaining('指摘事項はありません'),
			THREAD_TS,
		);
	});

	it('スレッドにメッセージがない場合、エラーメッセージを投稿する', async () => {
		const mocks = createMocks();
		vi.mocked(mocks.slackGateway.fetchThreadMessages).mockResolvedValue([]);

		const useCase = new HandleSlackMentionUseCase(
			mocks.slackGateway,
			mocks.runCheckUseCase,
			mocks.checkRepository,
		);
		await useCase.execute({ channel: CHANNEL, threadTs: THREAD_TS, appUrl: APP_URL });

		expect(mocks.runCheckUseCase.execute).not.toHaveBeenCalled();
		expect(mocks.slackGateway.postMessage).toHaveBeenCalledWith(
			CHANNEL,
			'スレッドにチェック対象のメッセージが見つかりませんでした。',
			THREAD_TS,
		);
	});

	it('RunCheckUseCase に source: slack, slackChannel, slackThreadTs を渡す', async () => {
		const mocks = createMocks();
		const check = createCheckWithIssues([]);
		vi.mocked(mocks.checkRepository.findById).mockResolvedValue(check);

		const useCase = new HandleSlackMentionUseCase(
			mocks.slackGateway,
			mocks.runCheckUseCase,
			mocks.checkRepository,
		);
		await useCase.execute({ channel: CHANNEL, threadTs: THREAD_TS, appUrl: APP_URL });

		expect(mocks.runCheckUseCase.execute).toHaveBeenCalledWith({
			content: 'メッセージ1\n\nメッセージ2',
			source: 'slack',
			slackChannel: CHANNEL,
			slackThreadTs: THREAD_TS,
		});
	});

	it('サマリーメッセージにカテゴリ別・重要度別の件数とパーマリンクが含まれる', async () => {
		const mocks = createMocks();
		const check = createCheckWithIssues([
			createIssue('fact', 'needs_fix'),
			createIssue('fact', 'caution'),
			createIssue('expression', 'needs_fix'),
			createIssue('risk', 'caution'),
			createIssue('quality', 'caution'),
		]);
		vi.mocked(mocks.checkRepository.findById).mockResolvedValue(check);

		const useCase = new HandleSlackMentionUseCase(
			mocks.slackGateway,
			mocks.runCheckUseCase,
			mocks.checkRepository,
		);
		await useCase.execute({ channel: CHANNEL, threadTs: THREAD_TS, appUrl: APP_URL });

		const postedMessage = vi.mocked(mocks.slackGateway.postMessage).mock.calls[0][1];

		// カテゴリ別件数
		expect(postedMessage).toContain('事実確認: 2件');
		expect(postedMessage).toContain('ナレッジ整合: 0件');
		expect(postedMessage).toContain('表現ルール: 1件');
		expect(postedMessage).toContain('炎上リスク: 1件');
		expect(postedMessage).toContain('文章品質: 1件');

		// 重要度別件数
		expect(postedMessage).toContain('要修正: 2件');
		expect(postedMessage).toContain('注意: 3件');

		// パーマリンク
		expect(postedMessage).toContain(`${APP_URL}/checks/${CHECK_ID}`);

		// 合計件数
		expect(postedMessage).toContain('指摘: 5件');
	});
});
