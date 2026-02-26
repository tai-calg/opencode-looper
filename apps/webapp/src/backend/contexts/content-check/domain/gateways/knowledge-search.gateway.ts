export type KnowledgeSearchResult = {
	id: string;
	title: string;
	content: string;
	similarity: number;
};

export interface KnowledgeSearchGateway {
	searchSimilar(embedding: number[], limit: number): Promise<KnowledgeSearchResult[]>;
}
