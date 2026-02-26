import { CreateRuleUseCase } from '../../application/usecases/create-rule.usecase';
import { DeleteRuleUseCase } from '../../application/usecases/delete-rule.usecase';
import { ListRulesUseCase } from '../../application/usecases/list-rules.usecase';
import { ToggleRuleUseCase } from '../../application/usecases/toggle-rule.usecase';
import { UpdateRuleUseCase } from '../../application/usecases/update-rule.usecase';
import { PrismaExpressionRuleRepository } from '../../infrastructure/repositories/prisma-expression-rule.repository';

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
