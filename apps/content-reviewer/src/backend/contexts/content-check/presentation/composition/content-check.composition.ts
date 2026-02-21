import { ExecuteContentCheckUseCase } from '@/backend/contexts/content-check/application/usecases/execute-content-check.usecase';
import { GetContentCheckDetailUseCase } from '@/backend/contexts/content-check/application/usecases/get-content-check-detail.usecase';
import { PrismaExpressionRuleProvider } from '@/backend/contexts/content-check/infrastructure/prisma-expression-rule.provider';
import { PrismaKnowledgeSearchGateway } from '@/backend/contexts/content-check/infrastructure/prisma-knowledge-search.gateway';
import { PrismaCheckResultRepository } from '@/backend/contexts/content-check/infrastructure/repositories/prisma-check-result.repository';
import { PrismaContentCheckRepository } from '@/backend/contexts/content-check/infrastructure/repositories/prisma-content-check.repository';
import { PrismaContentSegmentRepository } from '@/backend/contexts/content-check/infrastructure/repositories/prisma-content-segment.repository';
import { AnthropicAIGateway } from '@/backend/contexts/shared/infrastructure/ai/anthropic-ai.gateway';
import { OpenAIEmbeddingGateway } from '@/backend/contexts/shared/infrastructure/ai/openai-embedding.gateway';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';

export function createExecuteContentCheckUseCase(): ExecuteContentCheckUseCase {
	return new ExecuteContentCheckUseCase(
		new AnthropicAIGateway(),
		new OpenAIEmbeddingGateway(),
		new PrismaContentCheckRepository(prisma),
		new PrismaContentSegmentRepository(prisma),
		new PrismaCheckResultRepository(prisma),
		new PrismaExpressionRuleProvider(prisma),
		new PrismaKnowledgeSearchGateway(prisma),
	);
}

export function createGetContentCheckDetailUseCase(): GetContentCheckDetailUseCase {
	return new GetContentCheckDetailUseCase(
		new PrismaContentCheckRepository(prisma),
		new PrismaContentSegmentRepository(prisma),
		new PrismaCheckResultRepository(prisma),
	);
}
