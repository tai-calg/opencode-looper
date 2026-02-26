import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import type { EmbeddingGateway } from '../../domain/gateways/embedding.gateway';

export class OpenAIEmbeddingAdapter implements EmbeddingGateway {
	async generateEmbedding(text: string): Promise<number[]> {
		const { embedding } = await embed({
			model: openai.embedding('text-embedding-3-small'),
			value: text,
		});
		return embedding;
	}

	async generateEmbeddings(texts: string[]): Promise<number[][]> {
		const { embeddings } = await embedMany({
			model: openai.embedding('text-embedding-3-small'),
			values: texts,
		});
		return embeddings;
	}
}
