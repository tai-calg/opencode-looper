import { CheckForm } from '@/frontend/components/check-form';

export default function NewCheckPage() {
	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold">新規チェック</h1>
			<div className="mx-auto max-w-2xl">
				<CheckForm />
			</div>
		</div>
	);
}
