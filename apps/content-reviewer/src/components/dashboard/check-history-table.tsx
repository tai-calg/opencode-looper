import type { ContentCheckListItemDto } from '@/backend/contexts/content-check/application/usecases/content-check-list.dto';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

interface CheckHistoryTableProps {
	items: ContentCheckListItemDto[];
}

function SourceBadge({ source }: { source: 'web' | 'slack' }) {
	if (source === 'slack') {
		return (
			<Badge className="border-transparent bg-purple-500 text-white hover:bg-purple-500/80">
				Slack
			</Badge>
		);
	}
	return (
		<Badge className="border-transparent bg-blue-500 text-white hover:bg-blue-500/80">Web</Badge>
	);
}

function StatusBadge({ status }: { status: string }) {
	switch (status) {
		case 'completed':
			return (
				<Badge className="border-transparent bg-green-500 text-white hover:bg-green-500/80">
					完了
				</Badge>
			);
		case 'processing':
			return (
				<Badge className="border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80">
					処理中
				</Badge>
			);
		case 'failed':
			return (
				<Badge className="border-transparent bg-red-500 text-white hover:bg-red-500/80">失敗</Badge>
			);
		default:
			return (
				<Badge variant="outline" className="text-muted-foreground">
					待機中
				</Badge>
			);
	}
}

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('ja-JP', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

export function CheckHistoryTable({ items }: CheckHistoryTableProps) {
	if (items.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
				チェック履歴がありません
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>ソース種別</TableHead>
					<TableHead>ステータス</TableHead>
					<TableHead>サマリー</TableHead>
					<TableHead>実行日時</TableHead>
					<TableHead>操作</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.map((item) => (
					<TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
						<TableCell>
							<Link href={`/checks/${item.id}`} className="block w-full h-full">
								<SourceBadge source={item.source} />
							</Link>
						</TableCell>
						<TableCell>
							<Link href={`/checks/${item.id}`} className="block w-full h-full">
								<StatusBadge status={item.status} />
							</Link>
						</TableCell>
						<TableCell>
							<Link href={`/checks/${item.id}`} className="block w-full h-full">
								<div className="flex items-center gap-2">
									<Badge className="border-transparent bg-red-500 text-white hover:bg-red-500/80">
										エラー: {item.summary.error}
									</Badge>
									<Badge className="border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80">
										警告: {item.summary.warning}
									</Badge>
									<Badge className="border-transparent bg-blue-500 text-white hover:bg-blue-500/80">
										情報: {item.summary.info}
									</Badge>
								</div>
							</Link>
						</TableCell>
						<TableCell>
							<Link href={`/checks/${item.id}`} className="block w-full h-full text-sm">
								{formatDate(item.createdAt)}
							</Link>
						</TableCell>
						<TableCell>
							<Link
								href={`/checks/${item.id}`}
								className="text-sm text-primary underline-offset-4 hover:underline"
							>
								詳細
							</Link>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
