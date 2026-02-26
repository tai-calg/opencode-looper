export interface EmbeddingGateway {
	generateEmbedding(text: string): Promise<number[]>;
	generateEmbeddings(texts: string[]): Promise<number[][]>;
}
