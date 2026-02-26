import type { SlackGateway } from '../../domain/gateways/slack.gateway';

type SlackMessage = {
	text?: string;
	bot_id?: string;
	subtype?: string;
};

export class SlackWebApiAdapter implements SlackGateway {
	constructor(private readonly botToken: string) {}

	async fetchThreadMessages(channel: string, threadTs: string): Promise<string[]> {
		const url = new URL('https://slack.com/api/conversations.replies');
		url.searchParams.set('channel', channel);
		url.searchParams.set('ts', threadTs);

		const response = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.botToken}` },
		});

		const data = (await response.json()) as {
			ok: boolean;
			error?: string;
			messages?: SlackMessage[];
		};

		if (!data.ok) {
			throw new Error(`Slack API error (conversations.replies): ${data.error}`);
		}

		const mentionPattern = /<@U[A-Z0-9]+>/g;

		return (data.messages ?? [])
			.filter((msg) => !msg.bot_id && msg.subtype !== 'bot_message')
			.map((msg) => (msg.text ?? '').replace(mentionPattern, '').trim())
			.filter((text) => text.length > 0);
	}

	async postMessage(channel: string, text: string, threadTs?: string): Promise<void> {
		const body: Record<string, string> = { channel, text };
		if (threadTs) {
			body.thread_ts = threadTs;
		}

		const response = await fetch('https://slack.com/api/chat.postMessage', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.botToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = (await response.json()) as { ok: boolean; error?: string };

		if (!data.ok) {
			throw new Error(`Slack API error (chat.postMessage): ${data.error}`);
		}
	}
}
