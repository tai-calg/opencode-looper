import { ListContentChecksUseCase } from '@/backend/contexts/content-check/application/usecases/list-content-checks.usecase';
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

const CHECK_ID_1 = '00000000-0000-0000-0000-000000000001';
const CHECK_ID_2 = '00000000-0000-0000-0000-000000000002';
const USER_ID = '00000000-0000-0000-0000-000000000010';
const SEGMENT_ID_1 = '00000000-0000-0000-0000-000000000020';
const SEGMENT_ID_2 = '00000000-0000-0000-0000-000000000021';
const RESULT_ID_1 = '00000000-0000-0000-0000-000000000030';
const RESULT_ID_2 = '00000000-0000-0000-0000-000000000031';
const RESULT_ID_3 = '00000000-0000-0000-0000-000000000032';

function buildContentCheck(
	id: string,
	overrides: {
		source?: 'web' | 'slack';
		status?: 'pending' | 'processing' | 'completed' | 'failed';
	} = {},
): ContentCheck {
	return ContentCheck.reconstruct({
		id: createContentCheckId(id),
		userId: createUserId(USER_ID),
		source: overrides.source ?? 'web',
		content: 'テストコンテンツです。',
		status: overrides.status ?? 'completed',
		failedReason: null,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		updatedAt: new Date('2026-01-01T00:01:00Z'),
	});
}

function buildSegment(segmentId: string, contentCheckId: string): ContentSegment {
	return ContentSegment.reconstruct({
		id: createContentSegmentId(segmentId),
		contentCheckId: createContentCheckId(contentCheckId),
		segmentIndex: 0,
		text: 'セグメントテキストです。',
		createdAt: new Date('2026-01-01T00:00:00Z'),
	});
}

function buildCheckResult(
	resultId: string,
	contentCheckId: string,
	severity: 'info' | 'warning' | 'error',
): CheckResult {
	return CheckResult.reconstruct({
		id: createCheckResultId(resultId),
		segmentId: createContentSegmentId(SEGMENT_ID_1),
		contentCheckId: createContentCheckId(contentCheckId),
		checkType: 'fact_check',
		severity,
		message: `${severity}メッセージ`,
		suggestion: null,
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

describe('ListContentChecksUseCase', () => {
	describe('正常系: フィルタなし一覧', () => {
		it('チェックがない場合は空の items を返すこと', async () => {
			const contentCheckRepository = createMockContentCheckRepository();
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();

			const useCase = new ListContentChecksUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute();

			expect(dto.items).toHaveLength(0);
			expect(contentCheckRepository.findAll).toHaveBeenCalledWith(undefined);
		});

		it('複数チェックの一覧 DTO が正しく組み立てられること', async () => {
			const check1 = buildContentCheck(CHECK_ID_1, { source: 'web', status: 'completed' });
			const check2 = buildContentCheck(CHECK_ID_2, { source: 'slack', status: 'processing' });
			const segment1 = buildSegment(SEGMENT_ID_1, CHECK_ID_1);
			const segment2 = buildSegment(SEGMENT_ID_2, CHECK_ID_1);
			const result1 = buildCheckResult(RESULT_ID_1, CHECK_ID_1, 'error');
			const result2 = buildCheckResult(RESULT_ID_2, CHECK_ID_1, 'warning');

			const contentCheckRepository = createMockContentCheckRepository({
				findAll: vi.fn().mockResolvedValue([check1, check2]),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi
					.fn()
					.mockImplementation((id) => ((id as string) === CHECK_ID_1 ? [segment1, segment2] : [])),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi
					.fn()
					.mockImplementation((id) => ((id as string) === CHECK_ID_1 ? [result1, result2] : [])),
			});

			const useCase = new ListContentChecksUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute();

			expect(dto.items).toHaveLength(2);

			const item1 = dto.items[0];
			expect(item1.id).toBe(CHECK_ID_1);
			expect(item1.source).toBe('web');
			expect(item1.status).toBe('completed');
			expect(item1.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'));
			expect(item1.segmentCount).toBe(2);
			expect(item1.summary).toEqual({ error: 1, warning: 1, info: 0 });

			const item2 = dto.items[1];
			expect(item2.id).toBe(CHECK_ID_2);
			expect(item2.source).toBe('slack');
			expect(item2.status).toBe('processing');
			expect(item2.segmentCount).toBe(0);
			expect(item2.summary).toEqual({ error: 0, warning: 0, info: 0 });
		});

		it('各チェックの segmentCount と summary が並列取得されること', async () => {
			const check1 = buildContentCheck(CHECK_ID_1);
			const segment1 = buildSegment(SEGMENT_ID_1, CHECK_ID_1);
			const result1 = buildCheckResult(RESULT_ID_1, CHECK_ID_1, 'info');
			const result2 = buildCheckResult(RESULT_ID_2, CHECK_ID_1, 'error');
			const result3 = buildCheckResult(RESULT_ID_3, CHECK_ID_1, 'warning');

			const contentCheckRepository = createMockContentCheckRepository({
				findAll: vi.fn().mockResolvedValue([check1]),
			});
			const contentSegmentRepository = createMockContentSegmentRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([segment1]),
			});
			const checkResultRepository = createMockCheckResultRepository({
				findByContentCheckId: vi.fn().mockResolvedValue([result1, result2, result3]),
			});

			const useCase = new ListContentChecksUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute();

			expect(dto.items).toHaveLength(1);
			expect(dto.items[0].segmentCount).toBe(1);
			expect(dto.items[0].summary).toEqual({ error: 1, warning: 1, info: 1 });

			expect(contentSegmentRepository.findByContentCheckId).toHaveBeenCalledWith(
				createContentCheckId(CHECK_ID_1),
			);
			expect(checkResultRepository.findByContentCheckId).toHaveBeenCalledWith(
				createContentCheckId(CHECK_ID_1),
			);
		});
	});

	describe('正常系: source フィルタ', () => {
		it('source フィルタを渡すと contentCheckRepository.findAll に伝播すること', async () => {
			const check1 = buildContentCheck(CHECK_ID_1, { source: 'web' });

			const contentCheckRepository = createMockContentCheckRepository({
				findAll: vi.fn().mockResolvedValue([check1]),
			});
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();

			const useCase = new ListContentChecksUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute({ source: 'web' });

			expect(contentCheckRepository.findAll).toHaveBeenCalledWith({ source: 'web' });
			expect(dto.items).toHaveLength(1);
			expect(dto.items[0].source).toBe('web');
		});

		it('source: slack フィルタで slack 由来のチェックのみ返すこと', async () => {
			const check2 = buildContentCheck(CHECK_ID_2, { source: 'slack' });

			const contentCheckRepository = createMockContentCheckRepository({
				findAll: vi.fn().mockResolvedValue([check2]),
			});
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();

			const useCase = new ListContentChecksUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute({ source: 'slack' });

			expect(contentCheckRepository.findAll).toHaveBeenCalledWith({ source: 'slack' });
			expect(dto.items).toHaveLength(1);
			expect(dto.items[0].source).toBe('slack');
		});
	});

	describe('正常系: status フィルタ', () => {
		it('status フィルタを渡すと contentCheckRepository.findAll に伝播すること', async () => {
			const check1 = buildContentCheck(CHECK_ID_1, { status: 'completed' });

			const contentCheckRepository = createMockContentCheckRepository({
				findAll: vi.fn().mockResolvedValue([check1]),
			});
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();

			const useCase = new ListContentChecksUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute({ status: 'completed' });

			expect(contentCheckRepository.findAll).toHaveBeenCalledWith({ status: 'completed' });
			expect(dto.items).toHaveLength(1);
			expect(dto.items[0].status).toBe('completed');
		});

		it('status: failed フィルタで失敗したチェックのみ返すこと', async () => {
			const check1 = buildContentCheck(CHECK_ID_1, { status: 'failed' });

			const contentCheckRepository = createMockContentCheckRepository({
				findAll: vi.fn().mockResolvedValue([check1]),
			});
			const contentSegmentRepository = createMockContentSegmentRepository();
			const checkResultRepository = createMockCheckResultRepository();

			const useCase = new ListContentChecksUseCase(
				contentCheckRepository,
				contentSegmentRepository,
				checkResultRepository,
			);

			const dto = await useCase.execute({ status: 'failed' });

			expect(contentCheckRepository.findAll).toHaveBeenCalledWith({ status: 'failed' });
			expect(dto.items).toHaveLength(1);
			expect(dto.items[0].status).toBe('failed');
		});
	});
});
