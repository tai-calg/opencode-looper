import { CheckForm } from '@/components/checks/check-form';

export default function NewCheckPage() {
	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold">新規チェック</h1>
			<CheckForm />
		</div>
	);
}
