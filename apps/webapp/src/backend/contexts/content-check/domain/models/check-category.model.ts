export const CHECK_CATEGORIES = ['fact', 'knowledge', 'expression', 'risk', 'quality'] as const;
export type CheckCategory = (typeof CHECK_CATEGORIES)[number];

export function isCheckCategory(value: string): value is CheckCategory {
	return (CHECK_CATEGORIES as readonly string[]).includes(value);
}

export const CHECK_CATEGORY_LABELS: Record<CheckCategory, string> = {
	fact: '事実確認',
	knowledge: 'ナレッジ整合',
	expression: '表現ルール',
	risk: '炎上リスク',
	quality: '文章品質',
};
