'use client';

import type { CheckDetailSection } from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { Badge } from '@/frontend/components/ui/badge';
import { Progress } from '@/frontend/components/ui/progress';

type CheckProgressProps = {
	sections: CheckDetailSection[];
	status: string;
};

const statusColors: Record<string, string> = {
	pending: 'bg-gray-200 text-gray-700',
	checking: 'bg-blue-100 text-blue-700',
	completed: 'bg-green-100 text-green-700',
	failed: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
	pending: '待機中',
	checking: 'チェック中',
	completed: '完了',
	failed: '失敗',
};

export function CheckProgress({ sections, status }: CheckProgressProps) {
	const completedCount = sections.filter(
		(s) => s.status === 'completed' || s.status === 'failed',
	).length;
	const progressPercent =
		sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span>全体進捗</span>
					<span>
						{completedCount} / {sections.length} セクション
					</span>
				</div>
				<Progress value={progressPercent} />
			</div>

			<div className="flex flex-wrap gap-2">
				{sections.map((section) => (
					<Badge key={section.id} variant="outline" className={statusColors[section.status] ?? ''}>
						セクション {section.sectionIndex + 1}: {statusLabels[section.status] ?? section.status}
					</Badge>
				))}
			</div>
		</div>
	);
}
