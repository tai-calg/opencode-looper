import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Server Component / Route Handler / Server Action 用 Supabase クライアント。
 * Cookie ベースのセッション管理を行う。
 */
export async function createSupabaseServerClient() {
	const cookieStore = await cookies();
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						cookieStore.set(name, value, options);
					}
				},
			},
		},
	);
}

/**
 * Middleware 用 Supabase クライアント。
 * NextRequest/NextResponse の Cookie を操作する。
 */
export function createSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						request.cookies.set(name, value);
						response.cookies.set(name, value, options);
					}
				},
			},
		},
	);
}
