export type ArticleListItem = {
	title: string;
	url: string;
	publishedAt: Date | null;
};

export interface ArticleFetchGateway {
	fetchArticleList(accountUrl: string): Promise<ArticleListItem[]>;
	fetchArticleContent(articleUrl: string): Promise<string>;
}
