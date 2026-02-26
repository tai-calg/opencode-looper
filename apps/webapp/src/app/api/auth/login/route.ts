import { createSupabaseServerClient } from '@/backend/contexts/auth/infrastructure/supabase/supabase-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const supabase = await createSupabaseServerClient();
	const origin = new URL(request.url).origin;

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${origin}/api/auth/callback`,
			queryParams: {
				hd: 'team-mir.ai',
			},
		},
	});

	if (error || !data.url) {
		return NextResponse.redirect(new URL('/login?error=auth_error', origin));
	}

	return NextResponse.redirect(data.url);
}
