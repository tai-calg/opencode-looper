import { createAuthService } from '../composition/auth.composition';

export type SessionUser = {
	id: string;
	email: string;
	name: string;
	avatarUrl?: string;
};

export async function loadSession(): Promise<SessionUser | null> {
	const authService = createAuthService();
	const session = await authService.getSession();
	if (!session) return null;
	return {
		id: session.userId,
		email: session.email,
		name: session.name,
		avatarUrl: session.avatarUrl,
	};
}
