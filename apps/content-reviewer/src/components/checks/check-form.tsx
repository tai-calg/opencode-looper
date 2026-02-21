'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CheckType =
	| 'fact_check'
	| 'knowledge_consistency'
	| 'expression_rule'
	| 'risk_assessment'
	| 'quality';

type CheckStatus = 'waiting' | 'running' | 'done';

const CHECK_TYPES: CheckType[] = [
	'fact_check',
	'knowledge_consistency',
	'expression_rule',
	'risk_assessment',
	'quality',
];

const CHECK_TYPE_LABELS: Record<CheckType, string> = {
	fact_check: 'ファクトチェック',
	knowledge_consistency: 'ナレッジ整合性',
	expression_rule: '表現ルール',
	risk_assessment: '炎上リスク',
	quality: '文章クオリティ',
};

const MAX_LENGTH = 30000;

type ProgressEvent =
	| { type: 'segments_created'; data: { total: number } }
	| { type: 'check_started'; data: { segmentId: string; checkType: CheckType } }
	| { type: 'check_completed'; data: { segmentId: string; checkType: CheckType } }
	| {
			type: 'completed';
			data: { contentCheckId: string; summary: { error: number; warning: number; info: number } };
	  }
	| { type: 'error'; data: { reason: string } };

function getStatusBadgeVariant(
	status: CheckStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
	switch (status) {
		case 'waiting':
			return 'outline';
		case 'running':
			return 'secondary';
		case 'done':
			return 'default';
	}
}

function getStatusLabel(status: CheckStatus): string {
	switch (status) {
		case 'waiting':
			return '待機中';
		case 'running':
			return '実行中';
		case 'done':
			return '完了';
	}
}

export function CheckForm() {
	const router = useRouter();
	const [originalText, setOriginalText] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [segmentCount, setSegmentCount] = useState<number | null>(null);
	const [checkStatuses, setCheckStatuses] = useState<Record<CheckType, CheckStatus> | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const charCount = originalText.length;
	const isOverLimit = charCount > MAX_LENGTH;

	const handleSubmit = async () => {
		if (!originalText.trim() || isOverLimit || isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		setErrorMessage(null);
		setSegmentCount(null);
		setCheckStatuses(
			Object.fromEntries(CHECK_TYPES.map((t) => [t, 'waiting'])) as Record<CheckType, CheckStatus>,
		);

		try {
			const response = await fetch('/api/checks/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ originalText, source: 'web' }),
			});

			if (!response.ok || !response.body) {
				throw new Error(`サーバーエラー: ${response.status}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					if (!line.startsWith('data: ')) {
						continue;
					}
					const jsonStr = line.slice('data: '.length).trim();
					if (!jsonStr) {
						continue;
					}

					let event: ProgressEvent;
					try {
						event = JSON.parse(jsonStr) as ProgressEvent;
					} catch {
						continue;
					}

					if (event.type === 'segments_created') {
						setSegmentCount(event.data.total);
					} else if (event.type === 'check_started') {
						const { checkType } = event.data;
						setCheckStatuses((prev) => (prev ? { ...prev, [checkType]: 'running' } : prev));
					} else if (event.type === 'check_completed') {
						const { checkType } = event.data;
						setCheckStatuses((prev) => (prev ? { ...prev, [checkType]: 'done' } : prev));
					} else if (event.type === 'completed') {
						router.push(`/checks/${event.data.contentCheckId}`);
					} else if (event.type === 'error') {
						setErrorMessage(event.data.reason);
						setIsSubmitting(false);
					}
				}
			}
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : '予期しないエラーが発生しました');
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Textarea
					placeholder="チェックしたいテキストを入力してください（最大30,000文字）"
					className="min-h-[300px] resize-y"
					value={originalText}
					onChange={(e) => setOriginalText(e.target.value)}
					disabled={isSubmitting}
				/>
				<div
					className={`text-right text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}
				>
					{charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
				</div>
			</div>

			<Button
				onClick={handleSubmit}
				disabled={!originalText.trim() || isOverLimit || isSubmitting}
				className="w-full"
			>
				{isSubmitting ? 'チェック実行中...' : 'チェック開始'}
			</Button>

			{errorMessage && (
				<div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive text-sm">
					{errorMessage}
				</div>
			)}

			{checkStatuses && (
				<div className="space-y-4">
					{segmentCount !== null && (
						<p className="text-muted-foreground text-sm">{segmentCount} 段落に分割しました</p>
					)}
					<div className="space-y-2">
						<p className="font-medium text-sm">チェック進捗</p>
						<div className="space-y-2">
							{CHECK_TYPES.map((checkType) => {
								const status = checkStatuses[checkType];
								return (
									<div
										key={checkType}
										className="flex items-center justify-between rounded-md border p-3"
									>
										<span className="text-sm">{CHECK_TYPE_LABELS[checkType]}</span>
										<Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
