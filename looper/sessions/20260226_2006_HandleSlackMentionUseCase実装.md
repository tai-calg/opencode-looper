# HandleSlackMentionUseCase + Unit テスト実装

- **タスク ID**: slack-usecase
- **内容**: Milestone 6 ステップ C — HandleSlackMentionUseCase と Unit テスト

## 作成したファイル

- `apps/webapp/src/backend/contexts/content-check/application/usecases/handle-slack-mention.usecase.ts`
- `apps/webapp/test/unit/contexts/content-check/application/usecases/handle-slack-mention.test.ts`

## 設計判断

- 設計ドキュメントのシグネチャ・フローに忠実に実装。RunCheckUseCase を DI で受け取り、再構成しない
- formatSummary は Check.sections → issues の flatMap で集計。カテゴリ・重要度は文字列比較で集計
- テストでは Check.reconstruct / CheckSection.reconstruct / CheckIssue.reconstruct を使ってテスト用オブジェクトを構築

## 詰まった点

- vitest が ESM 互換エラー (ERR_REQUIRE_ESM) で起動不可 → 既存の環境問題（main repo でも同様）。lint / typecheck / build は全て通過

## 次のタスクへの申し送り

- ステップ D (slack-presentation) で composition に HandleSlackMentionUseCase の DI 登録と API Route 作成が必要
- vitest の ESM 問題は別途対応が必要（vite/vitest のバージョン互換性）
