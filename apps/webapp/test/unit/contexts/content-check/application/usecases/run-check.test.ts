import { RunCheckUseCase } from '@/backend/contexts/content-check/application/usecases/run-check.usecase';
import type { ExpressionRuleQueryGateway } from '@/backend/contexts/content-check/domain/gateways/expression-rule-query.gateway';
import type { KnowledgeSearchGateway } from '@/backend/contexts/content-check/domain/gateways/knowledge-search.gateway';
import type { CheckRepository } from '@/backend/contexts/content-check/domain/repositories/check.repository';
import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { describe, expect, it, vi } from 'vitest';

function createMocks() {
	const checkRepository: CheckRepository = {
		findById: vi.fn().mockResolvedValue(null),
		findAll: vi.fn().mockResolvedValue([]),
		save: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined),
		count: vi.fn().mockResolvedValue(0),
	};
	const aiGateway: AIGateway = {
		generateText: vi.fn().mockResolvedValue('text'),
		generateTextWithWebSearch: vi.fn().mockResolvedValue('text'),
		generateObject: vi.fn().mockResolvedValue({ issues: [] }),
		generateObjectWithWebSearch: vi.fn().mockResolvedValue({ issues: [] }),
	};
	const embeddingGateway: EmbeddingGateway = {
		generateEmbedding: vi.fn().mockResolvedValue(Array(1536).fill(0)),
		generateEmbeddings: vi.fn().mockResolvedValue([]),
	};
	const ruleQueryGateway: ExpressionRuleQueryGateway = {
		findAllEnabled: vi.fn().mockResolvedValue([]),
	};
	const knowledgeSearchGateway: KnowledgeSearchGateway = {
		searchSimilar: vi.fn().mockResolvedValue([]),
	};
	return { checkRepository, aiGateway, embeddingGateway, ruleQueryGateway, knowledgeSearchGateway };
}

describe('RunCheckUseCase', () => {
	it('チェックを作成して保存し、IDを返す', async () => {
		const mocks = createMocks();
		const useCase = new RunCheckUseCase(
			mocks.checkRepository,
			mocks.aiGateway,
			mocks.embeddingGateway,
			mocks.ruleQueryGateway,
			mocks.knowledgeSearchGateway,
		);
		const checkId = await useCase.execute({ content: 'テスト本文' });
		expect(checkId).toBeDefined();
		expect(mocks.checkRepository.save).toHaveBeenCalled();
	});

	it('本文が空の場合はエラーを投げる', async () => {
		const mocks = createMocks();
		const useCase = new RunCheckUseCase(
			mocks.checkRepository,
			mocks.aiGateway,
			mocks.embeddingGateway,
			mocks.ruleQueryGateway,
			mocks.knowledgeSearchGateway,
		);
		await expect(useCase.execute({ content: '' })).rejects.toThrow('本文は必須です');
	});
});
