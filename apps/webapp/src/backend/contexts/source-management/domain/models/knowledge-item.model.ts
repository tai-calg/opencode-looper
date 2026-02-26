import { Result } from '@/backend/contexts/shared/domain/models/result.model';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import type { SourceType } from './source-type.model';
import { isSourceType } from './source-type.model';

type KnowledgeItemProps = {
	id: string;
	title: string;
	sourceType: SourceType;
	sourceUrl: string | null;
	content: string;
	embedding: number[] | null;
	sourceArticleId: string | null;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};

export class KnowledgeItem {
	private constructor(private readonly props: KnowledgeItemProps) {}

	static create(params: {
		title: string;
		sourceType: string;
		content: string;
		sourceUrl?: string;
	}): Result<KnowledgeItem, string> {
		if (!params.title.trim()) {
			return Result.err('タイトルは必須です');
		}
		if (!params.content.trim()) {
			return Result.err('本文は必須です');
		}
		if (!isSourceType(params.sourceType)) {
			return Result.err('無効なソース種別です');
		}
		const now = Timestamp.now();
		return Result.ok(
			new KnowledgeItem({
				id: crypto.randomUUID(),
				title: params.title.trim(),
				sourceType: params.sourceType,
				sourceUrl: params.sourceUrl?.trim() || null,
				content: params.content.trim(),
				embedding: null,
				sourceArticleId: null,
				createdAt: now,
				updatedAt: now,
			}),
		);
	}

	static reconstruct(props: KnowledgeItemProps): KnowledgeItem {
		return new KnowledgeItem(props);
	}

	get id(): string {
		return this.props.id;
	}
	get title(): string {
		return this.props.title;
	}
	get sourceType(): SourceType {
		return this.props.sourceType;
	}
	get sourceUrl(): string | null {
		return this.props.sourceUrl;
	}
	get content(): string {
		return this.props.content;
	}
	get embedding(): number[] | null {
		return this.props.embedding;
	}
	get sourceArticleId(): string | null {
		return this.props.sourceArticleId;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}
	get updatedAt(): Timestamp {
		return this.props.updatedAt;
	}

	update(params: {
		title: string;
		sourceType: string;
		content: string;
		sourceUrl?: string;
	}): Result<KnowledgeItem, string> {
		if (!params.title.trim()) {
			return Result.err('タイトルは必須です');
		}
		if (!params.content.trim()) {
			return Result.err('本文は必須です');
		}
		if (!isSourceType(params.sourceType)) {
			return Result.err('無効なソース種別です');
		}
		const contentChanged = this.props.content !== params.content.trim();
		return Result.ok(
			new KnowledgeItem({
				...this.props,
				title: params.title.trim(),
				sourceType: params.sourceType,
				sourceUrl: params.sourceUrl?.trim() || null,
				content: params.content.trim(),
				// content が変更された場合は embedding をクリア（再生成が必要）
				embedding: contentChanged ? null : this.props.embedding,
				updatedAt: Timestamp.now(),
			}),
		);
	}

	withEmbedding(embedding: number[]): KnowledgeItem {
		return new KnowledgeItem({
			...this.props,
			embedding,
		});
	}

	get hasEmbedding(): boolean {
		return this.props.embedding !== null;
	}
}
