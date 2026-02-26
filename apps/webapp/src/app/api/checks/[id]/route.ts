import { loadCheckDetail } from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const detail = await loadCheckDetail(id);
		return NextResponse.json(detail);
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
}
