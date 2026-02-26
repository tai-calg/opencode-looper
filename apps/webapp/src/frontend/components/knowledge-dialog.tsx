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
import { Textarea } from '@/frontend/components/ui/textarea';
import { useState } from 'react';

type KnowledgeDialogProps = {
	trigger: React.ReactNode;
	title: string;
	defaultValues?: {
		title: string;
		sourceType: string;
		sourceUrl: string;
		content: string;
	};
	onSubmit: (params: {
		title: string;
		sourceType: string;
		content: string;
		sourceUrl?: string;
	}) => Promise<{ success: boolean; error?: string }>;
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
	manual: '手動',
	note: 'note',
	manifesto: 'マニフェスト',
};

export function KnowledgeDialog({ trigger, title, defaultValues, onSubmit }: KnowledgeDialogProps) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [sourceType, setSourceType] = useState(defaultValues?.sourceType ?? 'manual');

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setPending(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const result = await onSubmit({
			title: formData.get('title') as string,
			sourceType,
			content: formData.get('content') as string,
			sourceUrl: (formData.get('sourceUrl') as string) || undefined,
		});

		setPending(false);
		if (result.success) {
			setOpen(false);
		} else {
			setError(result.error ?? '保存に失敗しました');
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div className="space-y-2">
						<Label htmlFor="title">タイトル</Label>
						<Input
							id="title"
							name="title"
							required
							placeholder="ナレッジのタイトル"
							defaultValue={defaultValues?.title}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>ソース種別</Label>
							<Select value={sourceType} onValueChange={setSourceType}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="manual">手動</SelectItem>
									<SelectItem value="note">note</SelectItem>
									<SelectItem value="manifesto">マニフェスト</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="sourceUrl">ソース URL（任意）</Label>
							<Input
								id="sourceUrl"
								name="sourceUrl"
								placeholder="https://..."
								defaultValue={defaultValues?.sourceUrl}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="content">本文</Label>
						<Textarea
							id="content"
							name="content"
							required
							rows={10}
							placeholder="ナレッジの本文を入力してください"
							defaultValue={defaultValues?.content}
						/>
					</div>
					<Button type="submit" disabled={pending} className="w-full">
						{pending ? '保存中...' : '保存'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
