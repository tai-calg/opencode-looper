import {
	isSkipAuth,
	setDevSession,
} from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	if (!isSkipAuth()) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	await setDevSession({
		userId: 'dev-user-id',
		email: 'dev@team-mir.ai',
		name: '開発ユーザー',
	});

	return NextResponse.redirect(new URL('/', request.url));
}
