import type { Source } from '../../domain/models/source.model';
import type { SourceArticleRepository } from '../../domain/repositories/source-article.repository';
import type { SourceRepository } from '../../domain/repositories/source.repository';

export type SourceWithCounts = {
	source: Source;
	articleCount: number;
	importedCount: number;
};

export class ListSourcesUseCase {
	constructor(
		private readonly sourceRepository: SourceRepository,
		private readonly sourceArticleRepository: SourceArticleRepository,
	) {}

	async execute(): Promise<SourceWithCounts[]> {
		const sources = await this.sourceRepository.findAll();
		const result: SourceWithCounts[] = [];
		for (const source of sources) {
			const counts = await this.sourceArticleRepository.countBySourceId(source.id);
			result.push({
				source,
				articleCount: counts.total,
				importedCount: counts.imported,
			});
		}
		return result;
	}
}
