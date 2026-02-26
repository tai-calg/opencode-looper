import { Button } from '@/frontend/components/ui/button';
import { Database, Plus } from 'lucide-react';

export default function KnowledgePage() {
	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">ナレッジ</h1>
				<div className="flex gap-2">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						手動追加
					</Button>
					<Button variant="outline">ソースから取り込む</Button>
				</div>
			</div>

			{/* 空状態 */}
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
				<Database className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="mb-2 text-lg font-medium">ナレッジはまだありません</h2>
				<p className="text-sm text-muted-foreground">
					「手動追加」または「ソースから取り込む」でナレッジを登録してください
				</p>
			</div>
		</div>
	);
}
