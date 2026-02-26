import type { Check } from '../models/check.model';

export interface CheckRepository {
	findById(id: string): Promise<Check | null>;
	findAll(params?: { limit?: number; offset?: number }): Promise<Check[]>;
	save(check: Check): Promise<void>;
	delete(id: string): Promise<void>;
	count(): Promise<number>;
}
