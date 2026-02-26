export class UserId {
	private constructor(private readonly value: string) {}

	static create(value: string): UserId {
		if (!value) throw new Error('UserId cannot be empty');
		return new UserId(value);
	}

	static reconstruct(value: string): UserId {
		return new UserId(value);
	}

	toString(): string {
		return this.value;
	}

	equals(other: UserId): boolean {
		return this.value === other.value;
	}
}
