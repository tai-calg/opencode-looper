# 20260222_0321 — ListContentChecksUseCase 実装

## タスク ID と内容

`list-content-checks-usecase`: ContentCheck 一覧取得 UseCase を実装。各 ContentCheck の segmentCount と severity 別 summary を集計して ContentCheckListDto を返す。

## 作成・変更したファイル一覧

- **新規作成**
  - `apps/content-reviewer/src/backend/contexts/content-check/application/usecases/list-content-checks.usecase.ts`
    — `ListContentChecksUseCase` クラス。`findAll(filter)` → 各チェックに対して `findByContentCheckId` を `Promise.all` で並列取得 → `ContentCheckListDto` を組み立て返却
  - `apps/content-reviewer/test/unit/contexts/content-check/application/usecases/list-content-checks.usecase.test.ts`
    — ユニットテスト: フィルタなし一覧・source フィルタ・status フィルタの各ケース（7テスト）

- **修正**
  - `apps/content-reviewer/src/backend/contexts/content-check/domain/models/content-check.model.ts`
    — `CheckSource` 型追加、`ContentCheckProps` と `ContentCheck` クラスに `source: CheckSource` フィールド追加、`create()` に `source?: CheckSource` 引数追加（デフォルト `'web'`）
  - `apps/content-reviewer/src/backend/contexts/content-check/infrastructure/repositories/prisma-content-check.repository.ts`
    — `toDomain()` で `record.source` をドメインモデルにマッピング、`toPrisma()` で `contentCheck.source` を Prisma へ渡すよう修正
  - `apps/content-reviewer/test/unit/contexts/content-check/domain/models/content-check.model.test.ts`
    — `ContentCheck.reconstruct()` の全呼び出しに `source: 'web'` を追加
  - `apps/content-reviewer/test/unit/contexts/content-check/infrastructure/repositories/prisma-content-check.repository.test.ts`
    — `makeDomainContentCheck()` に `source: 'web'` 追加、`toHaveBeenCalledWith` の期待値に `source: 'web'` 追加
  - `apps/content-reviewer/src/backend/contexts/content-check/application/usecases/__tests__/get-content-check-detail.usecase.test.ts`
    — `buildContentCheck()` に `source: 'web'` 追加

## 設計判断

- `ContentCheckListItemDto` に `source: 'web' | 'slack'` が必要だが、ドメインモデル `ContentCheck` に `source` フィールドがなかった。Prisma スキーマにはあるが `toDomain()` でマッピングが抜けていた。最小限の変更としてドメインモデルへ `source` を追加し、既存テストも合わせて修正した。
- `source` のデフォルト値を `'web'` にすることで既存の `ContentCheck.create()` 呼び出し（`source` 未指定）は無破壊。

## 詰まった点・解決方法

- `biome` のフォーマット規約（long ternary は 1行に収める、import は複数行）を verify で検出し修正。

## 次のタスクへの申し送り

- `ListContentChecksUseCase` が完成したので、次はダッシュボード一覧ページの UI（loader/composition/page.tsx）を実装するタスクが続く予定。
- `ContentCheck.source` を追加したことで、E2E テストが依存する `execute-content-check.usecase.ts` の `ContentCheck.create()` 呼び出しは `source` 未指定のままで動作する（デフォルト `'web'`）。
