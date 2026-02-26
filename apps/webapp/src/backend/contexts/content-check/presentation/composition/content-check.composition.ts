import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { AnthropicAIAdapter } from '@/backend/contexts/shared/infrastructure/adapters/anthropic-ai.adapter';
import { OpenAIEmbeddingAdapter } from '@/backend/contexts/shared/infrastructure/adapters/openai-embedding.adapter';
import { StubAIAdapter } from '@/backend/contexts/shared/infrastructure/adapters/stub-ai.adapter';
import { StubEmbeddingAdapter } from '@/backend/contexts/shared/infrastructure/adapters/stub-embedding.adapter';
import { DeleteCheckUseCase } from '../../application/usecases/delete-check.usecase';
import { GetCheckDetailUseCase } from '../../application/usecases/get-check-detail.usecase';
import { HandleSlackMentionUseCase } from '../../application/usecases/handle-slack-mention.usecase';
import { ListChecksUseCase } from '../../application/usecases/list-checks.usecase';
import { ResolveIssueUseCase } from '../../application/usecases/resolve-issue.usecase';
import { RetryCheckUseCase } from '../../application/usecases/retry-check.usecase';
import { RunCheckUseCase } from '../../application/usecases/run-check.usecase';
import type { SlackGateway } from '../../domain/gateways/slack.gateway';
import { PgvectorKnowledgeSearchAdapter } from '../../infrastructure/adapters/pgvector-knowledge-search.adapter';
import { PrismaExpressionRuleQueryAdapter } from '../../infrastructure/adapters/prisma-expression-rule-query.adapter';
import { SlackWebApiAdapter } from '../../infrastructure/adapters/slack-web-api.adapter';
import { StubExpressionRuleQueryAdapter } from '../../infrastructure/adapters/stub-expression-rule-query.adapter';
import { StubKnowledgeSearchAdapter } from '../../infrastructure/adapters/stub-knowledge-search.adapter';
import { StubSlackAdapter } from '../../infrastructure/adapters/stub-slack.adapter';
import { PrismaCheckRepository } from '../../infrastructure/repositories/prisma-check.repository';

function createAIGateway(): AIGateway {
	return process.env.ANTHROPIC_API_KEY ? new AnthropicAIAdapter() : new StubAIAdapter();
}

function createEmbeddingGateway(): EmbeddingGateway {
	return process.env.OPENAI_API_KEY ? new OpenAIEmbeddingAdapter() : new StubEmbeddingAdapter();
}

export function createRunCheckUseCase(): RunCheckUseCase {
	const repo = new PrismaCheckRepository();
	const aiGateway = createAIGateway();
	const embeddingGateway = createEmbeddingGateway();
	const ruleQueryGateway = process.env.DATABASE_URL
		? new PrismaExpressionRuleQueryAdapter()
		: new StubExpressionRuleQueryAdapter();
	const knowledgeSearchGateway = process.env.DATABASE_URL
		? new PgvectorKnowledgeSearchAdapter()
		: new StubKnowledgeSearchAdapter();
	return new RunCheckUseCase(
		repo,
		aiGateway,
		embeddingGateway,
		ruleQueryGateway,
		knowledgeSearchGateway,
	);
}

export function createGetCheckDetailUseCase(): GetCheckDetailUseCase {
	return new GetCheckDetailUseCase(new PrismaCheckRepository());
}

export function createListChecksUseCase(): ListChecksUseCase {
	return new ListChecksUseCase(new PrismaCheckRepository());
}

export function createResolveIssueUseCase(): ResolveIssueUseCase {
	return new ResolveIssueUseCase(new PrismaCheckRepository());
}

export function createRetryCheckUseCase(): RetryCheckUseCase {
	return new RetryCheckUseCase(new PrismaCheckRepository());
}

export function createDeleteCheckUseCase(): DeleteCheckUseCase {
	return new DeleteCheckUseCase(new PrismaCheckRepository());
}

function createSlackGateway(): SlackGateway {
	return process.env.SLACK_BOT_TOKEN
		? new SlackWebApiAdapter(process.env.SLACK_BOT_TOKEN)
		: new StubSlackAdapter();
}

export function createHandleSlackMentionUseCase(): HandleSlackMentionUseCase {
	return new HandleSlackMentionUseCase(
		createSlackGateway(),
		createRunCheckUseCase(),
		new PrismaCheckRepository(),
	);
}
