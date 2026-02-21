import { ExecuteContentCheckUseCase } from '@/backend/contexts/content-check/application/usecases/execute-content-check.usecase';
import type { ProgressEvent } from '@/backend/contexts/content-check/application/usecases/execute-content-check.usecase';
import type { CheckResultRepository } from '@/backend/contexts/content-check/domain/gateways/check-result.repository';
import type { ContentCheckRepository } from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import type { ContentSegmentRepository } from '@/backend/contexts/content-check/domain/gateways/content-segment.repository';
import type { ExpressionRuleProvider } from '@/backend/contexts/content-check/domain/gateways/expression-rule.provider';
import type { KnowledgeSearchGateway } from '@/backend/contexts/content-check/domain/gateways/knowledge-search.gateway';
import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';

const DUMMY_EMBEDDING = new Array(1536).fill(0.1);
const DUMMY_SEGMENTS_JSON = JSON.stringify([
	{ text: '段落1のテキストです。' },
	{ text: '段落2のテキストです。' },
]);
const DUMMY_CHECK_RESULT_JSON = JSON.stringify({
	severity: 'info',
	message: 'チェック完了しました。',
	suggestion: '特に問題ありません。',
});

function createMockAIGateway(overrides: Partial<AIGateway> = {}): AIGateway {
	return {
		generate: vi.fn().mockImplementation((prompt: string) => {
			if (prompt.includes('セマンティックな段落')) {
				return Promise.resolve(DUMMY_SEGMENTS_JSON);
			}
			return Promise.resolve(DUMMY_CHECK_RESULT_JSON);
		}),
		generateWithWebSearch: vi.fn().mockResolvedValue(DUMMY_CHECK_RESULT_JSON),
		generateStream: vi.fn().mockImplementation(async function* () {
			yield 'test';
		}),
		...overrides,
	};
}

function createMockEmbeddingGateway(overrides: Partial<EmbeddingGateway> = {}): EmbeddingGateway {
	return {
		generateEmbedding: vi.fn().mockResolvedValue(DUMMY_EMBEDDING),
		...overrides,
	};
}

function createMockContentCheckRepository(
	overrides: Partial<ContentCheckRepository> = {},
): ContentCheckRepository {
	return {
		save: vi.fn().mockResolvedValue(undefined),
		findById: vi.fn().mockResolvedValue(null),
		findAll: vi.fn().mockResolvedValue([]),
		...overrides,
	};
}

function createMockContentSegmentRepository(
	overrides: Partial<ContentSegmentRepository> = {},
): ContentSegmentRepository {
	return {
		saveMany: vi.fn().mockResolvedValue(undefined),
		findByContentCheckId: vi.fn().mockResolvedValue([]),
		...overrides,
	};
}

function createMockCheckResultRepository(
	overrides: Partial<CheckResultRepository> = {},
): CheckResultRepository {
	return {
		saveMany: vi.fn().mockResolvedValue(undefined),
		findBySegmentId: vi.fn().mockResolvedValue([]),
		findByContentCheckId: vi.fn().mockResolvedValue([]),
		...overrides,
	};
}

function createMockExpressionRuleProvider(
	overrides: Partial<ExpressionRuleProvider> = {},
): ExpressionRuleProvider {
	return {
		findActiveRules: vi
			.fn()
			.mockResolvedValue([
				{ ngExpression: '善処します', recommendedExpression: '具体的に対応します' },
			]),
		...overrides,
	};
}

function createMockKnowledgeSearchGateway(
	overrides: Partial<KnowledgeSearchGateway> = {},
): KnowledgeSearchGateway {
	return {
		searchSimilar: vi.fn().mockResolvedValue([{ chunkText: '関連知識のテキスト' }]),
		...overrides,
	};
}

const TEST_USER_ID = createUserId('550e8400-e29b-41d4-a716-446655440000');
const TEST_ORIGINAL_TEXT =
	'これはテスト用のコンテンツです。ファクトチェックが必要な情報が含まれています。';
const TEST_SOURCE = 'https://example.com/article';

describe('ExecuteContentCheckUseCase', () => {
	describe('正常系', () => {
		it('ContentCheckRepository.save が最低2回呼ばれる（pending → processing → completed）', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			// pending save + processing save + completed save = 3回
			expect(contentCheckRepository.save).toHaveBeenCalledTimes(3);
		});

		it('ContentSegmentRepository.saveMany が呼ばれる', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			expect(contentSegmentRepository.saveMany).toHaveBeenCalledOnce();
			const [savedSegments] = (contentSegmentRepository.saveMany as ReturnType<typeof vi.fn>).mock
				.calls[0];
			// DUMMY_SEGMENTS_JSON は2セグメント
			expect(savedSegments).toHaveLength(2);
		});

		it('AIGateway.generateWithWebSearch がファクトチェックに使われる', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			// 2セグメント × 1(fact_check) = 2回 generateWithWebSearch
			expect(aiGateway.generateWithWebSearch).toHaveBeenCalledTimes(2);
		});

		it('EmbeddingGateway.generateEmbedding がナレッジ整合性チェックに使われる', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			// 2セグメント × 1(knowledge_consistency) = 2回
			expect(embeddingGateway.generateEmbedding).toHaveBeenCalledTimes(2);
		});

		it('KnowledgeSearchGateway.searchSimilar がナレッジ整合性チェックに使われる', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			// 2セグメント × 1(knowledge_consistency) = 2回
			expect(knowledgeSearchGateway.searchSimilar).toHaveBeenCalledTimes(2);
			expect(knowledgeSearchGateway.searchSimilar).toHaveBeenCalledWith(DUMMY_EMBEDDING, 3);
		});

		it('ExpressionRuleProvider.findActiveRules が表現ルールチェックに使われる', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			// 2セグメント × 1(expression_rule) = 2回
			expect(expressionRuleProvider.findActiveRules).toHaveBeenCalledTimes(2);
		});

		it('CheckResultRepository.saveMany が全チェック結果を保存する', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			expect(checkResultRepository.saveMany).toHaveBeenCalledOnce();
			const [savedResults] = (checkResultRepository.saveMany as ReturnType<typeof vi.fn>).mock
				.calls[0];
			// 2セグメント × 5チェック = 10件
			expect(savedResults).toHaveLength(10);
		});

		it('onProgress コールバックで segments_created, check_started, check_completed, completed が送出される', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			const events: ProgressEvent[] = [];
			await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
				onProgress: (event) => events.push(event),
			});

			const eventTypes = events.map((e) => e.type);
			expect(eventTypes).toContain('segments_created');
			expect(eventTypes).toContain('check_started');
			expect(eventTypes).toContain('check_completed');
			expect(eventTypes).toContain('completed');
			expect(eventTypes).not.toContain('error');
		});

		it('execute が contentCheckId と summary を返す', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			const result = await useCase.execute({
				source: TEST_SOURCE,
				originalText: TEST_ORIGINAL_TEXT,
				userId: TEST_USER_ID,
			});

			expect(result.contentCheckId).toBeDefined();
			expect(typeof result.contentCheckId).toBe('string');
			expect(result.summary).toMatchObject({
				error: expect.any(Number),
				warning: expect.any(Number),
				info: expect.any(Number),
			});
		});

		it('userId が未指定でも動作する', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await expect(
				useCase.execute({
					source: TEST_SOURCE,
					originalText: TEST_ORIGINAL_TEXT,
				}),
			).resolves.not.toThrow();
		});
	});

	describe('エラー系', () => {
		it('AIGateway.generate 失敗時に ContentCheck.fail() が呼ばれて save され、error イベントが送出される', async () => {
			const aiGateway = createMockAIGateway({
				generate: vi.fn().mockRejectedValue(new Error('AI API error')),
			});
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			const events: ProgressEvent[] = [];
			await expect(
				useCase.execute({
					source: TEST_SOURCE,
					originalText: TEST_ORIGINAL_TEXT,
					userId: TEST_USER_ID,
					onProgress: (event) => events.push(event),
				}),
			).rejects.toThrow('AI API error');

			// 最初の pending save + fail の save = 2回
			expect(contentCheckRepository.save).toHaveBeenCalledTimes(2);

			// fail 後に save された ContentCheck は 'failed' status
			const calls = (contentCheckRepository.save as ReturnType<typeof vi.fn>).mock.calls;
			const lastSavedContentCheck = calls[calls.length - 1][0];
			expect(lastSavedContentCheck.status).toBe('failed');

			// error イベントが送出される
			const errorEvents = events.filter((e) => e.type === 'error');
			expect(errorEvents).toHaveLength(1);
		});

		it('AIGateway.generateWithWebSearch 失敗時に ContentCheck.fail() が呼ばれる', async () => {
			const aiGateway = createMockAIGateway({
				generateWithWebSearch: vi.fn().mockRejectedValue(new Error('Web search failed')),
			});
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await expect(
				useCase.execute({
					source: TEST_SOURCE,
					originalText: TEST_ORIGINAL_TEXT,
					userId: TEST_USER_ID,
				}),
			).rejects.toThrow('Web search failed');

			// fail 後に save された ContentCheck は 'failed' status
			const calls = (contentCheckRepository.save as ReturnType<typeof vi.fn>).mock.calls;
			const lastSavedContentCheck = calls[calls.length - 1][0];
			expect(lastSavedContentCheck.status).toBe('failed');
		});

		it('EmbeddingGateway 失敗時に ContentCheck.fail() が呼ばれる', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway({
				generateEmbedding: vi.fn().mockRejectedValue(new Error('Embedding error')),
			});
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await expect(
				useCase.execute({
					source: TEST_SOURCE,
					originalText: TEST_ORIGINAL_TEXT,
					userId: TEST_USER_ID,
				}),
			).rejects.toThrow('Embedding error');

			const calls = (contentCheckRepository.save as ReturnType<typeof vi.fn>).mock.calls;
			const lastSavedContentCheck = calls[calls.length - 1][0];
			expect(lastSavedContentCheck.status).toBe('failed');
		});

		it('originalText が空文字の場合は ContentCheck.create が失敗してエラーを throw する', async () => {
			const aiGateway = createMockAIGateway();
			const embeddingGateway = createMockEmbeddingGateway();
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();
			const expressionRuleProvider = createMockExpressionRuleProvider();
			const knowledgeSearchGateway = createMockKnowledgeSearchGateway();

			const useCase = new ExecuteContentCheckUseCase(
				aiGateway,
				embeddingGateway,
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
				expressionRuleProvider,
				knowledgeSearchGateway,
			);

			await expect(
				useCase.execute({
					source: TEST_SOURCE,
					originalText: '',
					userId: TEST_USER_ID,
				}),
			).rejects.toThrow();

			// save は呼ばれない（create が失敗するため）
			expect(contentCheckRepository.save).not.toHaveBeenCalled();
		});
	});
});
