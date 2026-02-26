import type {
	ArticleFetchGateway,
	ArticleListItem,
} from '../../domain/gateways/article-fetch.gateway';

export class StubArticleFetchAdapter implements ArticleFetchGateway {
	async fetchArticleList(_accountUrl: string): Promise<ArticleListItem[]> {
		return [
			{
				title: 'テスト記事1',
				url: 'https://note.com/test/n/article1',
				publishedAt: new Date('2024-01-01'),
			},
			{
				title: 'テスト記事2',
				url: 'https://note.com/test/n/article2',
				publishedAt: new Date('2024-02-01'),
			},
			{
				title: 'テスト記事3',
				url: 'https://note.com/test/n/article3',
				publishedAt: new Date('2024-03-01'),
			},
		];
	}

	async fetchArticleContent(_articleUrl: string): Promise<string> {
		return 'これはテスト用のスタブ記事本文です。実際の note.com API からは本物の記事本文が返されます。ナレッジとしてチェック対象との整合性確認に使用されます。';
	}
}
