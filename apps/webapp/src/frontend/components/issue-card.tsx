'use client';

import { resolveIssue } from '@/backend/contexts/content-check/presentation/actions/resolve-issue.action';
import type { CheckDetailIssue } from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { Badge } from '@/frontend/components/ui/badge';
import { Button } from '@/frontend/components/ui/button';
import { Card, CardContent } from '@/frontend/components/ui/card';
import { cn } from '@/frontend/lib/utils';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

type IssueCardProps = {
	issue: CheckDetailIssue;
	checkId: string;
};

const categoryColors: Record<string, string> = {
	fact: 'bg-green-100 text-green-800',
	knowledge: 'bg-purple-100 text-purple-800',
	expression: 'bg-blue-100 text-blue-800',
	risk: 'bg-red-100 text-red-800',
	quality: 'bg-yellow-100 text-yellow-800',
};

const categoryLabels: Record<string, string> = {
	fact: '事実確認',
	knowledge: 'ナレッジ整合',
	expression: '表現ルール',
	risk: '炎上リスク',
	quality: '文章品質',
};

const severityColors: Record<string, string> = {
	caution: 'bg-amber-100 text-amber-800',
	needs_fix: 'bg-red-100 text-red-800',
};

const severityLabels: Record<string, string> = {
	caution: '注意',
	needs_fix: '要修正',
};

export function IssueCard({ issue, checkId }: IssueCardProps) {
	const [resolved, setResolved] = useState(issue.resolved);
	const [toggling, setToggling] = useState(false);

	async function handleToggle() {
		setToggling(true);
		const result = await resolveIssue(checkId, issue.id);
		if (result.success) {
			setResolved(!resolved);
		}
		setToggling(false);
	}

	return (
		<Card className={cn(resolved && 'opacity-50')}>
			<CardContent className="space-y-3 pt-4">
				<div className="flex items-center gap-2">
					<Badge className={categoryColors[issue.category] ?? ''}>
						{categoryLabels[issue.category] ?? issue.category}
					</Badge>
					<Badge variant="outline" className={severityColors[issue.severity] ?? ''}>
						{severityLabels[issue.severity] ?? issue.severity}
					</Badge>
				</div>

				<blockquote className="rounded bg-muted px-3 py-2 text-sm">{issue.quote}</blockquote>

				<p className="text-sm">{issue.message}</p>

				{issue.suggestion && (
					<div className="rounded border border-dashed p-2 text-sm">
						<span className="font-medium">修正案: </span>
						{issue.suggestion}
					</div>
				)}

				{issue.ruleId && issue.category === 'expression' && (
					<a
						href={`/rules?highlight=${issue.ruleId}`}
						className="text-xs text-blue-600 hover:underline"
					>
						適用ルールを確認
					</a>
				)}

				<Button
					variant="ghost"
					size="sm"
					onClick={handleToggle}
					disabled={toggling}
					className="w-full"
				>
					{resolved ? (
						<>
							<X className="mr-1 h-3 w-3" />
							未解決に戻す
						</>
					) : (
						<>
							<Check className="mr-1 h-3 w-3" />
							解決済みにする
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
