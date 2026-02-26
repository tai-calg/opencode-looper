export const SOURCE_TYPES = ['note', 'manifesto', 'manual'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export function isSourceType(value: string): value is SourceType {
	return (SOURCE_TYPES as readonly string[]).includes(value);
}
