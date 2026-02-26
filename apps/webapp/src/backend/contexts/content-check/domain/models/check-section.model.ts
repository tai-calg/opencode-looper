import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import type { CheckIssue } from './check-issue.model';

export const SECTION_STATUSES = ['pending', 'checking', 'completed', 'failed'] as const;
export type SectionStatus = (typeof SECTION_STATUSES)[number];

type CheckSectionProps = {
	id: string;
	sectionIndex: number;
	content: string;
	status: SectionStatus;
	issues: CheckIssue[];
	createdAt: Timestamp;
};

export class CheckSection {
	private constructor(private readonly props: CheckSectionProps) {}

	static create(params: { sectionIndex: number; content: string }): CheckSection {
		return new CheckSection({
			id: crypto.randomUUID(),
			sectionIndex: params.sectionIndex,
			content: params.content,
			status: 'pending',
			issues: [],
			createdAt: Timestamp.now(),
		});
	}

	static reconstruct(props: CheckSectionProps): CheckSection {
		return new CheckSection(props);
	}

	get id(): string {
		return this.props.id;
	}
	get sectionIndex(): number {
		return this.props.sectionIndex;
	}
	get content(): string {
		return this.props.content;
	}
	get status(): SectionStatus {
		return this.props.status;
	}
	get issues(): ReadonlyArray<CheckIssue> {
		return this.props.issues;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}

	markChecking(): CheckSection {
		return new CheckSection({ ...this.props, status: 'checking', issues: [] });
	}

	markCompleted(issues: CheckIssue[]): CheckSection {
		return new CheckSection({ ...this.props, status: 'completed', issues });
	}

	markFailed(): CheckSection {
		return new CheckSection({ ...this.props, status: 'failed' });
	}
}
