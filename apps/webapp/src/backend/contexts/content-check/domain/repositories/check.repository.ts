import type { Check } from '../models/check.model';

export interface CheckRepository {
	findById(id: string, userId?: string): Promise<Check | null>;
	findAll(params?: { limit?: number; offset?: number; userId?: string }): Promise<Check[]>;
	save(check: Check): Promise<void>;
	delete(id: string, userId?: string): Promise<void>;
	count(userId?: string): Promise<number>;
}
