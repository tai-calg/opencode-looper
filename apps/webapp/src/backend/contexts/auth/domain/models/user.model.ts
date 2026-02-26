import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

type UserProps = {
	id: UserId;
	email: string;
	name: string | null;
	avatarUrl: string | null;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};

export class User {
	private constructor(private readonly props: UserProps) {}

	/**
	 * 初回ログイン時に新規ユーザーを作成する。
	 * id は Supabase Auth の uid をそのまま使う。
	 */
	static create(params: {
		id: string;
		email: string;
		name: string | null;
		avatarUrl: string | null;
	}): User {
		const now = Timestamp.now();
		return new User({
			id: UserId.create(params.id),
			email: params.email,
			name: params.name,
			avatarUrl: params.avatarUrl,
			createdAt: now,
			updatedAt: now,
		});
	}

	static reconstruct(props: {
		id: string;
		email: string;
		name: string | null;
		avatarUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
	}): User {
		return new User({
			id: UserId.reconstruct(props.id),
			email: props.email,
			name: props.name,
			avatarUrl: props.avatarUrl,
			createdAt: Timestamp.reconstruct(props.createdAt),
			updatedAt: Timestamp.reconstruct(props.updatedAt),
		});
	}

	get id(): UserId {
		return this.props.id;
	}
	get email(): string {
		return this.props.email;
	}
	get name(): string | null {
		return this.props.name;
	}
	get avatarUrl(): string | null {
		return this.props.avatarUrl;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}
	get updatedAt(): Timestamp {
		return this.props.updatedAt;
	}

	/** メールドメインを返す */
	get emailDomain(): string {
		return this.props.email.split('@')[1];
	}

	/** 指定ドメインに所属しているか */
	belongsToDomain(domain: string): boolean {
		return this.emailDomain === domain;
	}
}
