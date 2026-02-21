import type {
	CheckResultDetailDto,
	ContentSegmentDetailDto,
} from '@/backend/contexts/content-check/application/usecases/content-check-detail.dto';
import { Badge } from '@/components/ui/badge';

const CHECK_TYPE_LABELS: Record<string, string> = {
	fact_check: 'ファクトチェック',
	knowledge_consistency: 'ナレッジ整合性',
	expression_rule: '表現ルール',
	risk_assessment: '炎上リスク',
	quality: '文章クオリティ',
};

function SeverityBadge({ severity }: { severity: string }) {
	if (severity === 'error') {
		return (
			<Badge className="bg-red-500 hover:bg-red-500/80 text-white border-transparent">エラー</Badge>
		);
	}
	if (severity === 'warning') {
		return (
			<Badge className="bg-yellow-500 hover:bg-yellow-500/80 text-white border-transparent">
				警告
			</Badge>
		);
	}
	return (
		<Badge className="bg-blue-500 hover:bg-blue-500/80 text-white border-transparent">情報</Badge>
	);
}

function CheckResultItem({ result }: { result: CheckResultDetailDto }) {
	return (
		<div className="border rounded-md p-3 space-y-1">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium">
					{CHECK_TYPE_LABELS[result.checkType] ?? result.checkType}
				</span>
				<SeverityBadge severity={result.severity} />
			</div>
			<p className="text-sm text-foreground">{result.message}</p>
			{result.suggestion && (
				<p className="text-sm text-muted-foreground">
					<span className="font-medium">提案: </span>
					{result.suggestion}
				</p>
			)}
		</div>
	);
}

interface CheckResultSegmentProps {
	segment: ContentSegmentDetailDto;
}

export function CheckResultSegment({ segment }: CheckResultSegmentProps) {
	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="bg-muted px-4 py-2">
				<span className="text-xs font-medium text-muted-foreground">
					段落 {segment.segmentIndex + 1}
				</span>
			</div>
			<div className="p-4 space-y-3">
				<p className="text-sm whitespace-pre-wrap">{segment.text}</p>
				{segment.results.length > 0 && (
					<div className="space-y-2">
						{segment.results.map((result) => (
							<CheckResultItem key={result.id} result={result} />
						))}
					</div>
				)}
				{segment.results.length === 0 && (
					<p className="text-sm text-muted-foreground">問題は検出されませんでした。</p>
				)}
			</div>
		</div>
	);
}
