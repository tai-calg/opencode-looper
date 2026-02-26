export class Timestamp {
	private constructor(private readonly value: Date) {}

	static now(): Timestamp {
		return new Timestamp(new Date());
	}

	static fromDate(date: Date): Timestamp {
		return new Timestamp(date);
	}

	static reconstruct(date: Date): Timestamp {
		return new Timestamp(date);
	}

	toDate(): Date {
		return this.value;
	}

	toISOString(): string {
		return this.value.toISOString();
	}
}
