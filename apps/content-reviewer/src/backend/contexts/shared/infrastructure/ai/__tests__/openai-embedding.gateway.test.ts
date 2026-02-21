import { OpenAIEmbeddingGateway } from '@/backend/contexts/shared/infrastructure/ai/openai-embedding.gateway';
import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('openai');

describe('OpenAIEmbeddingGateway', () => {
	const mockEmbedding = Array.from({ length: 1536 }, (_, i) => i / 1536);

	const mockCreate = vi.fn().mockResolvedValue({
		data: [{ embedding: mockEmbedding }],
	});

	beforeEach(() => {
		vi.mocked(OpenAI).mockImplementation(
			() =>
				({
					embeddings: { create: mockCreate },
				}) as unknown as OpenAI,
		);
		vi.clearAllMocks();
		mockCreate.mockResolvedValue({ data: [{ embedding: mockEmbedding }] });
	});

	describe('normal mode (OPENAI_API_KEY is set)', () => {
		beforeEach(() => {
			process.env.OPENAI_API_KEY = 'sk-real-api-key';
		});

		afterEach(() => {
			process.env.OPENAI_API_KEY = undefined;
		});

		it('should return a 1536-dimensional embedding vector', async () => {
			const gateway = new OpenAIEmbeddingGateway();
			const result = await gateway.generateEmbedding('テストテキスト');

			expect(result).toHaveLength(1536);
			expect(result).toEqual(mockEmbedding);
		});

		it('should call embeddings.create with correct parameters', async () => {
			const gateway = new OpenAIEmbeddingGateway();
			await gateway.generateEmbedding('テストテキスト');

			expect(mockCreate).toHaveBeenCalledOnce();
			expect(mockCreate).toHaveBeenCalledWith({
				model: 'text-embedding-3-small',
				input: 'テストテキスト',
				dimensions: 1536,
			});
		});

		it('should propagate API errors', async () => {
			mockCreate.mockRejectedValue(new Error('API error'));
			const gateway = new OpenAIEmbeddingGateway();

			await expect(gateway.generateEmbedding('テスト')).rejects.toThrow('API error');
		});

		it('should pass different text inputs correctly', async () => {
			const gateway = new OpenAIEmbeddingGateway();
			const text = '別のテキスト入力';
			await gateway.generateEmbedding(text);

			expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ input: text }));
		});
	});

	describe('stub mode (OPENAI_API_KEY is not set or dummy)', () => {
		afterEach(() => {
			process.env.OPENAI_API_KEY = undefined;
		});

		it('should return a zero vector when OPENAI_API_KEY is not set', async () => {
			process.env.OPENAI_API_KEY = undefined;
			const gateway = new OpenAIEmbeddingGateway();
			const result = await gateway.generateEmbedding('テスト');

			expect(result).toHaveLength(1536);
			expect(result.every((v) => v === 0)).toBe(true);
			expect(mockCreate).not.toHaveBeenCalled();
		});

		it('should return a zero vector when OPENAI_API_KEY is "dummy"', async () => {
			process.env.OPENAI_API_KEY = 'dummy';
			const gateway = new OpenAIEmbeddingGateway();
			const result = await gateway.generateEmbedding('テスト');

			expect(result).toHaveLength(1536);
			expect(result.every((v) => v === 0)).toBe(true);
			expect(mockCreate).not.toHaveBeenCalled();
		});

		it('should return a zero vector when OPENAI_API_KEY is "test"', async () => {
			process.env.OPENAI_API_KEY = 'test';
			const gateway = new OpenAIEmbeddingGateway();
			const result = await gateway.generateEmbedding('テスト');

			expect(result).toHaveLength(1536);
			expect(result.every((v) => v === 0)).toBe(true);
			expect(mockCreate).not.toHaveBeenCalled();
		});
	});
});
