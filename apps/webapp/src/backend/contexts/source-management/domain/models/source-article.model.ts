import { Result } from '@/backend/contexts/shared/domain/models/result.model';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';

type SourceArticleProps = {
	id: string;
	sourceId: string;
	title: string;
	url: string;
	publishedAt: Timestamp | null;
	imported: boolean;
	createdAt: Timestamp;
};

export class SourceArticle {
	private constructor(private readonly props: SourceArticleProps) {}

	static create(params: {
		sourceId: string;
		title: string;
		url: string;
		publishedAt?: Date | null;
	}): Result<SourceArticle, string> {
		if (!params.title.trim()) {
			return Result.err('タイトルは必須です');
		}
		if (!params.url.trim()) {
			return Result.err('URLは必須です');
		}
		return Result.ok(
			new SourceArticle({
				id: crypto.randomUUID(),
				sourceId: params.sourceId,
				title: params.title.trim(),
				url: params.url.trim(),
				publishedAt: params.publishedAt ? Timestamp.fromDate(params.publishedAt) : null,
				imported: false,
				createdAt: Timestamp.now(),
			}),
		);
	}

	static reconstruct(props: SourceArticleProps): SourceArticle {
		return new SourceArticle(props);
	}

	markAsImported(): SourceArticle {
		return new SourceArticle({ ...this.props, imported: true });
	}

	get id(): string {
		return this.props.id;
	}
	get sourceId(): string {
		return this.props.sourceId;
	}
	get title(): string {
		return this.props.title;
	}
	get url(): string {
		return this.props.url;
	}
	get publishedAt(): Timestamp | null {
		return this.props.publishedAt;
	}
	get imported(): boolean {
		return this.props.imported;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}
}
