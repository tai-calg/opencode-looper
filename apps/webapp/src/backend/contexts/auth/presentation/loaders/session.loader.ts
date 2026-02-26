import { getSession } from '../composition/auth.composition';
import type { SessionUser } from '../composition/auth.composition';

export type { SessionUser };

export async function loadSession(): Promise<SessionUser | null> {
	return getSession();
}
