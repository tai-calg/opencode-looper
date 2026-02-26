import { Button } from '@/frontend/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/frontend/components/ui/card';

export default function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	return <LoginContent searchParams={searchParams} />;
}

async function LoginContent({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;
	const skipAuth = process.env.SKIP_AUTH === 'true';

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<Card className="w-[400px]">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Content Reviewer</CardTitle>
					<CardDescription>AI によるコンテンツ自動チェックシステム</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error === 'domain_restricted' && (
						<p className="text-sm text-destructive text-center">
							このドメインではログインできません
						</p>
					)}
					{error === 'auth_error' && (
						<p className="text-sm text-destructive text-center">認証エラーが発生しました</p>
					)}

					<Button className="w-full" disabled>
						Google アカウントでログイン
					</Button>

					{skipAuth && (
						<form action="/api/auth/dev-login" method="POST">
							<Button type="submit" variant="outline" className="w-full">
								開発用ログイン
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
