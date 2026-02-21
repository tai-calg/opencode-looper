# 20260222_0126 OpenAIEmbeddingGateway スタブモード実装

## タスク ID
fix-openai-embedding-gateway-stub-mode

## 内容
E2E テスト checks.spec.ts の '/checks/new → /checks/[id] フロー' が `401 Incorrect API key provided: dummy` で失敗する問題を修正。

## 変更ファイル
- `apps/content-reviewer/src/backend/contexts/shared/infrastructure/ai/openai-embedding.gateway.ts`
  - `isStubMode()` 関数を追加（`OPENAI_API_KEY` が未設定・'dummy'・'test'・'undefined' の場合にスタブモード）
  - スタブモード時は `generateEmbedding()` が `Array(1536).fill(0)` を返す
  - コンストラクタでスタブモード時は `client = null` に
- `apps/content-reviewer/src/backend/contexts/shared/infrastructure/ai/__tests__/openai-embedding.gateway.test.ts`
  - 既存テストをスタブモード OFF（`OPENAI_API_KEY = 'sk-real-api-key'`）のケースにリファクタ
  - スタブモード ON のテストケース 3 件を追加（未設定・dummy・test）

## 設計判断
- `AnthropicAIGateway` の `isStubMode()` 実装と同じパターンで統一
- 'dummy' も明示的にスタブ対象に追加（タスク要件）
- ゼロベクトル `Array(1536).fill(0)` でナレッジ整合性チェックが通るようにする

## 次タスクへの申し送り
- 特になし。checks.spec.ts の E2E フローテストが pass するはず
