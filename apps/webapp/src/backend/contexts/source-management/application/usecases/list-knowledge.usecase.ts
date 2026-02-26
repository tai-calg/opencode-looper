import type { KnowledgeItem } from '../../domain/models/knowledge-item.model';
import type { KnowledgeRepository } from '../../domain/repositories/knowledge.repository';

export class ListKnowledgeUseCase {
	constructor(private readonly knowledgeRepository: KnowledgeRepository) {}

	async execute(): Promise<KnowledgeItem[]> {
		return this.knowledgeRepository.findAll();
	}
}
