'use client';

import { createCheck } from '@/backend/contexts/content-check/presentation/actions/create-check.action';
import { Button } from '@/frontend/components/ui/button';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const MAX_CONTENT_LENGTH = 30000;

export function CheckForm() {
	const router = useRouter();
	const [content, setContent] = useState('');
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setPending(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const result = await createCheck({
			title: (formData.get('title') as string) || undefined,
			platform: (formData.get('platform') as string) || undefined,
			content: formData.get('content') as string,
		});

		if (result.success && result.checkId) {
			router.push(`/checks/${result.checkId}`);
		} else {
			setError(result.error ?? 'チェックの開始に失敗しました');
			setPending(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && <p className="text-sm text-destructive">{error}</p>}

			<div className="space-y-2">
				<Label htmlFor="title">タイトル（任意）</Label>
				<Input id="title" name="title" placeholder="チェック対象のタイトル" />
			</div>

			<div className="space-y-2">
				<Label htmlFor="platform">投稿先（任意）</Label>
				<Select name="platform">
					<SelectTrigger>
						<SelectValue placeholder="選択してください" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="youtube">YouTube</SelectItem>
						<SelectItem value="x">X</SelectItem>
						<SelectItem value="note">note</SelectItem>
						<SelectItem value="other">その他</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="content">本文</Label>
				<Textarea
					id="content"
					name="content"
					required
					rows={15}
					maxLength={MAX_CONTENT_LENGTH}
					placeholder="チェックしたいテキストを入力してください"
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
				<p className="text-right text-sm text-muted-foreground">
					{content.length.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}
				</p>
			</div>

			<Button type="submit" disabled={pending || content.length === 0} className="w-full">
				{pending ? 'チェック開始中...' : 'チェック開始'}
			</Button>
		</form>
	);
}
