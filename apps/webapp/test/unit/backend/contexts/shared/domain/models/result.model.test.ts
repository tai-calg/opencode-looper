import { Result } from '@/backend/contexts/shared/domain/models/result.model';
import { describe, expect, it } from 'vitest';

describe('Result', () => {
	describe('ok', () => {
		it('should create a success result with value', () => {
			const result = Result.ok(42);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value).toBe(42);
			}
		});

		it('should create a success result with string value', () => {
			const result = Result.ok('hello');
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value).toBe('hello');
			}
		});
	});

	describe('err', () => {
		it('should create an error result with message', () => {
			const result = Result.err('something went wrong');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('something went wrong');
			}
		});

		it('should create an error result with custom error type', () => {
			const result = Result.err({ code: 404, message: 'Not found' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toEqual({ code: 404, message: 'Not found' });
			}
		});
	});
});
