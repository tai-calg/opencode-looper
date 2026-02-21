import type { ContentCheckDetailDto } from '@/backend/contexts/content-check/application/usecases/content-check-detail.dto';
import { loadContentCheckDetail } from '@/backend/contexts/content-check/presentation/loaders/get-content-check-detail.loader';
import { CheckResultSegment } from '@/components/checks/check-result-segment';
import { CheckResultSummary } from '@/components/checks/check-result-summary';
import { notFound } from 'next/navigation';

export default async function CheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	let detail: ContentCheckDetailDto;
	try {
		detail = await loadContentCheckDetail(id);
	} catch {
		notFound();
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">チェック結果詳細</h1>
				<p className="text-muted-foreground text-sm mt-1">
					ステータス: {detail.status} ・ 作成日:{' '}
					{new Date(detail.createdAt).toLocaleDateString('ja-JP')}
				</p>
			</div>
			<CheckResultSummary summary={detail.summary} />
			<div className="space-y-4">
				{detail.segments.map((segment) => (
					<CheckResultSegment key={segment.id} segment={segment} />
				))}
			</div>
		</div>
	);
}
