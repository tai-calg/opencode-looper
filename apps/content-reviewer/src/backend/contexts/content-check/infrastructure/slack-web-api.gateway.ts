import type { SlackGateway } from '@/backend/contexts/content-check/domain/gateways/slack.gateway';
import { WebClient } from '@slack/web-api';

const STUB_TOKENS = ['', 'dummy', 'test'] as const;

function isStubMode(token: string | undefined): boolean {
	if (token === undefined) return true;
	return (STUB_TOKENS as readonly string[]).includes(token);
}

export class SlackWebApiGateway implements SlackGateway {
	private readonly client: WebClient;
	private readonly stubMode: boolean;

	constructor(token: string | undefined = process.env.SLACK_BOT_TOKEN) {
		this.stubMode = isStubMode(token);
		this.client = new WebClient(this.stubMode ? undefined : token);
	}

	async postMessage(channelId: string, threadTs: string, text: string): Promise<void> {
		if (this.stubMode) {
			console.log('[SlackWebApiGateway] stub mode — skipping API call', {
				channelId,
				threadTs,
				text,
			});
			return;
		}

		await this.client.chat.postMessage({
			channel: channelId,
			thread_ts: threadTs,
			text,
		});
	}
}
