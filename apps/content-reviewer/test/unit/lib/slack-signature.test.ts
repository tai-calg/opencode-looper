import { createHmac } from 'node:crypto';
import { verifySlackSignature } from '@/lib/slack-signature';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function buildSignature(signingSecret: string, timestamp: string, rawBody: string): string {
	const sigBasestring = `v0:${timestamp}:${rawBody}`;
	const hmac = createHmac('sha256', signingSecret);
	hmac.update(sigBasestring);
	return `v0=${hmac.digest('hex')}`;
}

describe('verifySlackSignature', () => {
	const signingSecret = 'test-signing-secret';
	const rawBody = 'token=test&payload=hello';

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns true for a valid signature with a recent timestamp', () => {
		const now = Math.floor(Date.now() / 1000);
		const timestamp = String(now);
		vi.setSystemTime(now * 1000);

		const signature = buildSignature(signingSecret, timestamp, rawBody);

		expect(verifySlackSignature(signingSecret, signature, timestamp, rawBody)).toBe(true);
	});

	it('returns false when the timestamp is more than 5 minutes old', () => {
		const now = Math.floor(Date.now() / 1000);
		const timestamp = String(now - 5 * 60 - 1);
		vi.setSystemTime(now * 1000);

		const signature = buildSignature(signingSecret, timestamp, rawBody);

		expect(verifySlackSignature(signingSecret, signature, timestamp, rawBody)).toBe(false);
	});

	it('returns false when the timestamp is more than 5 minutes in the future', () => {
		const now = Math.floor(Date.now() / 1000);
		const timestamp = String(now + 5 * 60 + 1);
		vi.setSystemTime(now * 1000);

		const signature = buildSignature(signingSecret, timestamp, rawBody);

		expect(verifySlackSignature(signingSecret, signature, timestamp, rawBody)).toBe(false);
	});

	it('returns false for an incorrect signature', () => {
		const now = Math.floor(Date.now() / 1000);
		const timestamp = String(now);
		vi.setSystemTime(now * 1000);

		expect(
			verifySlackSignature(
				signingSecret,
				'v0=invalidsignature00000000000000000000000000000000000000000000000000',
				timestamp,
				rawBody,
			),
		).toBe(false);
	});

	it('returns false when signature length differs', () => {
		const now = Math.floor(Date.now() / 1000);
		const timestamp = String(now);
		vi.setSystemTime(now * 1000);

		expect(verifySlackSignature(signingSecret, 'v0=short', timestamp, rawBody)).toBe(false);
	});

	it('returns false when signing secret is wrong', () => {
		const now = Math.floor(Date.now() / 1000);
		const timestamp = String(now);
		vi.setSystemTime(now * 1000);

		const signature = buildSignature('wrong-secret', timestamp, rawBody);

		expect(verifySlackSignature(signingSecret, signature, timestamp, rawBody)).toBe(false);
	});

	it('returns true when timestamp is exactly at 5-minute boundary', () => {
		const now = Math.floor(Date.now() / 1000);
		const timestamp = String(now - 5 * 60);
		vi.setSystemTime(now * 1000);

		const signature = buildSignature(signingSecret, timestamp, rawBody);

		expect(verifySlackSignature(signingSecret, signature, timestamp, rawBody)).toBe(true);
	});
});
