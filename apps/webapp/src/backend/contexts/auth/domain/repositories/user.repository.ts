import type { User } from '../models/user.model';

export interface UserRepository {
	/** Supabase Auth uid で検索 */
	findById(id: string): Promise<User | null>;
	/** upsert: id が存在すれば更新、なければ作成 */
	upsert(user: User): Promise<void>;
}
