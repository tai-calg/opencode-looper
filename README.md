# claude-looper

Claude Code による自律開発ループ。3 エージェント（計画→並列実装→検証）が Milestone 単位で開発を進めます。

ブログ記事の補足資料として公開しています。汎用ライブラリではありません。自分のプロジェクトに合わせて自由に改変してください。

## 仕組み

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Planner  │────▶│ Builder  │────▶│ Verifier │
│ タスク設計 │     │ 並列実装  │     │ マージ検証 │
└──────────┘     └──────────┘     └──────────┘
                       │                │
                       │          失敗時 fix タスク追加
                       │                │
                       ◀────────────────┘
```

| エージェント | 役割 |
|---|---|
| **Planner** | Milestone のゴールを Wave 構造のタスクに分解する。コードは書かない |
| **Builder** | 1 タスク = 1 セッション。Git worktree で隔離して最大 8 並列で実行 |
| **Verifier** | ブランチを直列マージし品質検証。失敗時は fix タスクを生成してリトライ |

スクリプト（bash）が担うのは worktree 作成とプロセス起動だけ。判断は全てエージェントが行います。

動作原理の詳細は [looper/README.md](looper/README.md) を参照。

## 使い方

### 1. 設計ドキュメントを作成する

Claude Code で `/plan` コマンドを実行し、作りたいものを伝えます。

```
/plan 以下のアプリケーションの設計を行って。...（要件を記述）
```

入力例は [initial_prompt_sample.md](initial_prompt_sample.md) を参照。出力は `docs/tasks/` に保存されます。

### 2. Milestone を生成する

`/gen-milestones` コマンドに設計ドキュメントを渡し、`looper/milestones.json` を生成します。

```
/gen-milestones docs/tasks/設計ドキュメント.md
```

### 3. ループを実行する

```bash
bash looper/run.sh

# ドライラン（実行計画の確認のみ）
bash looper/run.sh --dry-run

# 別ターミナルで監視
watch -n3 bash looper/monitor.sh
```

## 前提

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)
- jq
- Git
- [Playwright MCP](https://github.com/anthropics/playwright-mcp)（任意 — UI 動作確認・録画に使用）

## ファイル構成

```
looper/                     # 開発ループエンジン（詳細は looper/README.md）
├── run.sh                  #   オーケストレーション
├── monitor.sh              #   リアルタイム監視
└── prompts/                #   エージェントプロンプト

docs/                       # 設計規約（エージェントが毎セッション読む）
├── architecture.md         #   DDD 4層・依存ルール・命名規約
├── frontend.md             #   フロントエンド規約
├── infrastructure.md       #   インフラ規約
└── quality.md              #   品質規約

.claude/commands/           # Claude Code スラッシュコマンド
├── plan.md                 #   /plan — 設計ドキュメント作成
├── gen-milestones.md       #   /gen-milestones — Milestone 生成
└── pr.md                   #   /pr — フィーチャーブランチ作成・PR
```

## 想定技術スタック

同梱の `docs/` やプロンプトは以下のスタックを前提に書かれています:

- TypeScript / Next.js App Router
- Supabase（PostgreSQL + Auth）
- Prisma
- pnpm workspace（monorepo）
- Biome / Vitest / Playwright

ループエンジン自体（`looper/run.sh`）は言語やフレームワークに依存しません。`docs/`・`prompts/`・`CLAUDE.md` を書き換えれば、どのような言語・フレームワークでも動作するはずです。

## カスタマイズ

このリポジトリをフォークして以下を自分のプロジェクトに合わせてください:

- **`docs/`** — 設計規約。エージェントが毎セッション読むルールブック
- **`looper/prompts/`** — エージェントプロンプト。検証コマンド（`pnpm verify` 等）やコミットメッセージ規約など
- **`CLAUDE.md`** — プロジェクト固有のコーディング規約

## 注意事項

- エージェントは `--dangerously-skip-permissions` で動作します。信頼できる環境でのみ実行してください
- Claude Code の API 利用料が発生します

## License

MIT
