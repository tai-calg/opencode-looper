import type { EmbeddingGateway } from '../../domain/gateways/embedding.gateway';

export class StubEmbeddingAdapter implements EmbeddingGateway {
	async generateEmbedding(text: string): Promise<number[]> {
		// 決定的なダミーベクトルを返す（テスト再現性のため）
		return Array.from({ length: 1536 }, (_, i) =>
			Number.parseFloat((Math.sin(i + text.length) * 0.5).toFixed(6)),
		);
	}

	async generateEmbeddings(texts: string[]): Promise<number[][]> {
		const results: number[][] = [];
		for (const text of texts) {
			results.push(await this.generateEmbedding(text));
		}
		return results;
	}
}
