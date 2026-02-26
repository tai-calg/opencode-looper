'use client';

import { cn } from '@/frontend/lib/utils';
import { BookOpen, Database, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
	{ href: '/', label: 'チェック一覧', icon: ListChecks },
	{ href: '/rules', label: '表現ルール', icon: BookOpen },
	{ href: '/knowledge', label: 'ナレッジ', icon: Database },
];

export function Sidebar() {
	const pathname = usePathname();

	const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

	return (
		<div className="flex flex-1 flex-col p-4">
			<div className="mb-6 px-3 text-lg font-bold">Content Reviewer</div>
			<nav className="flex-1 space-y-1">
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
							isActive(item.href)
								? 'bg-accent font-medium text-accent-foreground'
								: 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
						)}
					>
						<item.icon className="h-4 w-4" />
						{item.label}
					</Link>
				))}
			</nav>
		</div>
	);
}
