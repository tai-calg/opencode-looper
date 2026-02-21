import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

function isStubMode(): boolean {
	const key = process.env.OPENAI_API_KEY;
	return !key || key === 'dummy' || key === 'test' || key === 'undefined';
}

export class OpenAIEmbeddingGateway implements EmbeddingGateway {
	private readonly client: OpenAI | null;

	constructor() {
		if (isStubMode()) {
			this.client = null;
		} else {
			this.client = new OpenAI({
				apiKey: process.env.OPENAI_API_KEY,
			});
		}
	}

	async generateEmbedding(text: string): Promise<number[]> {
		if (isStubMode()) {
			return Array(EMBEDDING_DIMENSIONS).fill(0);
		}

		const client = this.client as OpenAI;
		const response = await client.embeddings.create({
			model: EMBEDDING_MODEL,
			input: text,
			dimensions: EMBEDDING_DIMENSIONS,
		});

		return response.data[0].embedding;
	}
}
