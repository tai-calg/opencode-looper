'use client';

import { Button } from '@/frontend/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/frontend/components/ui/dialog';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/frontend/components/ui/select';
import { useState } from 'react';

type SourceDialogProps = {
	trigger: React.ReactNode;
	onSubmit: (params: {
		type: string;
		name: string;
		url: string;
	}) => Promise<{ success: boolean; error?: string }>;
};

export function SourceDialog({ trigger, onSubmit }: SourceDialogProps) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [sourceType, setSourceType] = useState('note');

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setPending(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const result = await onSubmit({
			type: sourceType,
			name: formData.get('name') as string,
			url: formData.get('url') as string,
		});

		setPending(false);
		if (result.success) {
			setOpen(false);
		} else {
			setError(result.error ?? '作成に失敗しました');
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>新規ソース追加</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div className="space-y-2">
						<Label>ソース種別</Label>
						<Select value={sourceType} onValueChange={setSourceType}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="note">note</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="name">アカウント名</Label>
						<Input id="name" name="name" required placeholder="アカウント名" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="url">URL</Label>
						<Input id="url" name="url" required placeholder="https://note.com/username" />
					</div>
					<Button type="submit" disabled={pending} className="w-full">
						{pending ? '追加中...' : '追加'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
