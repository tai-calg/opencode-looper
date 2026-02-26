import type { CheckRepository } from '../../domain/repositories/check.repository';

export class ResolveIssueUseCase {
	constructor(private readonly checkRepository: CheckRepository) {}

	async execute(params: { checkId: string; issueId: string; userId?: string }): Promise<void> {
		const check = await this.checkRepository.findById(params.checkId, params.userId);
		if (!check) {
			throw new Error('チェック結果が見つかりません');
		}

		let updated = check;
		for (const section of check.sections) {
			const issue = section.issues.find((i) => i.id === params.issueId);
			if (issue) {
				const toggledIssue = issue.toggleResolved();
				const updatedIssues = section.issues.map((i) =>
					i.id === params.issueId ? toggledIssue : i,
				);
				const updatedSection = section.markCompleted(updatedIssues);
				updated = updated.updateSection(updatedSection);
				break;
			}
		}

		await this.checkRepository.save(updated);
	}
}
