export const SEVERITIES = ['caution', 'needs_fix'] as const;
export type Severity = (typeof SEVERITIES)[number];

export function isSeverity(value: string): value is Severity {
	return (SEVERITIES as readonly string[]).includes(value);
}

export const SEVERITY_LABELS: Record<Severity, string> = {
	caution: '注意',
	needs_fix: '要修正',
};
