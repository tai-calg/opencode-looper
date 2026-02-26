import type { KnowledgeRepository } from '../../domain/repositories/knowledge.repository';

export class DeleteKnowledgeUseCase {
	constructor(private readonly knowledgeRepository: KnowledgeRepository) {}

	async execute(id: string): Promise<void> {
		const existing = await this.knowledgeRepository.findById(id);
		if (!existing) {
			throw new Error('ナレッジが見つかりません');
		}
		await this.knowledgeRepository.delete(id);
	}
}
