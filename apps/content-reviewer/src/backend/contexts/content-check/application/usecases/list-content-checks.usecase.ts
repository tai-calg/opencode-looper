import type { CheckResultRepository } from '@/backend/contexts/content-check/domain/gateways/check-result.repository';
import type {
	ContentCheckFilter,
	ContentCheckRepository,
} from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import type { ContentSegmentRepository } from '@/backend/contexts/content-check/domain/gateways/content-segment.repository';
import type { CheckResult } from '@/backend/contexts/content-check/domain/models/check-result.model';
import type { ContentCheck } from '@/backend/contexts/content-check/domain/models/content-check.model';
import type { ContentCheckListDto, ContentCheckListItemDto } from './content-check-list.dto';

export class ListContentChecksUseCase {
	constructor(
		private readonly contentCheckRepository: ContentCheckRepository,
		private readonly contentSegmentRepository: ContentSegmentRepository,
		private readonly checkResultRepository: CheckResultRepository,
	) {}

	async execute(filter?: ContentCheckFilter): Promise<ContentCheckListDto> {
		const contentChecks = await this.contentCheckRepository.findAll(filter);

		const items = await Promise.all(
			contentChecks.map((contentCheck) => this.toListItemDto(contentCheck)),
		);

		return { items };
	}

	private async toListItemDto(contentCheck: ContentCheck): Promise<ContentCheckListItemDto> {
		const [segments, checkResults] = await Promise.all([
			this.contentSegmentRepository.findByContentCheckId(contentCheck.id),
			this.checkResultRepository.findByContentCheckId(contentCheck.id),
		]);

		const summary = this.buildSummary(checkResults);

		return {
			id: contentCheck.id as string,
			source: contentCheck.source,
			status: contentCheck.status,
			createdAt: contentCheck.createdAt,
			segmentCount: segments.length,
			summary,
		};
	}

	private buildSummary(results: CheckResult[]): { error: number; warning: number; info: number } {
		let error = 0;
		let warning = 0;
		let info = 0;

		for (const result of results) {
			if (result.severity === 'error') {
				error++;
			} else if (result.severity === 'warning') {
				warning++;
			} else if (result.severity === 'info') {
				info++;
			}
		}

		return { error, warning, info };
	}
}
