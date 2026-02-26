import { Button } from '@/frontend/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';

export default function RulesPage() {
	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">表現ルール</h1>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					ルール追加
				</Button>
			</div>

			{/* 空状態 */}
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
				<BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="mb-2 text-lg font-medium">表現ルールはまだありません</h2>
				<p className="text-sm text-muted-foreground">
					「ルール追加」から NG 表現と OK 表現のルールを登録してください
				</p>
			</div>
		</div>
	);
}
