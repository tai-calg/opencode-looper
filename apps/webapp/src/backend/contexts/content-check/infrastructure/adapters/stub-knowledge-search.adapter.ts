import type {
	KnowledgeSearchGateway,
	KnowledgeSearchResult,
} from '../../domain/gateways/knowledge-search.gateway';

export class StubKnowledgeSearchAdapter implements KnowledgeSearchGateway {
	async searchSimilar(_embedding: number[], _limit: number): Promise<KnowledgeSearchResult[]> {
		return [
			{
				id: 'stub-knowledge-1',
				title: 'サンプルナレッジ',
				content: 'これはスタブのナレッジコンテンツです。テスト用の参照データとして使用されます。',
				similarity: 0.85,
			},
		];
	}
}
