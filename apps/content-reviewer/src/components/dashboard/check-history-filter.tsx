'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type Source = 'all' | 'web' | 'slack';
type Status = 'all' | 'pending' | 'processing' | 'completed' | 'failed';

const SOURCE_OPTIONS: { value: Source; label: string }[] = [
	{ value: 'all', label: '全て' },
	{ value: 'web', label: 'Web' },
	{ value: 'slack', label: 'Slack' },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
	{ value: 'all', label: '全て' },
	{ value: 'pending', label: 'pending' },
	{ value: 'processing', label: 'processing' },
	{ value: 'completed', label: 'completed' },
	{ value: 'failed', label: 'failed' },
];

export function CheckHistoryFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const source = (searchParams.get('source') ?? 'all') as Source;
	const status = (searchParams.get('status') ?? 'all') as Status;
	const from = searchParams.get('from') ?? '';
	const to = searchParams.get('to') ?? '';

	const updateParams = useCallback(
		(updates: Partial<{ source: Source; status: Status; from: string; to: string }>) => {
			const params = new URLSearchParams(searchParams.toString());

			const newSource = updates.source ?? source;
			const newStatus = updates.status ?? status;
			const newFrom = updates.from !== undefined ? updates.from : from;
			const newTo = updates.to !== undefined ? updates.to : to;

			if (newSource === 'all') {
				params.delete('source');
			} else {
				params.set('source', newSource);
			}

			if (newStatus === 'all') {
				params.delete('status');
			} else {
				params.set('status', newStatus);
			}

			if (newFrom) {
				params.set('from', newFrom);
			} else {
				params.delete('from');
			}

			if (newTo) {
				params.set('to', newTo);
			} else {
				params.delete('to');
			}

			const query = params.toString();
			router.push(query ? `?${query}` : '?');
		},
		[router, searchParams, source, status, from, to],
	);

	return (
		<div className="flex flex-wrap items-end gap-4">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="filter-source">ソース種別</Label>
				<Select value={source} onValueChange={(value) => updateParams({ source: value as Source })}>
					<SelectTrigger id="filter-source" className="w-36">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{SOURCE_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="filter-status">ステータス</Label>
				<Select value={status} onValueChange={(value) => updateParams({ status: value as Status })}>
					<SelectTrigger id="filter-status" className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{STATUS_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="filter-from">開始日</Label>
				<Input
					id="filter-from"
					type="date"
					className="w-40"
					value={from}
					onChange={(e) => updateParams({ from: e.target.value })}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="filter-to">終了日</Label>
				<Input
					id="filter-to"
					type="date"
					className="w-40"
					value={to}
					onChange={(e) => updateParams({ to: e.target.value })}
				/>
			</div>
		</div>
	);
}
