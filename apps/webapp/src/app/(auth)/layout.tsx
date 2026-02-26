import { logout } from '@/backend/contexts/auth/presentation/actions/logout.action';
import { loadSession } from '@/backend/contexts/auth/presentation/loaders/session.loader';
import { Sidebar } from '@/frontend/components/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar';
import { Button } from '@/frontend/components/ui/button';
import { Separator } from '@/frontend/components/ui/separator';
import { LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const skipAuth = process.env.SKIP_AUTH === 'true';
	const session = await loadSession();

	if (!session && !skipAuth) {
		redirect('/login');
	}

	return (
		<div className="flex h-screen">
			{/* サイドバー: 固定幅 240px */}
			<aside className="flex h-full w-60 flex-col border-r bg-muted/40">
				<Sidebar />

				{session && (
					<>
						<Separator />
						<div className="p-4">
							<div className="mb-2 flex items-center gap-2">
								<Avatar className="h-8 w-8">
									{session.avatarUrl && <AvatarImage src={session.avatarUrl} alt={session.name} />}
									<AvatarFallback>{session.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<span className="truncate text-sm">{session.name}</span>
							</div>
							<form action={logout}>
								<Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
									<LogOut className="mr-2 h-4 w-4" />
									ログアウト
								</Button>
							</form>
						</div>
					</>
				)}
			</aside>

			{/* メインコンテンツ */}
			<main className="flex-1 overflow-auto">
				<div className="mx-auto max-w-5xl p-6">{children}</div>
			</main>
		</div>
	);
}
