import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';
import type { CheckCategory } from './check-category.model';
import type { Severity } from './severity.model';

type CheckIssueProps = {
	id: string;
	category: CheckCategory;
	severity: Severity;
	quote: string;
	message: string;
	suggestion: string | null;
	ruleId: string | null;
	resolved: boolean;
	createdAt: Timestamp;
};

export class CheckIssue {
	private constructor(private readonly props: CheckIssueProps) {}

	static create(params: {
		category: CheckCategory;
		severity: Severity;
		quote: string;
		message: string;
		suggestion?: string;
		ruleId?: string;
	}): CheckIssue {
		return new CheckIssue({
			id: crypto.randomUUID(),
			category: params.category,
			severity: params.severity,
			quote: params.quote,
			message: params.message,
			suggestion: params.suggestion ?? null,
			ruleId: params.ruleId ?? null,
			resolved: false,
			createdAt: Timestamp.now(),
		});
	}

	static reconstruct(props: CheckIssueProps): CheckIssue {
		return new CheckIssue(props);
	}

	get id(): string {
		return this.props.id;
	}
	get category(): CheckCategory {
		return this.props.category;
	}
	get severity(): Severity {
		return this.props.severity;
	}
	get quote(): string {
		return this.props.quote;
	}
	get message(): string {
		return this.props.message;
	}
	get suggestion(): string | null {
		return this.props.suggestion;
	}
	get ruleId(): string | null {
		return this.props.ruleId;
	}
	get resolved(): boolean {
		return this.props.resolved;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}

	toggleResolved(): CheckIssue {
		return new CheckIssue({
			...this.props,
			resolved: !this.props.resolved,
		});
	}
}
