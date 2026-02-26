import { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it } from 'vitest';

describe('UserId', () => {
	describe('create', () => {
		it('should create a UserId from a non-empty string', () => {
			const userId = UserId.create('abc-123');
			expect(userId.toString()).toBe('abc-123');
		});

		it('should throw an error for an empty string', () => {
			expect(() => UserId.create('')).toThrow('UserId cannot be empty');
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct a UserId from a string', () => {
			const userId = UserId.reconstruct('abc-123');
			expect(userId.toString()).toBe('abc-123');
		});
	});

	describe('equals', () => {
		it('should return true for equal UserIds', () => {
			const a = UserId.create('abc-123');
			const b = UserId.create('abc-123');
			expect(a.equals(b)).toBe(true);
		});

		it('should return false for different UserIds', () => {
			const a = UserId.create('abc-123');
			const b = UserId.create('xyz-456');
			expect(a.equals(b)).toBe(false);
		});
	});

	describe('toString', () => {
		it('should return the underlying value', () => {
			const userId = UserId.create('user-id-value');
			expect(userId.toString()).toBe('user-id-value');
		});
	});
});
