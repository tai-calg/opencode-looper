# SlackWebApiAdapter + StubSlackAdapter 実装

- **タスク ID**: slack-infrastructure
- **内容**: Milestone 6 ステップ B — SlackWebApiAdapter + StubSlackAdapter 実装

## 作成したファイル

- `apps/webapp/src/backend/contexts/content-check/infrastructure/adapters/slack-web-api.adapter.ts`（新規）
- `apps/webapp/src/backend/contexts/content-check/infrastructure/adapters/stub-slack.adapter.ts`（新規）

## 設計判断

- AnthropicAIAdapter / StubAIAdapter パターンに従い、コンストラクタ DI + fetch で Slack REST API を直接呼び出す構成
- ボットメッセージ除外は `bot_id` と `subtype === 'bot_message'` の両方で判定
- メンションパターン `<@U...>` は正規表現で除去し、空文字になったメッセージは結果から除外
- Slack API レスポンスの `ok: false` 時は具体的なエラーメッセージ付きで throw

## 次のタスクへの申し送り

- ステップ C（HandleSlackMentionUseCase）とステップ D（Composition + API Route）で本アダプタを利用する
- typecheck / test:unit の失敗はワークツリー環境の node_modules 不足による既存エラー（36件）。新規ファイルにエラーなし
