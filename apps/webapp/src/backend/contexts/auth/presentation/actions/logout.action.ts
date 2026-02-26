'use server';

import { redirect } from 'next/navigation';
import { createAuthService } from '../composition/auth.composition';

export async function logout() {
	const authService = createAuthService();
	await authService.clearSession();
	redirect('/login');
}
