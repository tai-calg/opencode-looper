import { cookies } from 'next/headers';

const DEV_SESSION_COOKIE = 'dev-session';

type DevSession = {
	userId: string;
	email: string;
	name: string;
	avatarUrl?: string;
};

export function createAuthService() {
	return {
		async getSession(): Promise<DevSession | null> {
			const cookieStore = await cookies();
			const raw = cookieStore.get(DEV_SESSION_COOKIE)?.value;
			if (!raw) return null;
			try {
				return JSON.parse(raw) as DevSession;
			} catch {
				return null;
			}
		},

		async setDevSession(session: DevSession): Promise<void> {
			const cookieStore = await cookies();
			cookieStore.set(DEV_SESSION_COOKIE, JSON.stringify(session), {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 7, // 7日間
			});
		},

		async clearSession(): Promise<void> {
			const cookieStore = await cookies();
			cookieStore.delete(DEV_SESSION_COOKIE);
		},
	};
}
