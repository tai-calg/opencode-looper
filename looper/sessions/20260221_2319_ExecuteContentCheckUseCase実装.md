# ExecuteContentCheckUseCase 実装

## タスク ID
`execute-content-check-usecase`

## 作成・変更したファイル
- `apps/content-reviewer/src/backend/contexts/content-check/application/usecases/execute-content-check.usecase.ts` (新規作成)
- `apps/content-reviewer/test/unit/contexts/content-check/application/usecases/execute-content-check.usecase.test.ts` (新規作成)
- `package.json` (マージコンフリクト解消)
- `apps/content-reviewer/src/backend/contexts/auth/domain/models/user.model.ts` (コンフリクト解消)
- `apps/content-reviewer/src/backend/contexts/auth/domain/models/__tests__/user.model.test.ts` (コンフリクト解消)
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/actions/*.ts` (コンフリクト解消)
- `apps/content-reviewer/src/backend/contexts/expression-rule/presentation/loaders/*.ts` (コンフリクト解消)
- `apps/content-reviewer/src/backend/contexts/knowledge/presentation/actions/*.ts` (コンフリクト解消)
- `apps/content-reviewer/src/backend/contexts/knowledge/presentation/loaders/*.ts` (コンフリクト解消)
- `apps/content-reviewer/src/components/rules/*.tsx` (コンフリクト解消)
- `apps/content-reviewer/src/components/knowledge/*.tsx` (コンフリクト解消)

## 設計判断
- `node:crypto` の `randomUUID()` で各 ID を生成（UUID 依存ライブラリ不要）
- `userId` が未指定の場合はシステムデフォルト UUID（`000...000`）を使用
- ファクトチェックのみ `generateWithWebSearch`、他4種は `generate` を使用
- 5種チェックを各セグメントに対して `Promise.all` で並列実行（パフォーマンス最適化）
- JSON パース失敗時のフォールバック処理を実装（堅牢性）
- エラー時は `ContentCheck.fail()` → save → `onProgress('error')` → rethrow

## 詰まった点・解決方法
- 複数ファイルにマージコンフリクトが残っていた（前回セッションの未解決コンフリクト）
- HEAD 版（`000...001` UUID、`Dto` 命名、`Date` 型）を採用して統一
- Biome の lint/format エラーを `biome check --write` で自動修正

## 次のタスクへの申し送り
- ExecuteContentCheckUseCase が実装完了。Composition Root（`execute-content-check.composition.ts`）と presentation 層（action、SSE stream）の実装が次のステップ
- `ExpressionRuleDto` と `KnowledgeArticleDto` は `Date` 型で統一済み（一部コンポーネントは `new Date(article.createdAt)` で表示）
