import { Result } from '@/backend/contexts/shared/domain/models/result.model';
import { Timestamp } from '@/backend/contexts/shared/domain/models/timestamp.model';

type ExpressionRuleProps = {
	id: string;
	ngExpression: string;
	okExpression: string;
	description: string | null;
	enabled: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};

export class ExpressionRule {
	private constructor(private readonly props: ExpressionRuleProps) {}

	static create(params: {
		ngExpression: string;
		okExpression: string;
		description?: string;
	}): Result<ExpressionRule, string> {
		if (!params.ngExpression.trim()) {
			return Result.err('NG表現は必須です');
		}
		if (!params.okExpression.trim()) {
			return Result.err('OK表現は必須です');
		}
		const now = Timestamp.now();
		return Result.ok(
			new ExpressionRule({
				id: crypto.randomUUID(),
				ngExpression: params.ngExpression.trim(),
				okExpression: params.okExpression.trim(),
				description: params.description?.trim() || null,
				enabled: true,
				createdAt: now,
				updatedAt: now,
			}),
		);
	}

	static reconstruct(props: ExpressionRuleProps): ExpressionRule {
		return new ExpressionRule(props);
	}

	get id(): string {
		return this.props.id;
	}
	get ngExpression(): string {
		return this.props.ngExpression;
	}
	get okExpression(): string {
		return this.props.okExpression;
	}
	get description(): string | null {
		return this.props.description;
	}
	get enabled(): boolean {
		return this.props.enabled;
	}
	get createdAt(): Timestamp {
		return this.props.createdAt;
	}
	get updatedAt(): Timestamp {
		return this.props.updatedAt;
	}

	update(params: {
		ngExpression: string;
		okExpression: string;
		description?: string;
	}): Result<ExpressionRule, string> {
		if (!params.ngExpression.trim()) {
			return Result.err('NG表現は必須です');
		}
		if (!params.okExpression.trim()) {
			return Result.err('OK表現は必須です');
		}
		return Result.ok(
			new ExpressionRule({
				...this.props,
				ngExpression: params.ngExpression.trim(),
				okExpression: params.okExpression.trim(),
				description: params.description?.trim() || null,
				updatedAt: Timestamp.now(),
			}),
		);
	}

	toggleEnabled(): ExpressionRule {
		return new ExpressionRule({
			...this.props,
			enabled: !this.props.enabled,
			updatedAt: Timestamp.now(),
		});
	}
}
