import { ExpressionCheckUseCase } from '@/backend/contexts/content-check/application/usecases/expression-check.usecase';
import { FactCheckUseCase } from '@/backend/contexts/content-check/application/usecases/fact-check.usecase';
import { KnowledgeCheckUseCase } from '@/backend/contexts/content-check/application/usecases/knowledge-check.usecase';
import { QualityCheckUseCase } from '@/backend/contexts/content-check/application/usecases/quality-check.usecase';
import { RiskCheckUseCase } from '@/backend/contexts/content-check/application/usecases/risk-check.usecase';
import { SplitContentUseCase } from '@/backend/contexts/content-check/application/usecases/split-content.usecase';
import type { ExpressionRuleQueryGateway } from '@/backend/contexts/content-check/domain/gateways/expression-rule-query.gateway';
import type { KnowledgeSearchGateway } from '@/backend/contexts/content-check/domain/gateways/knowledge-search.gateway';
import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { describe, expect, it, vi } from 'vitest';

function createMockAIGateway(): AIGateway {
	return {
		generateText: vi.fn().mockResolvedValue('mock text'),
		generateTextWithWebSearch: vi.fn().mockResolvedValue('mock search text'),
		generateObject: vi.fn().mockResolvedValue({ issues: [] }),
		generateObjectWithWebSearch: vi.fn().mockResolvedValue({ issues: [] }),
	};
}

function createMockEmbeddingGateway(): EmbeddingGateway {
	return {
		generateEmbedding: vi.fn().mockResolvedValue(Array(1536).fill(0)),
		generateEmbeddings: vi.fn().mockResolvedValue([]),
	};
}

describe('SplitContentUseCase', () => {
	it('短いテキストはそのまま1セクションで返す', async () => {
		const aiGateway = createMockAIGateway();
		const useCase = new SplitContentUseCase(aiGateway);
		const result = await useCase.execute('短いテキスト');
		expect(result).toEqual(['短いテキスト']);
		expect(aiGateway.generateObject).not.toHaveBeenCalled();
	});

	it('長いテキストはAIで分割する', async () => {
		const aiGateway = createMockAIGateway();
		vi.mocked(aiGateway.generateObject).mockResolvedValue({
			sections: [{ content: 'セクション1' }, { content: 'セクション2' }],
		});
		const useCase = new SplitContentUseCase(aiGateway);
		const result = await useCase.execute('あ'.repeat(1001));
		expect(result).toEqual(['セクション1', 'セクション2']);
	});
});

describe('FactCheckUseCase', () => {
	it('指摘がない場合は空配列を返す', async () => {
		const aiGateway = createMockAIGateway();
		const useCase = new FactCheckUseCase(aiGateway);
		const result = await useCase.execute('テスト文章');
		expect(result).toEqual([]);
		expect(aiGateway.generateObjectWithWebSearch).toHaveBeenCalledOnce();
	});
});

describe('KnowledgeCheckUseCase', () => {
	it('ナレッジが無い場合はスキップして空配列を返す', async () => {
		const aiGateway = createMockAIGateway();
		const embeddingGateway = createMockEmbeddingGateway();
		const knowledgeSearchGateway: KnowledgeSearchGateway = {
			searchSimilar: vi.fn().mockResolvedValue([]),
		};
		const useCase = new KnowledgeCheckUseCase(aiGateway, embeddingGateway, knowledgeSearchGateway);
		const result = await useCase.execute('テスト文章');
		expect(result).toEqual([]);
		expect(aiGateway.generateObject).not.toHaveBeenCalled();
	});
});

describe('ExpressionCheckUseCase', () => {
	it('ルールが無い場合はスキップして空配列を返す', async () => {
		const aiGateway = createMockAIGateway();
		const ruleGateway: ExpressionRuleQueryGateway = {
			findAllEnabled: vi.fn().mockResolvedValue([]),
		};
		const useCase = new ExpressionCheckUseCase(aiGateway, ruleGateway);
		const result = await useCase.execute('テスト文章');
		expect(result).toEqual([]);
		expect(aiGateway.generateObject).not.toHaveBeenCalled();
	});
});

describe('RiskCheckUseCase', () => {
	it('AIGateway.generateObject を呼び出す', async () => {
		const aiGateway = createMockAIGateway();
		const useCase = new RiskCheckUseCase(aiGateway);
		const result = await useCase.execute('テスト文章');
		expect(result).toEqual([]);
		expect(aiGateway.generateObject).toHaveBeenCalledOnce();
	});
});

describe('QualityCheckUseCase', () => {
	it('AIGateway.generateObject を呼び出す', async () => {
		const aiGateway = createMockAIGateway();
		const useCase = new QualityCheckUseCase(aiGateway);
		const result = await useCase.execute('テスト文章');
		expect(result).toEqual([]);
		expect(aiGateway.generateObject).toHaveBeenCalledOnce();
	});
});
