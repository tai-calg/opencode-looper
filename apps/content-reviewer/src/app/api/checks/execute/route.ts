import { createExecuteContentCheckUseCase } from '@/backend/contexts/content-check/presentation/composition/content-check.composition';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { createSupabaseServerClient } from '@/backend/contexts/shared/infrastructure/db/supabase-server-client';
import type { NextRequest } from 'next/server';

const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function POST(request: NextRequest): Promise<Response> {
	const body = (await request.json()) as { originalText?: unknown; source?: unknown };
	const { originalText, source } = body;

	if (typeof originalText !== 'string' || typeof source !== 'string') {
		return new Response(JSON.stringify({ error: 'originalText and source are required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	let userId = createUserId(DUMMY_USER_ID);

	if (process.env.NODE_ENV !== 'development') {
		const supabase = await createSupabaseServerClient();
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.user?.id) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		userId = createUserId(session.user.id);
	}

	const useCase = createExecuteContentCheckUseCase();

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			const sendEvent = (event: unknown): void => {
				const data = `data: ${JSON.stringify(event)}\n\n`;
				controller.enqueue(encoder.encode(data));
			};

			try {
				await useCase.execute({
					originalText,
					source,
					userId,
					onProgress: (event) => {
						sendEvent(event);
					},
				});
			} catch (err) {
				const reason = err instanceof Error ? err.message : String(err);
				sendEvent({ type: 'error', data: { reason } });
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
