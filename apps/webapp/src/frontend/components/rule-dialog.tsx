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
import { Textarea } from '@/frontend/components/ui/textarea';
import { useState } from 'react';

type RuleDialogProps = {
	trigger: React.ReactNode;
	title: string;
	defaultValues?: {
		ngExpression: string;
		okExpression: string;
		description: string;
	};
	onSubmit: (params: {
		ngExpression: string;
		okExpression: string;
		description?: string;
	}) => Promise<{ success: boolean; error?: string }>;
};

export function RuleDialog({ trigger, title, defaultValues, onSubmit }: RuleDialogProps) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setPending(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const result = await onSubmit({
			ngExpression: formData.get('ngExpression') as string,
			okExpression: formData.get('okExpression') as string,
			description: (formData.get('description') as string) || undefined,
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div className="space-y-2">
						<Label htmlFor="ngExpression">NG 表現</Label>
						<Input
							id="ngExpression"
							name="ngExpression"
							required
							placeholder="例: させていただく"
							defaultValue={defaultValues?.ngExpression}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="okExpression">OK 表現</Label>
						<Input
							id="okExpression"
							name="okExpression"
							required
							placeholder="例: いたします"
							defaultValue={defaultValues?.okExpression}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">説明（任意）</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="このルールの説明"
							defaultValue={defaultValues?.description}
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
