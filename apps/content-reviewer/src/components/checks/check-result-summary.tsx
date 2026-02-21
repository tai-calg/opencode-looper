import type { ContentCheckSummaryDto } from '@/backend/contexts/content-check/application/usecases/content-check-detail.dto';
import { Badge } from '@/components/ui/badge';

interface CheckResultSummaryProps {
	summary: ContentCheckSummaryDto;
}

export function CheckResultSummary({ summary }: CheckResultSummaryProps) {
	return (
		<div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
			<span className="text-sm font-medium text-muted-foreground">チェック結果サマリー</span>
			<div className="flex items-center gap-2">
				<Badge className="bg-red-500 hover:bg-red-500/80 text-white border-transparent">
					エラー: {summary.error}
				</Badge>
				<Badge className="bg-yellow-500 hover:bg-yellow-500/80 text-white border-transparent">
					警告: {summary.warning}
				</Badge>
				<Badge className="bg-blue-500 hover:bg-blue-500/80 text-white border-transparent">
					情報: {summary.info}
				</Badge>
			</div>
		</div>
	);
}
