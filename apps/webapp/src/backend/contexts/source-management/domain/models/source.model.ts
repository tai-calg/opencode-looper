import { Result } from '@/backend/contexts/shared/domain/models/result.model';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';

type SourceProps = {
	id: string;
	type: string;
	name: string;
	url: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};

export class Source {
	private constructor(private readonly props: SourceProps) {}

	static create(params: {
		type: string;
		name: string;
		url: string;
	}): Result<Source, string> {
		if (!params.name.trim()) {
			return Result.err('ソース名は必須です');
		}
		if (!params.url.trim()) {
			return Result.err('URLは必須です');
		}
		if (params.type !== 'note') {
			return Result.err('ソース種別は note のみサポートしています');
		}
		const now = Timestamp.now();
		return Result.ok(
			new Source({
				id: crypto.randomUUID(),
				type: params.type,
				name: params.name.trim(),
				url: params.url.trim(),
				createdAt: now,
				updatedAt: now,
			}),
		);
	}

	static reconstruct(props: SourceProps): Source {
		return new Source(props);
	}

	get id(): string {
		return this.props.id;
	}
	get type(): string {
		return this.props.type;
	}
	get name(): string {
		return this.props.name;
	}
	get url(): string {
		return this.props.url;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}
	get updatedAt(): Timestamp {
		return this.props.updatedAt;
	}
}
