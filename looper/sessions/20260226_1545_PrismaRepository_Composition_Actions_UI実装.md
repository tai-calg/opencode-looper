# Milestone 2 ステップ B: Prisma Repository + Composition + Loader + Actions + UI

- **タスク ID**: rule-infrastructure-and-ui
- **内容**: Prisma Repository 実装 + Composition Root + Loader + Server Actions + RuleDialog + RulesTable + ページ更新

## 作成・変更したファイル

- `apps/webapp/src/backend/contexts/source-management/infrastructure/repositories/prisma-expression-rule.repository.ts` — Prisma による ExpressionRuleRepository 実装（upsert で save 統一）
- `apps/webapp/src/backend/contexts/source-management/presentation/composition/source-management.composition.ts` — 5 UseCase のファクトリ関数
- `apps/webapp/src/backend/contexts/source-management/presentation/loaders/rule-list.loader.ts` — BFF パターンの Loader（ドメインモデル→plain object 変換）
- `apps/webapp/src/backend/contexts/source-management/presentation/actions/create-rule.action.ts` — Server Action（作成）
- `apps/webapp/src/backend/contexts/source-management/presentation/actions/update-rule.action.ts` — Server Action（更新）
- `apps/webapp/src/backend/contexts/source-management/presentation/actions/delete-rule.action.ts` — Server Action（削除）
- `apps/webapp/src/backend/contexts/source-management/presentation/actions/toggle-rule.action.ts` — Server Action（有効/無効切替）
- `apps/webapp/src/frontend/components/rule-dialog.tsx` — 汎用追加/編集ダイアログ（Client Component）
- `apps/webapp/src/frontend/components/rules-table.tsx` — テーブル表示 + Switch + 編集/削除（Client Component）
- `apps/webapp/src/app/(auth)/rules/page.tsx` — Server Component として loadRuleList() → RulesTable/RuleDialog に props 渡し

## 設計判断

- 設計ドキュメントの型定義・シグネチャに厳密に従った
- 全 Server Action は try-catch + `{ success, error }` 形式で統一、revalidatePath で Server Component 再検証
- RuleDialog は onSubmit コールバックで追加/編集を切り替える汎用設計

## 次のタスクへの申し送り

- Milestone 2 の全ステップ（A + B）が完了。マージ可能な状態
- `pnpm verify` 全パス（lint, typecheck, build, 30 tests）
