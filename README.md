# opencode-looper

OpenCode による自律開発ループ。3 エージェント（計画→並列実装→検証）が Milestone 単位で開発を進めます。

ブログ記事の補足資料として公開しています。汎用ライブラリではありません。自分のプロジェクトに合わせて自由に改変してください。

## このリポジトリの使い方 
このopencode-looper ディレクトリはlooper開発を利用したい各プロジェクトごとに、コピーをする必要があります。cp -aをすると.opencodeだけでなく.gitもコピーされてしまうため以下のコマンドでコピーしてください。
（package.jsonの中の"@opencode-ai/plugin": "1.2.10"は手動で追加してください。）

```
rsync -av --ignore-existing \
  --exclude='.git' \
  --exclude='README.md' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  opencode-looper/ ./copy_dest_project/
```

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

### 1. バイブコーディングでタスクを自動分類する（VIBE.md）

「わんこそば」的にタスクをどんどん投げたい場合は、プロジェクト直下の `VIBE.md` にやりたいことを箇条書きでメモし、OpenCodeシェル内 で `/vibe` コマンドを実行します。

```
// VIBE.md
* [prompt1]
* [prompt2]
* [prompt3]
```

```
/vibe
```

タスクの規模がLLMによって自動判定され、設計ドキュメントの生成や `looper/milestones.json` への登録までが一括で行われます（従来の `/plan` や `/gen-milestones` を包含したフローです）。

### 2. 個別設計ドキュメントを作成する（従来フロー）

OpenCodeシェル内 で `/plan` コマンドを実行し、作りたいものを伝えます。

```
/plan 以下のアプリケーションの設計を行って。...（要件を記述）
```

入力例は [initial_prompt_sample.md](initial_prompt_sample.md) を参照。出力は `docs/tasks/` に保存されます。

### 3. Milestone を生成する（従来フロー）

`/gen-milestones` コマンドに設計ドキュメントを渡し、`looper/milestones.json` を生成します。

```
/gen-milestones docs/tasks/設計ドキュメント.md
```

### 4. ループを実行する

```bash
bash looper/run.sh

# ドライラン（実行計画の確認のみ）
bash looper/run.sh --dry-run

# 別ターミナルで監視
watch -n3 bash looper/monitor.sh
```

## 前提

- OpenCode
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

.opencode/commands/                   # OpenCode スラッシュコマンド
├── plan.md                 #   /plan — 設計ドキュメント作成
├── gen-milestones.md       #   /gen-milestones — Milestone 生成
├── vibe.md                 #   /vibe — VIBE.md からタスクを自動ルーティング
└── pr.md                   #   /pr — フィーチャーブランチ作成・PR
```

## 想定技術スタック

同梱の `docs/` やプロンプトは以下のスタックを前提に書かれています:

- TypeScript / Next.js App Router
- Supabase（PostgreSQL + Auth）
- Prisma
- pnpm workspace（monorepo）
- Biome / Vitest / Playwright

ループエンジン自体（`looper/run.sh`）は言語やフレームワークに依存しません。`docs/`・`prompts/`・`AGENTS.md` などを書き換えれば、どのような言語・フレームワークでも動作するはずです。

## カスタマイズ

このリポジトリをフォークして以下を自分のプロジェクトに合わせてください:

- **`docs/`** — 設計規約。エージェントが毎セッション読むルールブック
- **`looper/prompts/`** — エージェントプロンプト。検証コマンド（`pnpm verify` 等）やコミットメッセージ規約など
- **`AGENTS.md`** — プロジェクト固有のコーディング規約

## 注意事項

- エージェントは `--dangerously-skip-permissions` で動作します。信頼できる環境でのみ実行してください
- OpenCode 実行時に LLM API の利用料が発生する場合があります

## License

MIT
