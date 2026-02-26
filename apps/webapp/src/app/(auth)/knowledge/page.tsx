import { createKnowledge } from '@/backend/contexts/source-management/presentation/actions/create-knowledge.action';
import {
	type KnowledgeListItem,
	loadKnowledgeList,
} from '@/backend/contexts/source-management/presentation/loaders/knowledge-list.loader';
import { KnowledgeDialog } from '@/frontend/components/knowledge-dialog';
import { KnowledgeTable } from '@/frontend/components/knowledge-table';
import { Button } from '@/frontend/components/ui/button';
import { Database, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function KnowledgePage() {
	const items = await loadKnowledgeList();

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">ナレッジ</h1>
				<div className="flex gap-2">
					<KnowledgeDialog
						trigger={
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								手動追加
							</Button>
						}
						title="ナレッジ追加"
						onSubmit={createKnowledge}
					/>
					<Button variant="outline" asChild>
						<Link href="/knowledge/sources">ソースから取り込む</Link>
					</Button>
				</div>
			</div>

			{items.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<Database className="mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 text-lg font-medium">ナレッジはまだありません</h2>
					<p className="text-sm text-muted-foreground">
						「手動追加」からナレッジを登録してください
					</p>
				</div>
			) : (
				<KnowledgeTable items={items} />
			)}
		</div>
	);
}
