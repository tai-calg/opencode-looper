import type { Source } from '../models/source.model';

export interface SourceRepository {
	findAll(): Promise<Source[]>;
	findById(id: string): Promise<Source | null>;
	save(source: Source): Promise<void>;
	delete(id: string): Promise<void>;
}
