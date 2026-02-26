import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { describe, expect, it } from 'vitest';

describe('Timestamp', () => {
	describe('now', () => {
		it('should create a Timestamp with the current date', () => {
			const before = new Date();
			const timestamp = Timestamp.now();
			const after = new Date();

			expect(timestamp.toDate().getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(timestamp.toDate().getTime()).toBeLessThanOrEqual(after.getTime());
		});
	});

	describe('fromDate', () => {
		it('should create a Timestamp from a given date', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const timestamp = Timestamp.fromDate(date);
			expect(timestamp.toDate()).toEqual(date);
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct a Timestamp from a date', () => {
			const date = new Date('2024-06-01T00:00:00Z');
			const timestamp = Timestamp.reconstruct(date);
			expect(timestamp.toDate()).toEqual(date);
		});
	});

	describe('toISOString', () => {
		it('should return the ISO string representation', () => {
			const date = new Date('2024-01-15T10:30:00.000Z');
			const timestamp = Timestamp.fromDate(date);
			expect(timestamp.toISOString()).toBe('2024-01-15T10:30:00.000Z');
		});
	});
});
