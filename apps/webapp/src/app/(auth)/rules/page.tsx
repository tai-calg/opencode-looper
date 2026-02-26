import { createRule } from '@/backend/contexts/source-management/presentation/actions/create-rule.action';
import {
	type RuleListItem,
	loadRuleList,
} from '@/backend/contexts/source-management/presentation/loaders/rule-list.loader';
import { RuleDialog } from '@/frontend/components/rule-dialog';
import { RulesTable } from '@/frontend/components/rules-table';
import { Button } from '@/frontend/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';

export default async function RulesPage({
	searchParams,
}: {
	searchParams: Promise<{ highlight?: string }>;
}) {
	const { highlight } = await searchParams;
	const rules = await loadRuleList();

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">表現ルール</h1>
				<RuleDialog
					trigger={
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							ルール追加
						</Button>
					}
					title="ルール追加"
					onSubmit={createRule}
				/>
			</div>

			{rules.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 text-lg font-medium">表現ルールはまだありません</h2>
					<p className="text-sm text-muted-foreground">
						「ルール追加」から NG 表現と OK 表現のルールを登録してください
					</p>
				</div>
			) : (
				<RulesTable rules={rules} highlightId={highlight} />
			)}
		</div>
	);
}
