import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { CreateKnowledgeUseCase } from '@/backend/contexts/source-management/application/usecases/create-knowledge.usecase';
import { DeleteKnowledgeUseCase } from '@/backend/contexts/source-management/application/usecases/delete-knowledge.usecase';
import { ListKnowledgeUseCase } from '@/backend/contexts/source-management/application/usecases/list-knowledge.usecase';
import { UpdateKnowledgeUseCase } from '@/backend/contexts/source-management/application/usecases/update-knowledge.usecase';
import { KnowledgeItem } from '@/backend/contexts/source-management/domain/models/knowledge-item.model';
import type { KnowledgeRepository } from '@/backend/contexts/source-management/domain/repositories/knowledge.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createMockRepository(): KnowledgeRepository {
	return {
		findAll: vi.fn().mockResolvedValue([]),
		findById: vi.fn().mockResolvedValue(null),
		save: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined),
	};
}

function createMockEmbeddingGateway(): EmbeddingGateway {
	return {
		generateEmbedding: vi.fn().mockResolvedValue(Array(1536).fill(0.1)),
		generateEmbeddings: vi.fn().mockResolvedValue([]),
	};
}

function createTestKnowledgeItem(
	overrides?: Partial<{
		id: string;
		title: string;
		sourceType: 'note' | 'manifesto' | 'manual';
		content: string;
		embedding: number[] | null;
	}>,
): KnowledgeItem {
	const now = Timestamp.now();
	return KnowledgeItem.reconstruct({
		id: overrides?.id ?? 'test-id',
		title: overrides?.title ?? 'テストナレッジ',
		sourceType: overrides?.sourceType ?? 'manual',
		sourceUrl: null,
		content: overrides?.content ?? 'テスト本文',
		embedding: overrides?.embedding ?? null,
		sourceArticleId: null,
		createdAt: now,
		updatedAt: now,
	});
}

describe('CreateKnowledgeUseCase', () => {
	it('ナレッジを作成して embedding を生成し保存する', async () => {
		const repo = createMockRepository();
		const gateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeUseCase(repo, gateway);

		const result = await useCase.execute({
			title: 'テスト',
			sourceType: 'manual',
			content: '本文テスト',
		});

		expect(result.title).toBe('テスト');
		expect(result.hasEmbedding).toBe(true);
		expect(gateway.generateEmbedding).toHaveBeenCalledWith('本文テスト');
		expect(repo.save).toHaveBeenCalledOnce();
	});

	it('バリデーションエラーで例外を投げる', async () => {
		const repo = createMockRepository();
		const gateway = createMockEmbeddingGateway();
		const useCase = new CreateKnowledgeUseCase(repo, gateway);

		await expect(
			useCase.execute({ title: '', sourceType: 'manual', content: '本文' }),
		).rejects.toThrow();
		expect(repo.save).not.toHaveBeenCalled();
		expect(gateway.generateEmbedding).not.toHaveBeenCalled();
	});
});

describe('UpdateKnowledgeUseCase', () => {
	it('content 変更時に embedding を再生成する', async () => {
		const repo = createMockRepository();
		const gateway = createMockEmbeddingGateway();
		const existing = createTestKnowledgeItem({ embedding: [0.1, 0.2] });
		vi.mocked(repo.findById).mockResolvedValue(existing);
		const useCase = new UpdateKnowledgeUseCase(repo, gateway);

		const result = await useCase.execute({
			id: 'test-id',
			title: '更新タイトル',
			sourceType: 'manual',
			content: '新しい本文', // content 変更
		});

		expect(result.title).toBe('更新タイトル');
		expect(gateway.generateEmbedding).toHaveBeenCalledWith('新しい本文');
		expect(repo.save).toHaveBeenCalledOnce();
	});

	it('content 未変更時に embedding を再生成しない', async () => {
		const repo = createMockRepository();
		const gateway = createMockEmbeddingGateway();
		const existing = createTestKnowledgeItem({
			content: 'テスト本文',
			embedding: [0.1, 0.2],
		});
		vi.mocked(repo.findById).mockResolvedValue(existing);
		const useCase = new UpdateKnowledgeUseCase(repo, gateway);

		await useCase.execute({
			id: 'test-id',
			title: '新タイトル',
			sourceType: 'manual',
			content: 'テスト本文', // content 同じ
		});

		expect(gateway.generateEmbedding).not.toHaveBeenCalled();
		expect(repo.save).toHaveBeenCalledOnce();
	});

	it('存在しないナレッジで例外を投げる', async () => {
		const repo = createMockRepository();
		const gateway = createMockEmbeddingGateway();
		const useCase = new UpdateKnowledgeUseCase(repo, gateway);

		await expect(
			useCase.execute({
				id: 'unknown',
				title: 'タイトル',
				sourceType: 'manual',
				content: '本文',
			}),
		).rejects.toThrow('ナレッジが見つかりません');
	});
});

describe('DeleteKnowledgeUseCase', () => {
	it('既存ナレッジを削除する', async () => {
		const repo = createMockRepository();
		vi.mocked(repo.findById).mockResolvedValue(createTestKnowledgeItem());
		const useCase = new DeleteKnowledgeUseCase(repo);

		await useCase.execute('test-id');
		expect(repo.delete).toHaveBeenCalledWith('test-id');
	});

	it('存在しないナレッジで例外を投げる', async () => {
		const repo = createMockRepository();
		const useCase = new DeleteKnowledgeUseCase(repo);

		await expect(useCase.execute('unknown')).rejects.toThrow('ナレッジが見つかりません');
	});
});

describe('ListKnowledgeUseCase', () => {
	it('全ナレッジを返す', async () => {
		const repo = createMockRepository();
		const items = [createTestKnowledgeItem({ id: '1' }), createTestKnowledgeItem({ id: '2' })];
		vi.mocked(repo.findAll).mockResolvedValue(items);
		const useCase = new ListKnowledgeUseCase(repo);

		const result = await useCase.execute();
		expect(result).toHaveLength(2);
	});
});
