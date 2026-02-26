import { CheckIssue } from '@/backend/contexts/content-check/domain/models/check-issue.model';
import { CheckSection } from '@/backend/contexts/content-check/domain/models/check-section.model';
import { Check } from '@/backend/contexts/content-check/domain/models/check.model';
import { describe, expect, it } from 'vitest';

describe('Check', () => {
	describe('create', () => {
		it('有効なパラメータで作成できる', () => {
			const result = Check.create({
				content: 'テスト本文',
				source: 'web',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.content).toBe('テスト本文');
				expect(result.value.source).toBe('web');
				expect(result.value.status).toBe('processing');
				expect(result.value.sections).toHaveLength(0);
			}
		});

		it('本文が空の場合はエラー', () => {
			const result = Check.create({ content: '', source: 'web' });
			expect(result.success).toBe(false);
		});

		it('本文が30,000文字を超える場合はエラー', () => {
			const result = Check.create({ content: 'あ'.repeat(30001), source: 'web' });
			expect(result.success).toBe(false);
		});

		it('displayTitle は title が無い場合は本文先頭30字', () => {
			const result = Check.create({ content: 'あ'.repeat(50), source: 'web' });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.displayTitle).toBe('あ'.repeat(30));
			}
		});
	});

	describe('recalculateStatus', () => {
		it('全セクション完了で completed になる', () => {
			const result = Check.create({ content: 'テスト', source: 'web' });
			if (!result.success) return;
			const section = CheckSection.create({ sectionIndex: 0, content: 'セクション1' });
			const completed = section.markCompleted([]);
			const check = result.value.addSections([completed]).recalculateStatus();
			expect(check.status).toBe('completed');
		});

		it('失敗セクションがあり未処理がなければ failed になる', () => {
			const result = Check.create({ content: 'テスト', source: 'web' });
			if (!result.success) return;
			const s1 = CheckSection.create({ sectionIndex: 0, content: 'セクション1' }).markCompleted([]);
			const s2 = CheckSection.create({ sectionIndex: 1, content: 'セクション2' }).markFailed();
			const check = result.value.addSections([s1, s2]).recalculateStatus();
			expect(check.status).toBe('failed');
		});
	});
});

describe('CheckSection', () => {
	it('create で pending 状態になる', () => {
		const section = CheckSection.create({ sectionIndex: 0, content: 'テスト' });
		expect(section.status).toBe('pending');
		expect(section.issues).toHaveLength(0);
	});

	it('markCompleted で issues を持てる', () => {
		const section = CheckSection.create({ sectionIndex: 0, content: 'テスト' });
		const issue = CheckIssue.create({
			category: 'quality',
			severity: 'caution',
			quote: '引用',
			message: '指摘',
		});
		const completed = section.markCompleted([issue]);
		expect(completed.status).toBe('completed');
		expect(completed.issues).toHaveLength(1);
	});
});

describe('CheckIssue', () => {
	it('toggleResolved で解決状態を切り替える', () => {
		const issue = CheckIssue.create({
			category: 'risk',
			severity: 'needs_fix',
			quote: '引用テキスト',
			message: '問題があります',
			suggestion: '修正案',
		});
		expect(issue.resolved).toBe(false);
		const resolved = issue.toggleResolved();
		expect(resolved.resolved).toBe(true);
		expect(resolved.id).toBe(issue.id);
	});
});
