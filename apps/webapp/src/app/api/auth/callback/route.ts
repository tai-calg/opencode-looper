import { createSupabaseServerClient } from '@/backend/contexts/auth/infrastructure/supabase/supabase-client';
import { createUpsertUserOnLoginUseCase } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const origin = url.origin;

	if (!code) {
		return NextResponse.redirect(new URL('/login?error=auth_error', origin));
	}

	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		return NextResponse.redirect(new URL('/login?error=auth_error', origin));
	}

	// 認証済みユーザー情報を取得
	const {
		data: { user: authUser },
	} = await supabase.auth.getUser();

	if (!authUser || !authUser.email) {
		return NextResponse.redirect(new URL('/login?error=auth_error', origin));
	}

	// UseCase でドメイン検証 + users テーブル upsert
	const useCase = createUpsertUserOnLoginUseCase();
	const { domainAllowed } = await useCase.execute({
		id: authUser.id,
		email: authUser.email,
		name: authUser.user_metadata?.full_name ?? null,
		avatarUrl: authUser.user_metadata?.avatar_url ?? null,
	});

	if (!domainAllowed) {
		// ドメイン不許可: セッション削除してエラーリダイレクト
		await supabase.auth.signOut();
		return NextResponse.redirect(new URL('/login?error=domain_restricted', origin));
	}

	return NextResponse.redirect(new URL('/', origin));
}
