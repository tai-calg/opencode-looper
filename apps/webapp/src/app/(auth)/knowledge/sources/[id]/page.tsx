import { importArticles } from '@/backend/contexts/source-management/presentation/actions/import-articles.action';
import { syncArticles } from '@/backend/contexts/source-management/presentation/actions/sync-articles.action';
import {
	type SourceDetailData,
	loadSourceDetail,
} from '@/backend/contexts/source-management/presentation/loaders/source-detail.loader';
import { SourceArticleList } from '@/frontend/components/source-article-list';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type Props = {
	params: Promise<{ id: string }>;
};

export default async function SourceDetailPage({ params }: Props) {
	const { id } = await params;
	const data = await loadSourceDetail(id);

	return (
		<div>
			<div className="mb-6">
				<Link
					href="/knowledge/sources"
					className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					ソース一覧
				</Link>
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold">{data.source.name}</h1>
					<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
						{data.source.type}
					</span>
				</div>
				<a
					href={data.source.url}
					target="_blank"
					rel="noopener noreferrer"
					className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					{data.source.url}
					<ExternalLink className="h-3 w-3" />
				</a>
			</div>

			<SourceArticleList
				sourceId={id}
				articles={data.articles}
				onSync={syncArticles}
				onImport={importArticles}
			/>
		</div>
	);
}
