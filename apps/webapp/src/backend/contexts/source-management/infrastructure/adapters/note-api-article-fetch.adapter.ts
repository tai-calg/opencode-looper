import type {
	ArticleFetchGateway,
	ArticleListItem,
} from '../../domain/gateways/article-fetch.gateway';

export class NoteApiArticleFetchAdapter implements ArticleFetchGateway {
	async fetchArticleList(accountUrl: string): Promise<ArticleListItem[]> {
		const username = new URL(accountUrl).pathname.split('/').filter(Boolean)[0];
		const articles: ArticleListItem[] = [];
		let page = 1;

		while (true) {
			const res = await fetch(
				`https://note.com/api/v2/creators/${username}/contents?kind=note&page=${page}`,
			);
			if (!res.ok) break;

			const json = (await res.json()) as {
				data: {
					contents: { name: string; key: string; publishAt: string | null }[];
					isLastPage: boolean;
				};
			};

			const { contents, isLastPage } = json.data;
			if (contents.length === 0) break;

			for (const item of contents) {
				articles.push({
					title: item.name,
					url: `https://note.com/${username}/n/${item.key}`,
					publishedAt: item.publishAt ? new Date(item.publishAt) : null,
				});
			}

			if (isLastPage) break;
			page++;

			// レートリミット回避のため待機
			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		return articles;
	}

	async fetchArticleContent(articleUrl: string): Promise<string> {
		const noteKey = new URL(articleUrl).pathname.split('/').pop();
		const res = await fetch(`https://note.com/api/v3/notes/${noteKey}`);
		if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);

		const json = (await res.json()) as { data: { body: string } };
		return json.data.body.replace(/<[^>]*>/g, '').trim();
	}
}
