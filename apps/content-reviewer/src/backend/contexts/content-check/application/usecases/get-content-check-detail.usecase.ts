import type { CheckResultRepository } from '@/backend/contexts/content-check/domain/gateways/check-result.repository';
import type { ContentCheckRepository } from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import type { ContentSegmentRepository } from '@/backend/contexts/content-check/domain/gateways/content-segment.repository';
import type { CheckResult } from '@/backend/contexts/content-check/domain/models/check-result.model';
import type { ContentSegment } from '@/backend/contexts/content-check/domain/models/content-segment.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type {
	CheckResultDetailDto,
	ContentCheckDetailDto,
	ContentCheckSummaryDto,
	ContentSegmentDetailDto,
} from './content-check-detail.dto';

export class GetContentCheckDetailUseCase {
	constructor(
		private readonly contentCheckRepository: ContentCheckRepository,
		private readonly contentSegmentRepository: ContentSegmentRepository,
		private readonly checkResultRepository: CheckResultRepository,
	) {}

	async execute(id: string): Promise<ContentCheckDetailDto> {
		const contentCheckId = createContentCheckId(id);
		const contentCheck = await this.contentCheckRepository.findById(contentCheckId);

		if (!contentCheck) {
			throw new Error(`ContentCheck not found: ${id}`);
		}

		const segments = await this.contentSegmentRepository.findByContentCheckId(contentCheckId);
		const allResults = await this.checkResultRepository.findByContentCheckId(contentCheckId);

		const resultsBySegmentId = this.groupResultsBySegmentId(allResults);

		const segmentDtos: ContentSegmentDetailDto[] = segments
			.sort((a, b) => a.segmentIndex - b.segmentIndex)
			.map((segment) => this.toSegmentDto(segment, resultsBySegmentId[segment.id as string] ?? []));

		const summary = this.buildSummary(allResults);

		return {
			id: contentCheck.id as string,
			status: contentCheck.status,
			originalText: contentCheck.content,
			createdAt: contentCheck.createdAt,
			segments: segmentDtos,
			summary,
		};
	}

	private groupResultsBySegmentId(results: CheckResult[]): Record<string, CheckResult[]> {
		const grouped: Record<string, CheckResult[]> = {};
		for (const result of results) {
			const segmentId = result.segmentId as string;
			if (!grouped[segmentId]) {
				grouped[segmentId] = [];
			}
			grouped[segmentId].push(result);
		}
		return grouped;
	}

	private toSegmentDto(segment: ContentSegment, results: CheckResult[]): ContentSegmentDetailDto {
		const resultDtos: CheckResultDetailDto[] = results.map((result) => ({
			id: result.id as string,
			checkType: result.checkType,
			severity: result.severity,
			message: result.message,
			suggestion: result.suggestion,
		}));

		return {
			id: segment.id as string,
			segmentIndex: segment.segmentIndex,
			text: segment.text,
			results: resultDtos,
		};
	}

	private buildSummary(results: CheckResult[]): ContentCheckSummaryDto {
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
