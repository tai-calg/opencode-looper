import type { ProgressEvent } from '@/backend/contexts/content-check/application/usecases/execute-content-check.usecase';
import { createExecuteContentCheckUseCase } from '@/backend/contexts/content-check/presentation/composition/content-check.composition';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
	const body = (await request.json()) as { originalText?: unknown; source?: unknown };
	const originalText = typeof body.originalText === 'string' ? body.originalText : '';
	const source = typeof body.source === 'string' ? body.source : 'web';

	if (!originalText || originalText.trim().length === 0) {
		return NextResponse.json({ error: 'originalText is required' }, { status: 400 });
	}

	if (originalText.length > 30000) {
		return NextResponse.json(
			{ error: 'originalText must be 30000 characters or less' },
			{ status: 400 },
		);
	}

	const useCase = createExecuteContentCheckUseCase();

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			const sendEvent = (event: ProgressEvent) => {
				const data = `data: ${JSON.stringify(event)}\n\n`;
				controller.enqueue(encoder.encode(data));
			};

			try {
				await useCase.execute({
					source,
					originalText,
					onProgress: sendEvent,
				});
			} catch (err) {
				const reason = err instanceof Error ? err.message : String(err);
				const errorEvent: ProgressEvent = { type: 'error', data: { reason } };
				const data = `data: ${JSON.stringify(errorEvent)}\n\n`;
				controller.enqueue(encoder.encode(data));
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
}
