import { getSession } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import {
	type CheckDetail,
	loadCheckDetail,
} from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { CheckDetailClient } from '@/frontend/components/check-detail-client';
import { notFound } from 'next/navigation';

export default async function CheckDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getSession();

	let check: CheckDetail;
	try {
		check = await loadCheckDetail(id, session?.id);
	} catch {
		notFound();
	}

	return <CheckDetailClient initialData={check} />;
}
