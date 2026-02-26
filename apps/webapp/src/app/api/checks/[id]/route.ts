import { getSession } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { loadCheckDetail } from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { id } = await params;
		const detail = await loadCheckDetail(id, session.id);
		return NextResponse.json(detail);
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
}
