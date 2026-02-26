import { createSource } from '@/backend/contexts/source-management/presentation/actions/create-source.action';
import {
	type SourceListItem,
	loadSourceList,
} from '@/backend/contexts/source-management/presentation/loaders/source-list.loader';
import { SourceDialog } from '@/frontend/components/source-dialog';
import { Button } from '@/frontend/components/ui/button';
import { Link2, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function SourcesPage() {
	const sources = await loadSourceList();

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">ソース接続</h1>
				<SourceDialog
					trigger={
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							新規ソース追加
						</Button>
					}
					onSubmit={createSource}
				/>
			</div>

			{sources.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<Link2 className="mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 text-lg font-medium">ソース接続はまだありません</h2>
					<p className="text-sm text-muted-foreground">
						「新規ソース追加」からソースを登録してください
					</p>
				</div>
			) : (
				<div className="grid gap-4">
					{sources.map((source) => (
						<Link
							key={source.id}
							href={`/knowledge/sources/${source.id}`}
							className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
						>
							<div className="flex items-center gap-3">
								<Link2 className="h-5 w-5 text-muted-foreground" />
								<div className="min-w-0 flex-1">
									<p className="font-medium">{source.name}</p>
									<p className="text-sm text-muted-foreground">{source.url}</p>
								</div>
								<div className="text-right text-sm text-muted-foreground">
									<p>
										取込済み {source.importedCount} 件 / 全 {source.articleCount} 件
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
