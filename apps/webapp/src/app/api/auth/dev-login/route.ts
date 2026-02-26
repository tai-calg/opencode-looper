import { createAuthService } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	if (process.env.SKIP_AUTH !== 'true') {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	const authService = createAuthService();
	await authService.setDevSession({
		userId: 'dev-user-id',
		email: 'dev@team-mir.ai',
		name: '開発ユーザー',
	});

	return NextResponse.redirect(new URL('/', request.url));
}
