import { createHmac, timingSafeEqual } from 'node:crypto';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export function verifySlackSignature(
	signingSecret: string,
	signature: string,
	timestamp: string,
	rawBody: string,
): boolean {
	const now = Math.floor(Date.now() / 1000);
	const ts = Number(timestamp);

	if (Math.abs(now - ts) > FIVE_MINUTES_IN_SECONDS) {
		return false;
	}

	const sigBasestring = `v0:${timestamp}:${rawBody}`;
	const hmac = createHmac('sha256', signingSecret);
	hmac.update(sigBasestring);
	const computedSignature = `v0=${hmac.digest('hex')}`;

	const a = Buffer.from(computedSignature, 'utf8');
	const b = Buffer.from(signature, 'utf8');

	if (a.length !== b.length) {
		return false;
	}

	return timingSafeEqual(a, b);
}
