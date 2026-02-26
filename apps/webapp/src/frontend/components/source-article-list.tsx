'use client';

import { Button } from '@/frontend/components/ui/button';
import { Checkbox } from '@/frontend/components/ui/checkbox';
import { Download, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type SourceArticleListProps = {
	sourceId: string;
	articles: {
		id: string;
		title: string;
		url: string;
		publishedAt: string | null;
		imported: boolean;
		knowledgeItemId: string | null;
	}[];
	onSync: (sourceId: string) => Promise<{ success: boolean; newCount?: number; error?: string }>;
	onImport: (
		articleIds: string[],
		sourceId: string,
	) => Promise<{ success: boolean; importedCount?: number; error?: string }>;
};

function formatDate(iso: string | null): string {
	if (!iso) return '日付不明';
	return new Date(iso).toLocaleDateString('ja-JP');
}

export function SourceArticleList({
	sourceId,
	articles,
	onSync,
	onImport,
}: SourceArticleListProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [syncing, setSyncing] = useState(false);
	const [importing, setImporting] = useState(false);

	const unimported = articles.filter((a) => !a.imported);
	const imported = articles.filter((a) => a.imported);

	function toggleSelect(id: string) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}

	function toggleAll() {
		if (selectedIds.size === unimported.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(unimported.map((a) => a.id)));
		}
	}

	async function handleSync() {
		setSyncing(true);
		await onSync(sourceId);
		setSyncing(false);
		setSelectedIds(new Set());
	}

	async function handleImport() {
		if (selectedIds.size === 0) return;
		setImporting(true);
		await onImport(Array.from(selectedIds), sourceId);
		setImporting(false);
		setSelectedIds(new Set());
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">記事一覧</h2>
				<Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
					<RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
					{syncing ? '取得中...' : '記事一覧を再取得'}
				</Button>
			</div>

			{unimported.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Checkbox
								checked={selectedIds.size === unimported.length}
								onCheckedChange={toggleAll}
							/>
							<span className="text-sm text-muted-foreground">全選択 / 全解除</span>
						</div>
						<Button size="sm" onClick={handleImport} disabled={selectedIds.size === 0 || importing}>
							<Download className="mr-2 h-4 w-4" />
							{importing ? '取り込み中...' : `選択した ${selectedIds.size} 件を取り込む`}
						</Button>
					</div>
					<div className="divide-y rounded-md border">
						{unimported.map((article) => (
							<div key={article.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
								<Checkbox
									checked={selectedIds.has(article.id)}
									onCheckedChange={() => toggleSelect(article.id)}
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{article.title}</p>
									<p className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
								</div>
								<a
									href={article.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground"
								>
									<ExternalLink className="h-4 w-4" />
								</a>
							</div>
						))}
					</div>
				</div>
			)}

			{imported.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-muted-foreground">
						取込済み ({imported.length} 件)
					</h3>
					<div className="divide-y rounded-md border">
						{imported.map((article) => (
							<div key={article.id} className="flex items-center gap-3 px-4 py-3">
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{article.title}</p>
									<p className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
								</div>
								<div className="flex items-center gap-2">
									{article.knowledgeItemId && (
										<Link
											href={`/knowledge/${article.knowledgeItemId}`}
											className="text-xs text-primary hover:underline"
										>
											ナレッジを見る
										</Link>
									)}
									<a
										href={article.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-muted-foreground hover:text-foreground"
									>
										<ExternalLink className="h-4 w-4" />
									</a>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{articles.length === 0 && (
				<p className="py-8 text-center text-sm text-muted-foreground">
					記事がありません。「記事一覧を再取得」で記事を取得してください。
				</p>
			)}
		</div>
	);
}
