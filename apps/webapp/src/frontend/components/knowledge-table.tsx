'use client';

import { deleteKnowledge } from '@/backend/contexts/source-management/presentation/actions/delete-knowledge.action';
import { updateKnowledge } from '@/backend/contexts/source-management/presentation/actions/update-knowledge.action';
import type { KnowledgeListItem } from '@/backend/contexts/source-management/presentation/loaders/knowledge-list.loader';
import { KnowledgeDialog } from '@/frontend/components/knowledge-dialog';
import { Badge } from '@/frontend/components/ui/badge';
import { Button } from '@/frontend/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/frontend/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/frontend/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

type KnowledgeTableProps = {
	items: KnowledgeListItem[];
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
	manual: '手動',
	note: 'note',
	manifesto: 'マニフェスト',
};

export function KnowledgeTable({ items }: KnowledgeTableProps) {
	const [deleteTarget, setDeleteTarget] = useState<KnowledgeListItem | null>(null);
	const [deleting, setDeleting] = useState(false);

	async function handleDelete() {
		if (!deleteTarget) return;
		setDeleting(true);
		await deleteKnowledge(deleteTarget.id);
		setDeleting(false);
		setDeleteTarget(null);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>タイトル</TableHead>
						<TableHead className="w-32">ソース種別</TableHead>
						<TableHead className="w-40">登録日</TableHead>
						<TableHead className="w-24 text-center">操作</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="font-medium">{item.title}</TableCell>
							<TableCell>
								<Badge variant="secondary">
									{SOURCE_TYPE_LABELS[item.sourceType] ?? item.sourceType}
								</Badge>
							</TableCell>
							<TableCell className="text-muted-foreground">
								{new Date(item.createdAt).toLocaleDateString('ja-JP')}
							</TableCell>
							<TableCell className="text-center">
								<div className="flex items-center justify-center gap-1">
									<KnowledgeDialog
										trigger={
											<Button variant="ghost" size="icon">
												<Pencil className="h-4 w-4" />
											</Button>
										}
										title="ナレッジ編集"
										defaultValues={{
											title: item.title,
											sourceType: item.sourceType,
											sourceUrl: item.sourceUrl ?? '',
											content: item.content,
										}}
										onSubmit={async (params) => updateKnowledge(item.id, params)}
									/>
									<Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item)}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* 削除確認ダイアログ */}
			<Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ナレッジを削除しますか？</DialogTitle>
						<DialogDescription>
							「{deleteTarget?.title}」を削除します。この操作は取り消せません。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteTarget(null)}>
							キャンセル
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleting}>
							{deleting ? '削除中...' : '削除'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
