import { cookies } from 'next/headers';
import { UpsertUserOnLoginUseCase } from '../../application/usecases/upsert-user-on-login.usecase';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { createSupabaseServerClient } from '../../infrastructure/supabase/supabase-client';

const DEV_SESSION_COOKIE = 'dev-session';

type DevSession = {
	userId: string;
	email: string;
	name: string;
	avatarUrl?: string;
};

export type SessionUser = {
	id: string;
	email: string;
	name: string;
	avatarUrl?: string;
};

/**
 * セッション取得（Supabase Auth / 開発用 Cookie の二系統を統合）
 */
export async function getSession(): Promise<SessionUser | null> {
	const skipAuth = process.env.SKIP_AUTH === 'true';

	if (skipAuth) {
		// 開発用 Cookie からセッション取得
		const cookieStore = await cookies();
		const raw = cookieStore.get(DEV_SESSION_COOKIE)?.value;
		if (!raw) return null;
		try {
			const devSession = JSON.parse(raw) as DevSession;
			return {
				id: devSession.userId,
				email: devSession.email,
				name: devSession.name,
				avatarUrl: devSession.avatarUrl,
			};
		} catch {
			return null;
		}
	}

	// Supabase Auth からセッション取得
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user || !user.email) return null;

	return {
		id: user.id,
		email: user.email,
		name: user.user_metadata?.full_name ?? user.email.split('@')[0],
		avatarUrl: user.user_metadata?.avatar_url ?? undefined,
	};
}

/**
 * 開発用セッション設定（SKIP_AUTH=true 時のみ使用）
 */
export async function setDevSession(session: DevSession): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(DEV_SESSION_COOKIE, JSON.stringify(session), {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	});
}

/**
 * セッションクリア（Supabase signOut / 開発用 Cookie 削除）
 */
export async function clearSession(): Promise<void> {
	const skipAuth = process.env.SKIP_AUTH === 'true';

	if (skipAuth) {
		const cookieStore = await cookies();
		cookieStore.delete(DEV_SESSION_COOKIE);
		return;
	}

	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();
}

/**
 * UpsertUserOnLoginUseCase のファクトリ
 */
export function createUpsertUserOnLoginUseCase(): UpsertUserOnLoginUseCase {
	return new UpsertUserOnLoginUseCase(new PrismaUserRepository());
}
