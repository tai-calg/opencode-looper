import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { CreateSourceUseCase } from '@/backend/contexts/source-management/application/usecases/create-source.usecase';
import { GetSourceDetailUseCase } from '@/backend/contexts/source-management/application/usecases/get-source-detail.usecase';
import { ImportArticlesUseCase } from '@/backend/contexts/source-management/application/usecases/import-articles.usecase';
import { ListSourcesUseCase } from '@/backend/contexts/source-management/application/usecases/list-sources.usecase';
import { SyncArticlesUseCase } from '@/backend/contexts/source-management/application/usecases/sync-articles.usecase';
import type { ArticleFetchGateway } from '@/backend/contexts/source-management/domain/gateways/article-fetch.gateway';
import { KnowledgeItem } from '@/backend/contexts/source-management/domain/models/knowledge-item.model';
import { SourceArticle } from '@/backend/contexts/source-management/domain/models/source-article.model';
import { Source } from '@/backend/contexts/source-management/domain/models/source.model';
import type { KnowledgeRepository } from '@/backend/contexts/source-management/domain/repositories/knowledge.repository';
import type { SourceArticleRepository } from '@/backend/contexts/source-management/domain/repositories/source-article.repository';
import type { SourceRepository } from '@/backend/contexts/source-management/domain/repositories/source.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createMockSourceRepository(): SourceRepository {
	return {
		findAll: vi.fn().mockResolvedValue([]),
		findById: vi.fn().mockResolvedValue(null),
		save: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined),
	};
}

function createMockSourceArticleRepository(): SourceArticleRepository {
	return {
		findBySourceId: vi.fn().mockResolvedValue([]),
		findByIds: vi.fn().mockResolvedValue([]),
		save: vi.fn().mockResolvedValue(undefined),
		saveMany: vi.fn().mockResolvedValue(undefined),
		countBySourceId: vi.fn().mockResolvedValue({ total: 0, imported: 0 }),
	};
}

function createMockKnowledgeRepository(): KnowledgeRepository {
	return {
		findAll: vi.fn().mockResolvedValue([]),
		findById: vi.fn().mockResolvedValue(null),
		save: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined),
		findBySourceArticleIds: vi.fn().mockResolvedValue([]),
	};
}

function createMockArticleFetchGateway(): ArticleFetchGateway {
	return {
		fetchArticleList: vi.fn().mockResolvedValue([]),
		fetchArticleContent: vi.fn().mockResolvedValue('テスト記事本文'),
	};
}

function createMockEmbeddingGateway(): EmbeddingGateway {
	return {
		generateEmbedding: vi.fn().mockResolvedValue(Array(1536).fill(0.1)),
		generateEmbeddings: vi.fn().mockResolvedValue([]),
	};
}

function createTestSource(overrides?: Partial<{ id: string; name: string; url: string }>): Source {
	const now = Timestamp.now();
	return Source.reconstruct({
		id: overrides?.id ?? 'source-1',
		type: 'note',
		name: overrides?.name ?? 'テストソース',
		url: overrides?.url ?? 'https://note.com/testuser',
		createdAt: now,
		updatedAt: now,
	});
}

function createTestSourceArticle(
	overrides?: Partial<{
		id: string;
		sourceId: string;
		title: string;
		url: string;
		imported: boolean;
	}>,
): SourceArticle {
	const now = Timestamp.now();
	return SourceArticle.reconstruct({
		id: overrides?.id ?? 'article-1',
		sourceId: overrides?.sourceId ?? 'source-1',
		title: overrides?.title ?? 'テスト記事',
		url: overrides?.url ?? 'https://note.com/test/n/article1',
		publishedAt: now,
		imported: overrides?.imported ?? false,
		createdAt: now,
	});
}

function createTestKnowledgeItem(
	overrides?: Partial<{ id: string; sourceArticleId: string | null }>,
): KnowledgeItem {
	const now = Timestamp.now();
	return KnowledgeItem.reconstruct({
		id: overrides?.id ?? 'knowledge-1',
		title: 'テストナレッジ',
		sourceType: 'note',
		sourceUrl: 'https://note.com/test/n/article1',
		content: 'テスト本文',
		embedding: null,
		sourceArticleId: overrides?.sourceArticleId ?? null,
		createdAt: now,
		updatedAt: now,
	});
}

describe('ListSourcesUseCase', () => {
	it('ソース一覧をカウント情報付きで返す', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const sources = [createTestSource({ id: 's1' }), createTestSource({ id: 's2' })];
		vi.mocked(sourceRepo.findAll).mockResolvedValue(sources);
		vi.mocked(articleRepo.countBySourceId)
			.mockResolvedValueOnce({ total: 5, imported: 2 })
			.mockResolvedValueOnce({ total: 3, imported: 0 });

		const useCase = new ListSourcesUseCase(sourceRepo, articleRepo);
		const result = await useCase.execute();

		expect(result).toHaveLength(2);
		expect(result[0].source.id).toBe('s1');
		expect(result[0].articleCount).toBe(5);
		expect(result[0].importedCount).toBe(2);
		expect(result[1].articleCount).toBe(3);
		expect(result[1].importedCount).toBe(0);
	});

	it('ソースが空の場合は空配列を返す', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const useCase = new ListSourcesUseCase(sourceRepo, articleRepo);

		const result = await useCase.execute();
		expect(result).toHaveLength(0);
	});
});

describe('CreateSourceUseCase', () => {
	it('ソースを作成して保存する', async () => {
		const repo = createMockSourceRepository();
		const useCase = new CreateSourceUseCase(repo);

		const result = await useCase.execute({
			type: 'note',
			name: 'テストソース',
			url: 'https://note.com/testuser',
		});

		expect(result.name).toBe('テストソース');
		expect(result.type).toBe('note');
		expect(repo.save).toHaveBeenCalledOnce();
	});

	it('バリデーションエラーで例外を投げる', async () => {
		const repo = createMockSourceRepository();
		const useCase = new CreateSourceUseCase(repo);

		await expect(
			useCase.execute({ type: 'note', name: '', url: 'https://note.com/test' }),
		).rejects.toThrow();
		expect(repo.save).not.toHaveBeenCalled();
	});

	it('未対応のソース種別で例外を投げる', async () => {
		const repo = createMockSourceRepository();
		const useCase = new CreateSourceUseCase(repo);

		await expect(
			useCase.execute({ type: 'rss', name: 'テスト', url: 'https://example.com' }),
		).rejects.toThrow('ソース種別は note のみサポートしています');
		expect(repo.save).not.toHaveBeenCalled();
	});
});

describe('GetSourceDetailUseCase', () => {
	it('ソース詳細と記事一覧とナレッジマッピングを返す', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const knowledgeRepo = createMockKnowledgeRepository();

		const source = createTestSource({ id: 'source-1' });
		vi.mocked(sourceRepo.findById).mockResolvedValue(source);

		const articles = [
			createTestSourceArticle({ id: 'a1', imported: true }),
			createTestSourceArticle({ id: 'a2', imported: false }),
		];
		vi.mocked(articleRepo.findBySourceId).mockResolvedValue(articles);

		const knowledgeItems = [createTestKnowledgeItem({ id: 'k1', sourceArticleId: 'a1' })];
		vi.mocked(knowledgeRepo.findBySourceArticleIds).mockResolvedValue(knowledgeItems);

		const useCase = new GetSourceDetailUseCase(sourceRepo, articleRepo, knowledgeRepo);
		const result = await useCase.execute('source-1');

		expect(result.source.id).toBe('source-1');
		expect(result.articles).toHaveLength(2);
		expect(result.knowledgeMapping.get('a1')).toBe('k1');
		expect(result.knowledgeMapping.has('a2')).toBe(false);
		expect(knowledgeRepo.findBySourceArticleIds).toHaveBeenCalledWith(['a1']);
	});

	it('取込済み記事がない場合は findBySourceArticleIds を呼ばない', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const knowledgeRepo = createMockKnowledgeRepository();

		vi.mocked(sourceRepo.findById).mockResolvedValue(createTestSource());
		vi.mocked(articleRepo.findBySourceId).mockResolvedValue([
			createTestSourceArticle({ imported: false }),
		]);

		const useCase = new GetSourceDetailUseCase(sourceRepo, articleRepo, knowledgeRepo);
		const result = await useCase.execute('source-1');

		expect(result.knowledgeMapping.size).toBe(0);
		expect(knowledgeRepo.findBySourceArticleIds).not.toHaveBeenCalled();
	});

	it('存在しないソースで例外を投げる', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const knowledgeRepo = createMockKnowledgeRepository();
		const useCase = new GetSourceDetailUseCase(sourceRepo, articleRepo, knowledgeRepo);

		await expect(useCase.execute('unknown')).rejects.toThrow('ソースが見つかりません');
	});
});

describe('SyncArticlesUseCase', () => {
	it('新規記事のみ追加する', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const gateway = createMockArticleFetchGateway();

		vi.mocked(sourceRepo.findById).mockResolvedValue(createTestSource());
		vi.mocked(gateway.fetchArticleList).mockResolvedValue([
			{ title: '既存記事', url: 'https://note.com/test/n/existing', publishedAt: new Date() },
			{ title: '新規記事', url: 'https://note.com/test/n/new', publishedAt: new Date() },
		]);
		vi.mocked(articleRepo.findBySourceId).mockResolvedValue([
			createTestSourceArticle({ url: 'https://note.com/test/n/existing' }),
		]);

		const useCase = new SyncArticlesUseCase(sourceRepo, articleRepo, gateway);
		const result = await useCase.execute('source-1');

		expect(result.newCount).toBe(1);
		expect(articleRepo.saveMany).toHaveBeenCalledOnce();
		const savedArticles = vi.mocked(articleRepo.saveMany).mock.calls[0][0];
		expect(savedArticles).toHaveLength(1);
		expect(savedArticles[0].title).toBe('新規記事');
	});

	it('全て既存の場合は saveMany を呼ばない', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const gateway = createMockArticleFetchGateway();

		vi.mocked(sourceRepo.findById).mockResolvedValue(createTestSource());
		vi.mocked(gateway.fetchArticleList).mockResolvedValue([
			{ title: '既存記事', url: 'https://note.com/test/n/existing', publishedAt: null },
		]);
		vi.mocked(articleRepo.findBySourceId).mockResolvedValue([
			createTestSourceArticle({ url: 'https://note.com/test/n/existing' }),
		]);

		const useCase = new SyncArticlesUseCase(sourceRepo, articleRepo, gateway);
		const result = await useCase.execute('source-1');

		expect(result.newCount).toBe(0);
		expect(articleRepo.saveMany).not.toHaveBeenCalled();
	});

	it('存在しないソースで例外を投げる', async () => {
		const sourceRepo = createMockSourceRepository();
		const articleRepo = createMockSourceArticleRepository();
		const gateway = createMockArticleFetchGateway();
		const useCase = new SyncArticlesUseCase(sourceRepo, articleRepo, gateway);

		await expect(useCase.execute('unknown')).rejects.toThrow('ソースが見つかりません');
	});
});

describe('ImportArticlesUseCase', () => {
	it('未取込記事をナレッジとして取り込む', async () => {
		const articleRepo = createMockSourceArticleRepository();
		const gateway = createMockArticleFetchGateway();
		const knowledgeRepo = createMockKnowledgeRepository();
		const embeddingGateway = createMockEmbeddingGateway();

		const article = createTestSourceArticle({ id: 'a1', imported: false });
		vi.mocked(articleRepo.findByIds).mockResolvedValue([article]);
		vi.mocked(gateway.fetchArticleContent).mockResolvedValue('記事本文テスト');

		const useCase = new ImportArticlesUseCase(
			articleRepo,
			gateway,
			knowledgeRepo,
			embeddingGateway,
		);
		const result = await useCase.execute(['a1']);

		expect(result.importedCount).toBe(1);
		expect(gateway.fetchArticleContent).toHaveBeenCalledWith(article.url);
		expect(embeddingGateway.generateEmbedding).toHaveBeenCalledWith('記事本文テスト');
		expect(knowledgeRepo.save).toHaveBeenCalledOnce();
		expect(articleRepo.save).toHaveBeenCalledOnce();
		const savedArticle = vi.mocked(articleRepo.save).mock.calls[0][0];
		expect(savedArticle.imported).toBe(true);
	});

	it('取込済み記事をスキップする', async () => {
		const articleRepo = createMockSourceArticleRepository();
		const gateway = createMockArticleFetchGateway();
		const knowledgeRepo = createMockKnowledgeRepository();
		const embeddingGateway = createMockEmbeddingGateway();

		const article = createTestSourceArticle({ id: 'a1', imported: true });
		vi.mocked(articleRepo.findByIds).mockResolvedValue([article]);

		const useCase = new ImportArticlesUseCase(
			articleRepo,
			gateway,
			knowledgeRepo,
			embeddingGateway,
		);
		const result = await useCase.execute(['a1']);

		expect(result.importedCount).toBe(0);
		expect(gateway.fetchArticleContent).not.toHaveBeenCalled();
		expect(knowledgeRepo.save).not.toHaveBeenCalled();
	});

	it('複数記事を逐次処理する', async () => {
		const articleRepo = createMockSourceArticleRepository();
		const gateway = createMockArticleFetchGateway();
		const knowledgeRepo = createMockKnowledgeRepository();
		const embeddingGateway = createMockEmbeddingGateway();

		const articles = [
			createTestSourceArticle({ id: 'a1', url: 'https://note.com/test/n/a1', imported: false }),
			createTestSourceArticle({ id: 'a2', url: 'https://note.com/test/n/a2', imported: false }),
		];
		vi.mocked(articleRepo.findByIds).mockResolvedValue(articles);

		const useCase = new ImportArticlesUseCase(
			articleRepo,
			gateway,
			knowledgeRepo,
			embeddingGateway,
		);
		const result = await useCase.execute(['a1', 'a2']);

		expect(result.importedCount).toBe(2);
		expect(gateway.fetchArticleContent).toHaveBeenCalledTimes(2);
		expect(knowledgeRepo.save).toHaveBeenCalledTimes(2);
		expect(articleRepo.save).toHaveBeenCalledTimes(2);
	});
});
