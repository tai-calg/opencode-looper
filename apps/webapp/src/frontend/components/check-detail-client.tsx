'use client';

import { deleteCheck } from '@/backend/contexts/content-check/presentation/actions/delete-check.action';
import { retryCheck } from '@/backend/contexts/content-check/presentation/actions/retry-check.action';
import type { CheckDetail } from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { CheckProgress } from '@/frontend/components/check-progress';
import { CheckResultView } from '@/frontend/components/check-result-view';
import { Button } from '@/frontend/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/frontend/components/ui/dialog';
import { useCheckStatus } from '@/frontend/hooks/use-check-status';
import { Link as LinkIcon, RotateCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CheckDetailClientProps = {
	initialData: CheckDetail;
};

export function CheckDetailClient({ initialData }: CheckDetailClientProps) {
	const router = useRouter();
	const { data: check, isPolling } = useCheckStatus({ initialData });
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deleting, setDeleting] = useState(false);

	async function handleDelete() {
		setDeleting(true);
		const result = await deleteCheck(check.id);
		if (result.success) {
			router.push('/');
		}
		setDeleting(false);
	}

	async function handleRetry() {
		await retryCheck(check.id);
	}

	function handleCopyLink() {
		navigator.clipboard.writeText(window.location.href);
	}

	const hasFailed = check.sections.some((s) => s.status === 'failed');

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">{check.displayTitle}</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={handleCopyLink}>
						<LinkIcon className="mr-1 h-4 w-4" />
						リンクコピー
					</Button>
					<Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
						<Trash2 className="mr-1 h-4 w-4" />
						削除
					</Button>
				</div>
			</div>

			{/* 進行中 or 失敗時のプログレス */}
			{(isPolling || check.status === 'processing') && (
				<div className="mb-6">
					<CheckProgress sections={check.sections} status={check.status} />
				</div>
			)}

			{/* 失敗時の再チェックボタン */}
			{hasFailed && !isPolling && (
				<div className="mb-6">
					<Button variant="outline" onClick={handleRetry}>
						<RotateCw className="mr-1 h-4 w-4" />
						失敗セクションを再チェック
					</Button>
				</div>
			)}

			{/* 結果表示 */}
			{check.sections.length > 0 && check.status !== 'processing' && (
				<CheckResultView check={check} />
			)}

			{/* 削除確認ダイアログ */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>チェック結果を削除しますか？</DialogTitle>
						<DialogDescription>
							「{check.displayTitle}」を削除します。この操作は取り消せません。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
							キャンセル
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleting}>
							{deleting ? '削除中...' : '削除'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
