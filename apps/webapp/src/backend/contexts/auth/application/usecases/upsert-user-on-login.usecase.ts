import { User } from '../../domain/models/user.model';
import type { UserRepository } from '../../domain/repositories/user.repository';

const ALLOWED_DOMAIN = 'team-mir.ai';

export class UpsertUserOnLoginUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(params: {
		id: string;
		email: string;
		name: string | null;
		avatarUrl: string | null;
	}): Promise<{ user: User; domainAllowed: boolean }> {
		const user = User.create(params);

		// ドメイン検証
		if (!user.belongsToDomain(ALLOWED_DOMAIN)) {
			return { user, domainAllowed: false };
		}

		// users テーブルに upsert
		await this.userRepository.upsert(user);
		return { user, domainAllowed: true };
	}
}
