import { createSupabaseMiddlewareClient } from '@/backend/contexts/auth/infrastructure/supabase/supabase-client';
import { isSkipAuth } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
	const response = NextResponse.next({ request });

	// SKIP_AUTH=true かつ非 production のときは middleware で認証チェックしない
	if (isSkipAuth()) {
		return response;
	}

	const supabase = createSupabaseMiddlewareClient(request, response);

	// セッションの自動リフレッシュ（これにより期限切れトークンが更新される）
	await supabase.auth.getUser();

	return response;
}

export const config = {
	matcher: [
		// 静的ファイルと _next を除外
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
