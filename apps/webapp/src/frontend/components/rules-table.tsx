'use client';

import { deleteRule } from '@/backend/contexts/source-management/presentation/actions/delete-rule.action';
import { toggleRule } from '@/backend/contexts/source-management/presentation/actions/toggle-rule.action';
import { updateRule } from '@/backend/contexts/source-management/presentation/actions/update-rule.action';
import type { RuleListItem } from '@/backend/contexts/source-management/presentation/loaders/rule-list.loader';
import { RuleDialog } from '@/frontend/components/rule-dialog';
import { Button } from '@/frontend/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/frontend/components/ui/dialog';
import { Switch } from '@/frontend/components/ui/switch';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/frontend/components/ui/table';
import { cn } from '@/frontend/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

type RulesTableProps = {
	rules: RuleListItem[];
	highlightId?: string;
};

export function RulesTable({ rules, highlightId }: RulesTableProps) {
	const [deleteTarget, setDeleteTarget] = useState<RuleListItem | null>(null);
	const [deleting, setDeleting] = useState(false);

	async function handleDelete() {
		if (!deleteTarget) return;
		setDeleting(true);
		await deleteRule(deleteTarget.id);
		setDeleting(false);
		setDeleteTarget(null);
	}

	async function handleToggle(id: string) {
		await toggleRule(id);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>NG 表現</TableHead>
						<TableHead>OK 表現</TableHead>
						<TableHead>説明</TableHead>
						<TableHead className="w-24 text-center">有効</TableHead>
						<TableHead className="w-24 text-center">操作</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rules.map((rule) => (
						<TableRow
							key={rule.id}
							className={cn(
								!rule.enabled && 'opacity-50',
								highlightId === rule.id && 'bg-yellow-50',
							)}
						>
							<TableCell className="font-medium">{rule.ngExpression}</TableCell>
							<TableCell>{rule.okExpression}</TableCell>
							<TableCell className="text-muted-foreground">{rule.description || '—'}</TableCell>
							<TableCell className="text-center">
								<Switch checked={rule.enabled} onCheckedChange={() => handleToggle(rule.id)} />
							</TableCell>
							<TableCell className="text-center">
								<div className="flex items-center justify-center gap-1">
									<RuleDialog
										trigger={
											<Button variant="ghost" size="icon">
												<Pencil className="h-4 w-4" />
											</Button>
										}
										title="ルール編集"
										defaultValues={{
											ngExpression: rule.ngExpression,
											okExpression: rule.okExpression,
											description: rule.description || '',
										}}
										onSubmit={async (params) => updateRule(rule.id, params)}
									/>
									<Button variant="ghost" size="icon" onClick={() => setDeleteTarget(rule)}>
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
						<DialogTitle>ルールを削除しますか？</DialogTitle>
						<DialogDescription>
							「{deleteTarget?.ngExpression} → {deleteTarget?.okExpression}」
							を削除します。この操作は取り消せません。
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
