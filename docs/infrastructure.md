# Infrastructure Rules

pnpm workspace + Vercel + Supabase によるインフラ規約。

---

## monorepo 構成

pnpm workspace で管理。`apps/` 配下にアプリを配置する。将来のマルチサービス化を見据えた構成。

```
project-root/
├── apps/{app}/          # Next.js App Router アプリ
├── pnpm-workspace.yaml
├── biome.json           # 共有 lint/format 設定
└── package.json         # workspace scripts (lint, typecheck, test, build)
```

---

## デプロイ

| 環境 | トリガー | プラットフォーム |
|---|---|---|
| Preview | PR 作成 / 更新 | Vercel（自動生成、PR ごとに一意の URL） |
| Production | main ブランチへの push | Vercel（自動デプロイ） |

### Vercel 設定

- Framework Preset: Next.js
- Root Directory: `apps/{app}`
- Install Command: `pnpm install --frozen-lockfile`
- Fluid Compute 対応（長時間実行の Server Actions / API Routes に `maxDuration` 設定）

---

## データベース

- **Supabase** PostgreSQL + pgvector（ベクトル検索用）
- **Prisma** でスキーマ管理。`prisma/schema.prisma` をソース・オブ・トゥルースとする
- 環境ごとに Supabase プロジェクトを分離（dev / prod）
- ORM 型 ↔ ドメインモデル変換は infrastructure 層が担当（`architecture.md` 参照）

### ローカル開発環境

開発中は **Supabase CLI によるローカル Supabase** を使用する。クラウドの Supabase は使わない。

```bash
supabase start          # ローカル Supabase 起動（Docker）
prisma db push          # スキーマをローカル DB に反映
```

`supabase start` で起動すると、接続情報（DB URL, API URL, anon key 等）が表示される。これを `apps/{app}/.env.local` に設定する。

---

## 外部 API 依存の扱い

外部 API（LLM、Embedding、Slack 等）に依存する Gateway は、**必ず Stub 実装を用意する。**

### ルール

1. **Gateway interface に対して、本番実装と Stub 実装の 2 つを作る**
   - 本番: `OpenAIEmbeddingGateway`, `AnthropicAIGateway`, `SlackWebApiGateway`
   - Stub: `StubEmbeddingGateway`, `StubAIGateway`, `StubSlackGateway`
2. **Composition Root（`composition.ts`）で環境変数に応じて注入先を切り替える**
   - 環境変数が設定済み → 本番実装を注入
   - 環境変数が未設定 / `dummy` / `test` → Stub 実装を注入
3. **Stub 実装はテスト可能な固定値を返す**（空配列やダミー JSON ではなく、下流の処理が正常に完了する値）

### テスト時の依存先の使い分け

|  | DB（Repository） | 外部 API（LLM / Embedding / Slack 等） |
|---|---|---|
| E2E テスト（`e2e/*.spec.ts`） | **本物**（ローカル Supabase） | **Stub**（再現性・CI 安定性優先） |
| アドホック動作確認（Playwright MCP） | **本物** | **キーがあれば本物、なければ Stub** |

E2E テスト実行時は、外部 API キーの環境変数を設定しない（または `.env.test` で空にする）ことで Stub が注入される。DB は常にローカル Supabase に接続する。

### 環境変数の配置

| ファイル | 内容 | Git 管理 |
|---|---|---|
| `apps/{app}/.env.local` | Supabase 接続情報 + API キー（開発者ごと） | `.gitignore` |
| `apps/{app}/.env.test` | E2E テスト用（外部 API キーなし → Stub 動作） | コミット可 |

> **注意:** Next.js は `apps/{app}/` をルートとして `.env.local` を読む。プロジェクトルートの `.env` は Next.js からは参照されない。

---

## 認証

- **Supabase Auth** による OAuth 2.0
- Next.js middleware で未認証時リダイレクト
- ドメイン制限はプロジェクト固有設定で定義

---

## CI/CD

GitHub Actions: `pnpm install` → `lint` → `typecheck` → `test`

全パスで PR マージ可能 → main merge で Vercel 自動デプロイ。

---

## セキュリティ

- `.env` / シークレットは **Vercel 環境変数で管理。コミット厳禁**
- サービスロールキーはサーバーサイドのみ使用（`NEXT_PUBLIC_` prefix を付けない）
- `NEXT_PUBLIC_` 付き変数はクライアントに露出することを意識する
