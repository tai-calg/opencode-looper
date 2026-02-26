## セッションログ

- **タスク ID**: check-crud-usecases
- **内容**: Milestone 4 ステップ D — GetCheckDetail / ListChecks / ResolveIssue / RetryCheck / DeleteCheck UseCase + Unit テスト

### 作成ファイル
1. `apps/webapp/src/backend/contexts/content-check/application/usecases/get-check-detail.usecase.ts`
2. `apps/webapp/src/backend/contexts/content-check/application/usecases/list-checks.usecase.ts`
3. `apps/webapp/src/backend/contexts/content-check/application/usecases/resolve-issue.usecase.ts`
4. `apps/webapp/src/backend/contexts/content-check/application/usecases/retry-check.usecase.ts`
5. `apps/webapp/src/backend/contexts/content-check/application/usecases/delete-check.usecase.ts`
6. `apps/webapp/test/unit/contexts/content-check/application/usecases/crud-usecases.test.ts`

### 設計判断
- 設計ドキュメントのシグネチャに完全準拠。UseCase は CheckRepository のみに依存する薄い application 層
- ResolveIssueUseCase は集約ルート(Check)経由で Issue を更新するパターン
- RetryCheckUseCase はセクション状態リセットのみ（再チェック実行は RunCheckUseCase で行う設計）

### 詰まった点
- biome の import ソート順が設計ドキュメントと異なったため修正

### 次のタスクへの申し送り
- ステップ E（check-infrastructure）で PrismaCheckRepository を実装する際、これらの UseCase が依存する CheckRepository インターフェースは既に定義済み
