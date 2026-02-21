# タスク: get-content-check-detail-usecase

## タスク内容
GetContentCheckDetailUseCase の実装（content-check context の application 層）

## 作成・変更したファイル

### 新規作成
- `apps/content-reviewer/src/backend/contexts/content-check/application/usecases/content-check-detail.dto.ts`
  - ContentCheckDetailDto / ContentSegmentDetailDto / CheckResultDetailDto / ContentCheckSummaryDto の型定義
- `apps/content-reviewer/src/backend/contexts/content-check/application/usecases/get-content-check-detail.usecase.ts`
  - GetContentCheckDetailUseCase クラス（ContentCheckRepository, ContentSegmentRepository, CheckResultRepository を DI）
  - execute(id) → ContentCheckDetailDto を返す。ID 不存在時は Error を throw
- `apps/content-reviewer/src/backend/contexts/content-check/application/usecases/__tests__/get-content-check-detail.usecase.test.ts`
  - 全 Repository をモック、9 テストケース（正常系・異常系）

### マージコンフリクト解消（既存のコンフリクト）
- `package.json`（ルート）
- `src/backend/contexts/auth/domain/models/user.model.ts`
- `src/backend/contexts/auth/domain/models/__tests__/user.model.test.ts`
- `src/backend/contexts/expression-rule/presentation/actions/` 配下
- `src/backend/contexts/knowledge/presentation/` 配下
- `src/components/rules/` 配下
- `src/components/knowledge/` 配下
- （全て HEAD を採用）

## 設計判断

- **DTOの `source` フィールドを省略**: 既存の `ContentCheck` ドメインモデルには `source` フィールドがなく（DB には存在するが infrastructure 層のみで扱われる）、DTO に含めると型安全に取得できないため省略した。代わりに `originalText`（= `ContentCheck.content`）と `status`, `createdAt` をマッピング。
- **segmentIndex でソート**: Repository は順序保証がないため、useCase 内でソートを実装。
- **結果のグループ化**: `findByContentCheckId` で全 CheckResult を一括取得し、segmentId でグループ化してから各セグメントに割り当てることで N+1 クエリを回避。
- **テスト配置**: vitest config が `src/**/__tests__/**/*.test.ts` を対象としているため、タスク指定に従いソースコード隣接 `__tests__/` に配置。

## 詰まった点・解決方法

- 既存コードに多数のマージコンフリクトがあり、`pnpm verify` が通らなかった。Python スクリプトで HEAD バージョンを採用して一括解消。
- ルートリポジトリの `package.json` にもコンフリクトが残っており、ビルドが失敗した。同様に解消。

## 次のタスクへの申し送り

- `ContentCheck` ドメインモデルに `source` フィールドがない（DB テーブルには存在）。設計ドキュメントと実装の乖離あり。
- 既存のマージコンフリクトは全て HEAD バージョンで解消済み。
