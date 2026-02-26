import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import { OpenAIEmbeddingAdapter } from '@/backend/contexts/shared/infrastructure/adapters/openai-embedding.adapter';
import { StubEmbeddingAdapter } from '@/backend/contexts/shared/infrastructure/adapters/stub-embedding.adapter';
import { CreateKnowledgeUseCase } from '../../application/usecases/create-knowledge.usecase';
import { CreateRuleUseCase } from '../../application/usecases/create-rule.usecase';
import { CreateSourceUseCase } from '../../application/usecases/create-source.usecase';
import { DeleteKnowledgeUseCase } from '../../application/usecases/delete-knowledge.usecase';
import { DeleteRuleUseCase } from '../../application/usecases/delete-rule.usecase';
import { GetSourceDetailUseCase } from '../../application/usecases/get-source-detail.usecase';
import { ImportArticlesUseCase } from '../../application/usecases/import-articles.usecase';
import { ListKnowledgeUseCase } from '../../application/usecases/list-knowledge.usecase';
import { ListRulesUseCase } from '../../application/usecases/list-rules.usecase';
import { ListSourcesUseCase } from '../../application/usecases/list-sources.usecase';
import { SyncArticlesUseCase } from '../../application/usecases/sync-articles.usecase';
import { ToggleRuleUseCase } from '../../application/usecases/toggle-rule.usecase';
import { UpdateKnowledgeUseCase } from '../../application/usecases/update-knowledge.usecase';
import { UpdateRuleUseCase } from '../../application/usecases/update-rule.usecase';
import type { ArticleFetchGateway } from '../../domain/gateways/article-fetch.gateway';
import { NoteApiArticleFetchAdapter } from '../../infrastructure/adapters/note-api-article-fetch.adapter';
import { PrismaExpressionRuleRepository } from '../../infrastructure/repositories/prisma-expression-rule.repository';
import { PrismaKnowledgeRepository } from '../../infrastructure/repositories/prisma-knowledge.repository';
import { PrismaSourceArticleRepository } from '../../infrastructure/repositories/prisma-source-article.repository';
import { PrismaSourceRepository } from '../../infrastructure/repositories/prisma-source.repository';

export function createListRulesUseCase(): ListRulesUseCase {
	const repo = new PrismaExpressionRuleRepository();
	return new ListRulesUseCase(repo);
}

export function createCreateRuleUseCase(): CreateRuleUseCase {
	const repo = new PrismaExpressionRuleRepository();
	return new CreateRuleUseCase(repo);
}

export function createUpdateRuleUseCase(): UpdateRuleUseCase {
	const repo = new PrismaExpressionRuleRepository();
	return new UpdateRuleUseCase(repo);
}

export function createDeleteRuleUseCase(): DeleteRuleUseCase {
	const repo = new PrismaExpressionRuleRepository();
	return new DeleteRuleUseCase(repo);
}

export function createToggleRuleUseCase(): ToggleRuleUseCase {
	const repo = new PrismaExpressionRuleRepository();
	return new ToggleRuleUseCase(repo);
}

function createEmbeddingGateway(): EmbeddingGateway {
	return process.env.OPENAI_API_KEY ? new OpenAIEmbeddingAdapter() : new StubEmbeddingAdapter();
}

export function createListKnowledgeUseCase(): ListKnowledgeUseCase {
	return new ListKnowledgeUseCase(new PrismaKnowledgeRepository());
}

export function createCreateKnowledgeUseCase(): CreateKnowledgeUseCase {
	return new CreateKnowledgeUseCase(new PrismaKnowledgeRepository(), createEmbeddingGateway());
}

export function createUpdateKnowledgeUseCase(): UpdateKnowledgeUseCase {
	return new UpdateKnowledgeUseCase(new PrismaKnowledgeRepository(), createEmbeddingGateway());
}

export function createDeleteKnowledgeUseCase(): DeleteKnowledgeUseCase {
	return new DeleteKnowledgeUseCase(new PrismaKnowledgeRepository());
}

function createArticleFetchGateway(): ArticleFetchGateway {
	return new NoteApiArticleFetchAdapter();
}

export function createListSourcesUseCase(): ListSourcesUseCase {
	return new ListSourcesUseCase(new PrismaSourceRepository(), new PrismaSourceArticleRepository());
}

export function createCreateSourceUseCase(): CreateSourceUseCase {
	return new CreateSourceUseCase(new PrismaSourceRepository());
}

export function createGetSourceDetailUseCase(): GetSourceDetailUseCase {
	return new GetSourceDetailUseCase(
		new PrismaSourceRepository(),
		new PrismaSourceArticleRepository(),
		new PrismaKnowledgeRepository(),
	);
}

export function createSyncArticlesUseCase(): SyncArticlesUseCase {
	return new SyncArticlesUseCase(
		new PrismaSourceRepository(),
		new PrismaSourceArticleRepository(),
		createArticleFetchGateway(),
	);
}

export function createImportArticlesUseCase(): ImportArticlesUseCase {
	return new ImportArticlesUseCase(
		new PrismaSourceArticleRepository(),
		createArticleFetchGateway(),
		new PrismaKnowledgeRepository(),
		createEmbeddingGateway(),
	);
}
