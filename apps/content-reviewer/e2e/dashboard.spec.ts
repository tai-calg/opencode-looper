import { expect, test } from '@playwright/test';

/**
 * / ダッシュボードページの E2E テスト
 *
 * チェック履歴一覧・フィルタ UI・詳細ページ遷移を検証する。
 * 開発環境（NODE_ENV=development）では認証スキップが有効なため、
 * ログインなしで直接アクセスできる。
 */

test.describe('/ ダッシュボードページ', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('ページが表示される', async ({ page }) => {
		await expect(page).toHaveURL('/');
	});

	test('ページタイトル「チェック履歴」が表示される', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'チェック履歴' })).toBeVisible();
	});

	test('「新規チェック」ボタンが表示される', async ({ page }) => {
		await expect(page.getByRole('link', { name: '新規チェック' })).toBeVisible();
	});

	test('「新規チェック」ボタンが /checks/new へのリンクになっている', async ({ page }) => {
		const link = page.getByRole('link', { name: '新規チェック' });
		await expect(link).toHaveAttribute('href', '/checks/new');
	});

	test('チェック履歴テーブルまたは「チェック履歴がありません」が表示される', async ({ page }) => {
		const table = page.getByRole('table');
		const emptyMessage = page.getByText('チェック履歴がありません');
		const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);
		const hasEmpty = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
		expect(hasTable || hasEmpty).toBe(true);
	});
});

test.describe('/ フィルタ UI', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('ソース種別フィルタが表示される', async ({ page }) => {
		await expect(page.getByLabel('ソース種別')).toBeVisible();
	});

	test('ステータスフィルタが表示される', async ({ page }) => {
		await expect(page.getByLabel('ステータス')).toBeVisible();
	});

	test('ソース種別フィルタを変更すると URL に source パラメータが追加される', async ({ page }) => {
		// ソース種別セレクトを操作
		const sourceTrigger = page.getByLabel('ソース種別');
		await sourceTrigger.click();

		// Web オプションを選択
		const webOption = page.getByRole('option', { name: 'Web' });
		await webOption.click();

		// URL に source=web が追加される
		await expect(page).toHaveURL(/[?&]source=web/);
	});

	test('ステータスフィルタを変更すると URL に status パラメータが追加される', async ({ page }) => {
		const statusTrigger = page.getByLabel('ステータス');
		await statusTrigger.click();

		const completedOption = page.getByRole('option', { name: 'completed' });
		await completedOption.click();

		await expect(page).toHaveURL(/[?&]status=completed/);
	});

	test('フィルタを「全て」に戻すと URL パラメータが削除される', async ({ page }) => {
		// まず source=web にする
		await page.goto('/?source=web');
		await expect(page).toHaveURL(/source=web/);

		// ソース種別を「全て」に戻す
		const sourceTrigger = page.getByLabel('ソース種別');
		await sourceTrigger.click();
		const allOption = page.getByRole('option', { name: '全て' }).first();
		await allOption.click();

		// source パラメータが消える
		const url = page.url();
		expect(url).not.toMatch(/source=web/);
	});
});

test.describe('/ 行クリックで詳細ページへ遷移', () => {
	test('テーブルに行がある場合、詳細リンクをクリックすると /checks/[id] に遷移する', async ({
		page,
	}) => {
		await page.goto('/');

		const table = page.getByRole('table');
		const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);

		if (!hasTable) {
			// データがない場合はスキップ
			test.skip();
			return;
		}

		// 最初の行の詳細リンクをクリック
		const detailLink = page.getByRole('link', { name: '詳細' }).first();
		const hasDetailLink = await detailLink.isVisible({ timeout: 3000 }).catch(() => false);

		if (!hasDetailLink) {
			test.skip();
			return;
		}

		await detailLink.click();
		await expect(page).toHaveURL(/\/checks\/[a-zA-Z0-9-]+$/);
		await expect(page.getByRole('heading', { name: 'チェック結果詳細' })).toBeVisible();
	});
});

test.describe('/ 完全な E2E シナリオ（/checks/new → 完了 → 履歴確認）', () => {
	test('新規チェック実行後に / に戻るとチェック履歴に表示される', async ({ page }) => {
		test.setTimeout(120000);

		await page.goto('/checks/new');

		const textarea = page.getByRole('textbox').first();
		const hasTextarea = await textarea.isVisible({ timeout: 3000 }).catch(() => false);

		if (!hasTextarea) {
			test.skip();
			return;
		}

		await textarea.fill(
			'ダッシュボードE2Eテスト用コンテンツです。チェック履歴に表示されることを確認します。',
		);

		const submitButton = page.getByRole('button', { name: /送信|チェック|実行|開始/ });
		await submitButton.click();

		// 完了後 /checks/[id] にリダイレクトされる
		await page.waitForURL(/\/checks\/[a-zA-Z0-9-]+$/, { timeout: 90000 });

		// 詳細ページが表示されることを確認
		await expect(page.getByRole('heading', { name: 'チェック結果詳細' })).toBeVisible();

		// / に戻る
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'チェック履歴' })).toBeVisible();

		// テーブルが表示される（少なくとも 1 件以上あるはず）
		await expect(page.getByRole('table')).toBeVisible();
	});
});
