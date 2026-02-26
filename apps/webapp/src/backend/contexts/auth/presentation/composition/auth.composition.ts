import { cookies } from 'next/headers';
import { z } from 'zod';
import { UpsertUserOnLoginUseCase } from '../../application/usecases/upsert-user-on-login.usecase';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { createSupabaseServerClient } from '../../infrastructure/supabase/supabase-client';

const DEV_SESSION_COOKIE = 'dev-session';

/**
 * 開発用認証スキップが有効かどうかを判定する。
 * production 環境では常に false を返す。
 */
export function isSkipAuth(): boolean {
	return process.env.SKIP_AUTH === 'true' && process.env.NODE_ENV !== 'production';
}

const DevSessionSchema = z.object({
	userId: z.string(),
	email: z.string(),
	name: z.string(),
	avatarUrl: z.string().optional(),
});

type DevSession = z.infer<typeof DevSessionSchema>;

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
	if (isSkipAuth()) {
		// 開発用 Cookie からセッション取得
		const cookieStore = await cookies();
		const raw = cookieStore.get(DEV_SESSION_COOKIE)?.value;
		if (!raw) return null;
		try {
			const parsed = DevSessionSchema.safeParse(JSON.parse(raw));
			if (!parsed.success) return null;
			return {
				id: parsed.data.userId,
				email: parsed.data.email,
				name: parsed.data.name,
				avatarUrl: parsed.data.avatarUrl,
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
	if (isSkipAuth()) {
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
