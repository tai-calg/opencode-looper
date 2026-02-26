'use server';

import { redirect } from 'next/navigation';
import { clearSession } from '../composition/auth.composition';

export async function logout() {
	await clearSession();
	redirect('/login');
}
