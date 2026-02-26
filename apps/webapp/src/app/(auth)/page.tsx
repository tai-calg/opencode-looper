import { getSession } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { loadCheckList } from '@/backend/contexts/content-check/presentation/loaders/check-list.loader';
import { Badge } from '@/frontend/components/ui/badge';
import { Button } from '@/frontend/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/frontend/components/ui/table';
import { ListChecks, Plus } from 'lucide-react';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
	processing: 'チェック中',
	completed: '完了',
	failed: '失敗',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
	processing: 'secondary',
	completed: 'default',
	failed: 'destructive',
};

export default async function DashboardPage() {
	const session = await getSession();
	const { checks, total } = await loadCheckList({ limit: 20, userId: session?.id });

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">チェック一覧</h1>
				<Button asChild>
					<Link href="/checks/new">
						<Plus className="mr-2 h-4 w-4" />
						新規チェック
					</Link>
				</Button>
			</div>

			{checks.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<ListChecks className="mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 text-lg font-medium">チェック結果はまだありません</h2>
					<p className="text-sm text-muted-foreground">
						「新規チェック」からコンテンツのチェックを開始してください
					</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>タイトル</TableHead>
							<TableHead className="w-24">投稿先</TableHead>
							<TableHead className="w-24">ステータス</TableHead>
							<TableHead className="w-40">チェック日時</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{checks.map((check) => (
							<TableRow key={check.id} className="cursor-pointer">
								<TableCell>
									<Link href={`/checks/${check.id}`} className="hover:underline">
										{check.displayTitle}
									</Link>
								</TableCell>
								<TableCell>{check.platform ?? '—'}</TableCell>
								<TableCell>
									<Badge variant={statusVariants[check.status] ?? 'secondary'}>
										{statusLabels[check.status] ?? check.status}
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{new Date(check.createdAt).toLocaleString('ja-JP')}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
