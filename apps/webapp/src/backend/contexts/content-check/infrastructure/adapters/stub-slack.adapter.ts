import type { SlackGateway } from '../../domain/gateways/slack.gateway';

export class StubSlackAdapter implements SlackGateway {
	async fetchThreadMessages(_channel: string, _threadTs: string): Promise<string[]> {
		return [
			'これはテスト用のスレッドメッセージです。',
			'二つ目のメッセージです。内容をチェックしてください。',
		];
	}

	async postMessage(channel: string, text: string, threadTs?: string): Promise<void> {
		console.log('[StubSlack] postMessage:', { channel, text: text.slice(0, 100), threadTs });
	}
}
