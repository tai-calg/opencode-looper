import { Button } from '@/frontend/components/ui/button';
import { ListChecks, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
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

			{/* 空状態 */}
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
				<ListChecks className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="mb-2 text-lg font-medium">チェック結果はまだありません</h2>
				<p className="text-sm text-muted-foreground">
					「新規チェック」からコンテンツのチェックを開始してください
				</p>
			</div>
		</div>
	);
}
