import { createHmac, timingSafeEqual } from 'node:crypto';
import { createHandleSlackMentionUseCase } from '@/backend/contexts/content-check/presentation/composition/content-check.composition';
import { after } from 'next/server';

// Vercel Fluid Compute: AI チェック処理に十分な時間を確保
export const maxDuration = 300;

export async function POST(request: Request): Promise<Response> {
	// 1. Slack リトライの場合はスキップ（重複処理防止）
	if (request.headers.get('x-slack-retry-num')) {
		return Response.json({ ok: true });
	}

	// 2. リクエストボディを raw text で取得（署名検証に必要）
	const rawBody = await request.text();

	// 3. 署名検証
	const timestamp = request.headers.get('x-slack-request-timestamp') ?? '';
	const signature = request.headers.get('x-slack-signature') ?? '';
	const signingSecret = process.env.SLACK_SIGNING_SECRET ?? '';

	if (!verifySlackSignature(rawBody, timestamp, signature, signingSecret)) {
		return new Response('Invalid signature', { status: 401 });
	}

	// 4. ペイロード解析
	const payload = JSON.parse(rawBody) as SlackEventPayload;

	// 5. URL verification challenge（Slack App 初回設定時）
	if (payload.type === 'url_verification') {
		return Response.json({ challenge: payload.challenge });
	}

	// 6. app_mention イベント処理
	if (payload.type === 'event_callback' && payload.event?.type === 'app_mention') {
		const { channel, thread_ts, ts } = payload.event;
		const threadTs = thread_ts ?? ts; // スレッド外メンションの場合はメッセージ自身の ts を使用
		const appUrl = new URL(request.url).origin;

		after(async () => {
			try {
				const useCase = createHandleSlackMentionUseCase();
				await useCase.execute({ channel, threadTs, appUrl });
			} catch (error) {
				console.error('[Slack] HandleSlackMention failed:', error);
			}
		});
	}

	// 7. Slack に即座に 200 応答（3秒以内のレスポンス要件を満たす）
	return Response.json({ ok: true });
}

// --- Slack 署名検証 ---

function verifySlackSignature(
	body: string,
	timestamp: string,
	signature: string,
	secret: string,
): boolean {
	if (!timestamp || !signature || !secret) {
		return false;
	}

	// リプレイ攻撃防止: 5分以上前のリクエストは拒否
	const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
	if (Number.parseInt(timestamp, 10) < fiveMinutesAgo) {
		return false;
	}

	const sigBaseString = `v0:${timestamp}:${body}`;
	const mySignature = `v0=${createHmac('sha256', secret).update(sigBaseString).digest('hex')}`;

	try {
		return timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
	} catch {
		return false;
	}
}

// --- Slack Event 型定義（ファイル内ローカル） ---

type SlackEventPayload = {
	type: string;
	challenge?: string;
	event?: {
		type: string;
		user: string;
		text: string;
		ts: string;
		channel: string;
		thread_ts?: string;
	};
};
