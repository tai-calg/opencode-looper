import { Result } from '@/backend/contexts/shared/domain/models/result.model';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import type { CheckSection } from './check-section.model';

export const CHECK_STATUSES = ['processing', 'completed', 'failed'] as const;
export type CheckStatus = (typeof CHECK_STATUSES)[number];

type CheckProps = {
	id: string;
	title: string | null;
	platform: string | null;
	content: string;
	source: string;
	slackChannel: string | null;
	slackThreadTs: string | null;
	userId: string | null;
	status: CheckStatus;
	sections: CheckSection[];
	createdAt: Timestamp;
};

export class Check {
	private constructor(private readonly props: CheckProps) {}

	static create(params: {
		title?: string;
		platform?: string;
		content: string;
		source: string;
		userId?: string;
	}): Result<Check, string> {
		if (!params.content.trim()) {
			return Result.err('本文は必須です');
		}
		if (params.content.length > 30000) {
			return Result.err('本文は30,000文字以内で入力してください');
		}
		return Result.ok(
			new Check({
				id: crypto.randomUUID(),
				title: params.title?.trim() || null,
				platform: params.platform || null,
				content: params.content,
				source: params.source,
				slackChannel: null,
				slackThreadTs: null,
				userId: params.userId ?? null,
				status: 'processing',
				sections: [],
				createdAt: Timestamp.now(),
			}),
		);
	}

	static reconstruct(props: CheckProps): Check {
		return new Check(props);
	}

	get id(): string {
		return this.props.id;
	}
	get title(): string | null {
		return this.props.title;
	}
	get platform(): string | null {
		return this.props.platform;
	}
	get content(): string {
		return this.props.content;
	}
	get source(): string {
		return this.props.source;
	}
	get slackChannel(): string | null {
		return this.props.slackChannel;
	}
	get slackThreadTs(): string | null {
		return this.props.slackThreadTs;
	}
	get userId(): string | null {
		return this.props.userId;
	}
	get status(): CheckStatus {
		return this.props.status;
	}
	get sections(): ReadonlyArray<CheckSection> {
		return this.props.sections;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}

	/** 表示用タイトル（title が未設定の場合は本文先頭30字） */
	get displayTitle(): string {
		return this.props.title ?? this.props.content.slice(0, 30);
	}

	addSections(sections: CheckSection[]): Check {
		return new Check({ ...this.props, sections });
	}

	updateSection(updated: CheckSection): Check {
		const sections = this.props.sections.map((s) => (s.id === updated.id ? updated : s));
		return new Check({ ...this.props, sections });
	}

	/** セクションの状態から Check 全体のステータスを再計算する */
	recalculateStatus(): Check {
		const sections = this.props.sections;
		if (sections.length === 0) return this;

		const allCompleted = sections.every((s) => s.status === 'completed');
		if (allCompleted) {
			return new Check({ ...this.props, status: 'completed' });
		}

		const hasFailed = sections.some((s) => s.status === 'failed');
		const noPendingOrChecking = sections.every(
			(s) => s.status === 'completed' || s.status === 'failed',
		);
		if (hasFailed && noPendingOrChecking) {
			return new Check({ ...this.props, status: 'failed' });
		}

		return new Check({ ...this.props, status: 'processing' });
	}
}
