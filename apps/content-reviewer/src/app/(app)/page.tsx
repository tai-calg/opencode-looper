import type { ContentCheckFilter } from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import { loadContentCheckList } from '@/backend/contexts/content-check/presentation/loaders/list-content-checks.loader';
import { CheckHistoryFilter } from '@/components/dashboard/check-history-filter';
import { CheckHistoryTable } from '@/components/dashboard/check-history-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

interface DashboardPageProps {
	searchParams: Promise<{
		source?: string;
		status?: string;
		from?: string;
		to?: string;
	}>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
	const params = await searchParams;

	const filter: ContentCheckFilter = {};
	if (params.source === 'web' || params.source === 'slack') {
		filter.source = params.source;
	}
	if (
		params.status === 'pending' ||
		params.status === 'processing' ||
		params.status === 'completed' ||
		params.status === 'failed'
	) {
		filter.status = params.status;
	}
	if (params.from) {
		filter.createdAfter = new Date(params.from);
	}
	if (params.to) {
		filter.createdBefore = new Date(params.to);
	}

	const { items } = await loadContentCheckList(filter);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">チェック履歴</h1>
				<Button asChild>
					<Link href="/checks/new">新規チェック</Link>
				</Button>
			</div>

			<Suspense>
				<CheckHistoryFilter />
			</Suspense>

			<CheckHistoryTable items={items} />
		</div>
	);
}
