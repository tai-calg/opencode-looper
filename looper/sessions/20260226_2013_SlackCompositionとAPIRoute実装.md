# Slack Composition 更新 + API Route 実装

- **タスク ID**: slack-presentation
- **内容**: Milestone-6 ステップ D — Composition に Slack DI を追加し、Slack Events API の Webhook 受信 API Route を作成

## 作成・変更したファイル

- `apps/webapp/src/backend/contexts/content-check/presentation/composition/content-check.composition.ts`（編集）: `createSlackGateway()` と `createHandleSlackMentionUseCase()` を追加
- `apps/webapp/src/app/api/slack/events/route.ts`（新規）: Slack Events API の Webhook 受信エンドポイント

## 設計判断

- Composition のファクトリ関数は既存パターン（`createRunCheckUseCase` 等）に合わせた。`SLACK_BOT_TOKEN` の有無で本番/Stub を切り替え
- API Route は `after()` を使い Slack に即座に 200 応答後、バックグラウンドでチェック処理を実行。`maxDuration = 300` で AI 処理に十分な時間を確保
- 署名検証は `node:crypto` の `createHmac` + `timingSafeEqual` で実装。リプレイ攻撃防止（5分）も含む
- Slack Event 型定義は route.ts 内にローカル定義（外部パッケージ不使用）

## 次のタスクへの申し送り

- Milestone 6 の全ステップ（A〜D）が完了。Verifier によるマージが可能な状態
- 本番利用時は `SLACK_BOT_TOKEN` と `SLACK_SIGNING_SECRET` の環境変数設定が必要
