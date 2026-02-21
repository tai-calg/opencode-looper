import type { CheckResultRepository } from '@/backend/contexts/content-check/domain/gateways/check-result.repository';
import type { ContentCheckRepository } from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import type { ContentSegmentRepository } from '@/backend/contexts/content-check/domain/gateways/content-segment.repository';
import { CheckResult } from '@/backend/contexts/content-check/domain/models/check-result.model';
import { ContentCheck } from '@/backend/contexts/content-check/domain/models/content-check.model';
import { ContentSegment } from '@/backend/contexts/content-check/domain/models/content-segment.model';
import { createCheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it, vi } from 'vitest';
import { GetContentCheckDetailUseCase } from '../get-content-check-detail.usecase';

const CHECK_ID = '00000000-0000-0000-0000-000000000001';
const USER_ID = '00000000-0000-0000-0000-000000000002';
const SEGMENT_ID_1 = '00000000-0000-0000-0000-000000000010';
const SEGMENT_ID_2 = '00000000-0000-0000-0000-000000000011';
const RESULT_ID_1 = '00000000-0000-0000-0000-000000000020';
const RESULT_ID_2 = '00000000-0000-0000-0000-000000000021';
const RESULT_ID_3 = '00000000-0000-0000-0000-000000000022';

function buildContentCheck(): ContentCheck {
	return ContentCheck.reconstruct({
		id: createContentCheckId(CHECK_ID),
		userId: createUserId(USER_ID),
		source: 'web',
		content: 'サンプルコンテンツです。',
		status: 'completed',
		failedReason: null,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		updatedAt: new Date('2026-01-01T00:01:00Z'),
	});
}

function buildSegment(segmentId: string, index: number, text: string): ContentSegment {
	return ContentSegment.reconstruct({
		id: createContentSegmentId(segmentId),
		contentCheckId: createContentCheckId(CHECK_ID),
		segmentIndex: index,
		text,
		createdAt: new Date('2026-01-01T00:00:00Z'),
	});
}

function buildCheckResult(
	resultId: string,
	segmentId: string,
	severity: 'info' | 'warning' | 'error',
	checkType:
		| 'fact_check'
		| 'knowledge_consistency'
		| 'expression_rule'
		| 'risk_assessment'
		| 'quality',
	suggestion: string | null = null,
): CheckResult {
	return CheckResult.reconstruct({
		id: createCheckResultId(resultId),
		segmentId: createContentSegmentId(segmentId),
		contentCheckId: createContentCheckId(CHECK_ID),
		checkType,
		severity,
		message: `${checkType}の指摘内容`,
		suggestion,
		createdAt: new Date('2026-01-01T00:00:00Z'),
	});
}

function createMockContentCheckRepository(
	overrides: Partial<ContentCheckRepository> = {},
): ContentCheckRepository {
	return {
		save: vi.fn().mockResolvedValue(undefined),
		findById: vi.fn().mockResolvedValue(null),
		findAll: vi.fn().mockResolvedValue([]),
		...overrides,
	};
}

function createMockContentSegmentRepository(
	overrides: Partial<ContentSegmentRepository> = {},
): ContentSegmentRepository {
	return {
		saveMany: vi.fn().mockResolvedValue(undefined),
		findByContentCheckId: vi.fn().mockResolvedValue([]),
		...overrides,
	};
}

function createMockCheckResultRepository(
	overrides: Partial<CheckResultRepository> = {},
): CheckResultRepository {
	return {
		saveMany: vi.fn().mockResolvedValue(undefined),
		findBySegmentId: vi.fn().mockResolvedValue([]),
		findByContentCheckId: vi.fn().mockResolvedValue([]),
		...overrides,
	};
}

describe('GetContentCheckDetailUseCase', () => {
	describe('正常系', () => {
		it('ContentCheckDetailDto の構造が正しいこと', async () => {
			const contentCheck = buildContentCheck();
			const segment1 = buildSegment(SEGMENT_ID_1, 0, '第一段落のテキストです。');
			const result1 = buildCheckResult(
				RESULT_ID_1,
				SEGMENT_ID_1,
				'error',
				'fact_check',
				'修正提案1',
			);

			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(contentCheck),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([segment1]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([result1]),
			});

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute(CHECK_ID);

			expect(dto.id).toBe(CHECK_ID);
			expect(dto.status).toBe('completed');
			expect(dto.originalText).toBe('サンプルコンテンツです。');
			expect(dto.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'));
		});

		it('セグメントと結果が正しく組み立てられること', async () => {
			const contentCheck = buildContentCheck();
			const segment1 = buildSegment(SEGMENT_ID_1, 0, '第一段落のテキスト。');
			const segment2 = buildSegment(SEGMENT_ID_2, 1, '第二段落のテキスト。');
			const result1 = buildCheckResult(
				RESULT_ID_1,
				SEGMENT_ID_1,
				'error',
				'fact_check',
				'修正提案A',
			);
			const result2 = buildCheckResult(
				RESULT_ID_2,
				SEGMENT_ID_1,
				'warning',
				'expression_rule',
				null,
			);
			const result3 = buildCheckResult(RESULT_ID_3, SEGMENT_ID_2, 'info', 'quality', null);

			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(contentCheck),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([segment2, segment1]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([result1, result2, result3]),
			});

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute(CHECK_ID);

			expect(dto.segments).toHaveLength(2);

			// segmentIndex でソートされること
			expect(dto.segments[0].segmentIndex).toBe(0);
			expect(dto.segments[0].id).toBe(SEGMENT_ID_1);
			expect(dto.segments[0].text).toBe('第一段落のテキスト。');
			expect(dto.segments[0].results).toHaveLength(2);

			expect(dto.segments[1].segmentIndex).toBe(1);
			expect(dto.segments[1].id).toBe(SEGMENT_ID_2);
			expect(dto.segments[1].text).toBe('第二段落のテキスト。');
			expect(dto.segments[1].results).toHaveLength(1);
		});

		it('CheckResult の各フィールドが正しくマッピングされること', async () => {
			const contentCheck = buildContentCheck();
			const segment1 = buildSegment(SEGMENT_ID_1, 0, '段落テキスト。');
			const result1 = buildCheckResult(
				RESULT_ID_1,
				SEGMENT_ID_1,
				'error',
				'fact_check',
				'修正提案',
			);

			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(contentCheck),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([segment1]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([result1]),
			});

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute(CHECK_ID);

			const resultDto = dto.segments[0].results[0];
			expect(resultDto.id).toBe(RESULT_ID_1);
			expect(resultDto.checkType).toBe('fact_check');
			expect(resultDto.severity).toBe('error');
			expect(resultDto.message).toBe('fact_checkの指摘内容');
			expect(resultDto.suggestion).toBe('修正提案');
		});

		it('suggestion が null の場合は null がセットされること', async () => {
			const contentCheck = buildContentCheck();
			const segment1 = buildSegment(SEGMENT_ID_1, 0, '段落テキスト。');
			const result1 = buildCheckResult(RESULT_ID_1, SEGMENT_ID_1, 'info', 'quality', null);

			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(contentCheck),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([segment1]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([result1]),
			});

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute(CHECK_ID);

			expect(dto.segments[0].results[0].suggestion).toBeNull();
		});

		it('サマリーが severity 別に正しく集計されること', async () => {
			const contentCheck = buildContentCheck();
			const segment1 = buildSegment(SEGMENT_ID_1, 0, '第一段落。');
			const segment2 = buildSegment(SEGMENT_ID_2, 1, '第二段落。');
			const results = [
				buildCheckResult(RESULT_ID_1, SEGMENT_ID_1, 'error', 'fact_check'),
				buildCheckResult(RESULT_ID_2, SEGMENT_ID_1, 'warning', 'expression_rule'),
				buildCheckResult(RESULT_ID_3, SEGMENT_ID_2, 'info', 'quality'),
			];

			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(contentCheck),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([segment1, segment2]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue(results),
			});

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute(CHECK_ID);

			expect(dto.summary).toEqual({ error: 1, warning: 1, info: 1 });
		});

		it('チェック結果がない場合はサマリーが全て0になること', async () => {
			const contentCheck = buildContentCheck();
			const segment1 = buildSegment(SEGMENT_ID_1, 0, '段落テキスト。');

			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(contentCheck),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([segment1]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([]),
			});

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute(CHECK_ID);

			expect(dto.summary).toEqual({ error: 0, warning: 0, info: 0 });
			expect(dto.segments[0].results).toHaveLength(0);
		});

		it('セグメントがない場合は空配列を返すこと', async () => {
			const contentCheck = buildContentCheck();

			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(contentCheck),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([]),
			});

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute(CHECK_ID);

			expect(dto.segments).toHaveLength(0);
			expect(dto.summary).toEqual({ error: 0, warning: 0, info: 0 });
		});
	});

	describe('異常系', () => {
		it('存在しない ID の場合は Error を throw すること', async () => {
			const contentCheckRepository = createMockContentCheckRepository({
				findById: vi.fn().mockResolvedValue(null),
			});
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			await expect(useCase.execute(CHECK_ID)).rejects.toThrow(
				`ContentCheck not found: ${CHECK_ID}`,
			);
		});

		it('無効な UUID を渡した場合は Error を throw すること', async () => {
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();

			const useCase = new GetContentCheckDetailUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			await expect(useCase.execute('invalid-id')).rejects.toThrow();
		});
	});
});
