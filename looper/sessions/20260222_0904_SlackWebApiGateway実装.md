# SlackWebApiGateway 実装

## タスク ID
`slack-web-api-gateway`

## 内容
Slack Web API を使ったメッセージ投稿の Gateway 実装。

## 作成・変更したファイル
1. `apps/content-reviewer/package.json` — `@slack/web-api: ^7.0.0` を dependencies に追加
2. `apps/content-reviewer/src/backend/contexts/content-check/infrastructure/slack-web-api.gateway.ts` — 新規作成
3. `apps/content-reviewer/test/unit/contexts/content-check/infrastructure/slack-web-api.gateway.test.ts` — 新規作成

## 設計判断
- スタブモード判定は `''`, `'dummy'`, `'test'` をまとめた定数配列で管理。`undefined` も含め `isStubMode()` ヘルパーで統一
- スタブモードでは `WebClient` を `undefined` トークンで初期化してインスタンスは持つが API は呼ばない設計（型の一貫性を保つため）
- ログは `console.log` のみ（本番ロガー未整備のため既存コードと合わせた）

## 詰まった点・解決方法
- biome の `noDelete` 規則: `delete process.env.X` → `process.env.X = undefined` に変更
- biome の `organizeImports`: `afterEach, beforeEach` のアルファベット順 import に修正

## 次のタスクへの申し送り
- `SlackWebApiGateway` は Composition Root（`content-check.composition.ts`）から注入する必要がある
- `SLACK_BOT_TOKEN` 環境変数を `.env.local` に追加すること
- integration テストは実トークンが必要なため未作成（`INTEGRATION_TEST=true` ガードで追加可能）
