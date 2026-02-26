import type { KnowledgeItem } from '../models/knowledge-item.model';

export interface KnowledgeRepository {
	findAll(): Promise<KnowledgeItem[]>;
	findById(id: string): Promise<KnowledgeItem | null>;
	save(item: KnowledgeItem): Promise<void>;
	delete(id: string): Promise<void>;
}
