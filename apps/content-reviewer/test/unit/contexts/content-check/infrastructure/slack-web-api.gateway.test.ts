import { SlackWebApiGateway } from '@/backend/contexts/content-check/infrastructure/slack-web-api.gateway';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// @slack/web-api の WebClient をモック
vi.mock('@slack/web-api', () => {
	const mockPostMessage = vi.fn().mockResolvedValue({ ok: true });
	const MockWebClient = vi.fn().mockImplementation(() => ({
		chat: {
			postMessage: mockPostMessage,
		},
	}));
	return { WebClient: MockWebClient };
});

import { WebClient } from '@slack/web-api';

function getMockPostMessage() {
	const instance = vi.mocked(WebClient).mock.results[0]?.value as {
		chat: { postMessage: ReturnType<typeof vi.fn> };
	};
	return instance.chat.postMessage;
}

describe('SlackWebApiGateway', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe('スタブモード（API 呼び出しをスキップ）', () => {
		it('SLACK_BOT_TOKEN が未設定の場合はスタブモードになりポストしない', async () => {
			process.env.SLACK_BOT_TOKEN = undefined;
			const gateway = new SlackWebApiGateway(undefined);
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			await gateway.postMessage('C123', '1234567890.123456', 'Hello');

			expect(consoleSpy).toHaveBeenCalledOnce();
			consoleSpy.mockRestore();
		});

		it.each(['dummy', 'test', ''])(
			'SLACK_BOT_TOKEN が %s の場合はスタブモードになりポストしない',
			async (token) => {
				const gateway = new SlackWebApiGateway(token);
				const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

				await gateway.postMessage('C123', '1234567890.123456', 'Hello');

				expect(consoleSpy).toHaveBeenCalledOnce();
				consoleSpy.mockRestore();
			},
		);

		it('スタブモードでは chat.postMessage を呼び出さない', async () => {
			const gateway = new SlackWebApiGateway('dummy');
			vi.spyOn(console, 'log').mockImplementation(() => {});

			await gateway.postMessage('C123', '1234567890.123456', 'Hello');

			// WebClient がインスタンス化されるが postMessage は呼ばれない
			// (WebClient コンストラクタの呼び出しカウントは beforeEach で clearAllMocks 済み)
			const postMessage = getMockPostMessage();
			expect(postMessage).not.toHaveBeenCalled();
		});
	});

	describe('通常モード（有効なトークン）', () => {
		it('有効なトークンで chat.postMessage を正しい引数で呼び出す', async () => {
			const gateway = new SlackWebApiGateway('xoxb-valid-token');

			await gateway.postMessage('C123456', '1234567890.123456', 'テストメッセージ');

			const postMessage = getMockPostMessage();
			expect(postMessage).toHaveBeenCalledOnce();
			expect(postMessage).toHaveBeenCalledWith({
				channel: 'C123456',
				thread_ts: '1234567890.123456',
				text: 'テストメッセージ',
			});
		});

		it('postMessage が成功した場合に void を返す', async () => {
			const gateway = new SlackWebApiGateway('xoxb-valid-token');

			const result = await gateway.postMessage('C123', '1234567890.000001', 'Hello');

			expect(result).toBeUndefined();
		});
	});

	describe('SlackGateway interface 適合', () => {
		it('postMessage は SlackGateway interface を満たす', () => {
			const gateway = new SlackWebApiGateway('xoxb-valid-token');
			expect(typeof gateway.postMessage).toBe('function');
		});
	});
});
