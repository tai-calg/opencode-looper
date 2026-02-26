import { createGetCheckDetailUseCase } from '../composition/content-check.composition';

export type CheckDetailSection = {
	id: string;
	sectionIndex: number;
	content: string;
	status: string;
	issues: CheckDetailIssue[];
};

export type CheckDetailIssue = {
	id: string;
	category: string;
	severity: string;
	quote: string;
	message: string;
	suggestion: string | null;
	ruleId: string | null;
	resolved: boolean;
};

export type CheckDetail = {
	id: string;
	displayTitle: string;
	title: string | null;
	platform: string | null;
	content: string;
	source: string;
	status: string;
	sections: CheckDetailSection[];
	createdAt: string;
};

export async function loadCheckDetail(id: string, userId?: string): Promise<CheckDetail> {
	const useCase = createGetCheckDetailUseCase();
	const check = await useCase.execute(id, userId);
	return {
		id: check.id,
		displayTitle: check.displayTitle,
		title: check.title,
		platform: check.platform,
		content: check.content,
		source: check.source,
		status: check.status,
		sections: check.sections.map((s) => ({
			id: s.id,
			sectionIndex: s.sectionIndex,
			content: s.content,
			status: s.status,
			issues: s.issues.map((i) => ({
				id: i.id,
				category: i.category,
				severity: i.severity,
				quote: i.quote,
				message: i.message,
				suggestion: i.suggestion,
				ruleId: i.ruleId,
				resolved: i.resolved,
			})),
		})),
		createdAt: check.createdAt.toISOString(),
	};
}
