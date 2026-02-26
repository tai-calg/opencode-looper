'use client';

import type { CheckDetail } from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { IssueCard } from '@/frontend/components/issue-card';
import { Separator } from '@/frontend/components/ui/separator';

type CheckResultViewProps = {
	check: CheckDetail;
};

export function CheckResultView({ check }: CheckResultViewProps) {
	return (
		<div className="flex gap-6">
			{/* 左カラム: セクション本文 */}
			<div className="w-[55%] space-y-6">
				{check.sections.map((section, index) => (
					<div key={section.id}>
						{index > 0 && <Separator className="mb-6" />}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">
								セクション {section.sectionIndex + 1}
							</h3>
							<p className="whitespace-pre-wrap text-sm leading-relaxed">{section.content}</p>
						</div>
					</div>
				))}
			</div>

			{/* 右カラム: 指摘カード */}
			<div className="w-[45%] space-y-6">
				{check.sections.map((section) => (
					<div key={section.id} className="space-y-3">
						{section.issues.length > 0 && (
							<h3 className="text-sm font-medium text-muted-foreground">
								セクション {section.sectionIndex + 1} の指摘（{section.issues.length}件）
							</h3>
						)}
						{section.issues.map((issue) => (
							<IssueCard key={issue.id} issue={issue} checkId={check.id} />
						))}
					</div>
				))}
			</div>
		</div>
	);
}
