
# Looper（OpenCode版）

OpenCode エージェントによる自律的並列開発エンジン。

3 エージェント（Planner → Builder → Verifier）が Milestone × Wave 構造でアプリケーションを構築する。判断は全て LLM。シェルスクリプトは worktree 作成とプロセス起動のみ。

---

## 使い方

### 0. 初期化（AGENTS.md）

プロジェクトルートで OpenCode を起動し、`/init` を実行して `AGENTS.md` を生成・更新する。

- `AGENTS.md` はプロジェクト規約（ルール）としてエージェントが参照する
- 既に `AGENTS.md` がある場合、`/init` は追記・更新を試みる

### 1. タスクを一括で投入する（VIBE.md）

「わんこそば」的にタスクを投げたい場合は、プロジェクト直下の `VIBE.md` にタスクを箇条書きでリストアップし、OpenCode で `/vibe` コマンドを実行する。

```

/vibe

```

これにより大小のタスクが自動分類され、`milestones.json` と仕様書（設計ドキュメント）が一気に生成される。

### 2. 個別に設計ドキュメントを作成する（従来フロー）

OpenCode のカスタムコマンド `/plan` を実行し、作りたいものを伝える。

```

/plan 以下のアプリケーションの設計を行って。...（要件を記述）

```

出力は `docs/tasks/` に保存される。

補足（非対話で叩きたい場合）:

```

opencode run --command plan "以下のアプリケーションの設計を行って。...（要件を記述）"

```

### 3. 個別の Milestone を生成する（従来フロー）

`/gen-milestones` コマンドに設計ドキュメントを渡し、`looper/milestones.json` を生成する。

```

/gen-milestones docs/tasks/設計ドキュメント.md

```

補足（非対話）:

```

opencode run --command gen-milestones "docs/tasks/設計ドキュメント.md"

````

### 4. ループを実行する

```bash
bash looper/run.sh              # 実行
bash looper/run.sh --dry-run    # 実行計画の確認のみ
````

### 5. 監視する

```bash
watch -n3 bash looper/monitor.sh          # 簡易表示（3 秒更新）
watch -n3 bash looper/monitor.sh -v       # 詳細表示（TODO 進捗・ツール使用状況・エラー）
bash looper/monitor.sh 30                 # 直近 30 分のログのみ（デフォルト 10 分）
```

---

## 動作原理

### 3 エージェント分業

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

| エージェント       | 責務                                                               | 制約                                     |
| ------------ | ---------------------------------------------------------------- | -------------------------------------- |
| **Planner**  | Milestone のゴールから設計ドキュメントを作成し、タスクを Wave 構造で設計                     | コードは一切書かない                             |
| **Builder**  | 1 タスク = 1 セッションで実装。worktree 内で隔離実行                               | 割り当てタスクのみ。他タスクに手を出さない                  |
| **Verifier** | Builder ブランチを直列マージし品質検証。軽微な修正は自分で行い、設計変更は fix タスクとして Builder に委任 | ドメインモデル・UseCase・Repository のロジックは変更しない |

### Milestone × Wave による依存制御

* **Milestone**: 「1 つの機能が動く」単位。直列に進む（M1 完了 → M2 開始）
* **Wave**: Milestone 内の依存順序。同 Wave のタスクは Git worktree で並列実行される
* **契約先行パターン**: W1 で interface / 型定義 → W2 以降で並列実装 → 最終 Wave で統合・テスト

### 検証の 2 段階

| コマンド               | 実行者                         | 内容                                                     | DB 必要              |
| ------------------ | --------------------------- | ------------------------------------------------------ | ------------------ |
| `pnpm verify`      | Builder / Verifier（中間 Wave） | lint → prisma generate → typecheck → build → unit test | No                 |
| `pnpm verify:full` | Verifier（Milestone 完了時）     | `pnpm verify` + Playwright E2E テスト                     | Yes（ローカル Supabase） |

Builder は worktree 上で動くため DB に接続できない。`pnpm verify` でセルフチェックする。Verifier は中間 Wave では `pnpm verify`（マージ後の型整合性チェック）のみ実行し、Milestone の全タスクが完了した最終検証でのみ `pnpm verify:full`（E2E 含む）を実行する。

### ループ構造

```
Milestone N
│
├─ Planner (tasks == 0 の場合のみ)
│   └─ 設計ドキュメント作成 + milestones.json にタスク追加
│
└─ Wave ループ
    │
    ├─ Wave 1 (契約: interface / 型定義)
    │   ├─ Builder A ─── worktree/task-a ─── pnpm verify ─── commit
    │   └─ Builder B ─── worktree/task-b ─── pnpm verify ─── commit
    │        ↓
    │   Verifier
    │   ├─ 直列マージ + worktree 削除
    │   ├─ pnpm verify（中間 Wave は E2E なし）
    │   └─ 結果判定
    │       ├─ 全 pass → 次の Wave へ
    │       ├─ 軽微な失敗 → 自分で修正して再検証（最大 3 回）
    │       └─ 設計問題 → fix タスク追加 → Wave ループ再開
    │
    ├─ Wave 2 (並列実装: 最大 8 並列)
    │   ├─ Builder C ─── worktree/task-c
    │   ├─ Builder D ─── worktree/task-d
    │   └─ ...
    │        ↓
    │   Verifier（同上）
    │
    └─ Wave N (統合・テスト)
        └─ ...
             ↓
        Verifier → 全タスク done → pnpm verify:full（E2E 含む）
             ↓
        UI 動作確認（Playwright MCP） ← Milestone 完了時のみ
             ↓
        Milestone done + MP4 録画

Milestone N+1 へ
```

### Verifier の修正権限

```
検証失敗
│
├─ 軽微な問題 → Verifier が自分で修正（最大 3 回）
│   ├─ テストコード全般: セレクタ修正、アサーション修正、テスト手法変更
│   ├─ 型エラー: import 追加、型アノテーション修正、as キャスト
│   ├─ lint エラー: 未使用変数削除、typo 修正
│   └─ 設定: tsconfig / biome / playwright.config の修正
│   （条件: 3 ファイル以内、ビジネスロジック変更なし）
│
└─ 設計・ロジックの問題 → fix タスクを追加して Builder に委任
    ├─ ドメインモデル / UseCase / Repository の変更
    ├─ 複数レイヤーにまたがる修正
    ├─ 新規ファイル・コンポーネントの作成
    └─ 環境・インフラ構築
```

---

## ファイル構成

```
looper/
├── run.sh              # オーケストレーション（worktree 作成・プロセス起動・待機）
├── monitor.sh          # Builder セッションのリアルタイム監視
└── prompts/
    ├── planner.md      # Planner エージェントプロンプト（テンプレ）
    ├── builder.md      # Builder エージェントプロンプト（テンプレ）
    └── verifier.md     # Verifier エージェントプロンプト（テンプレ）
```

実行時に生成されるファイル（gitignore）:

```
looper/
├── milestones.json     # Milestone / Task の定義と進捗（/gen-milestones で生成）
├── sessions/           # Builder のセッションログ
└── output/             # Verifier が保存する UI 動作確認の MP4 録画
```

### プロジェクト全体での役割分担

| looper/ 内（汎用フレームワーク）           | プロジェクトルート（アプリ固有）                                                    |
| ------------------------------ | ------------------------------------------------------------------- |
| `prompts/` — エージェントの行動規範（テンプレ） | `AGENTS.md` — プロジェクト固有の規約（OpenCode ルール）                             |
| `run.sh` / `monitor.sh` — 実行基盤 | `docs/` — 設計規約（DDD・フロントエンド・インフラ・品質）                                 |
|                                | `docs/tasks/` — 設計ドキュメント（Planner が生成）                               |
|                                | `.opencode/commands/` — カスタムコマンド（`/plan`, `/gen-milestones`, `/pr`） |
|                                | `opencode.jsonc` — OpenCode 設定（権限・エージェント・コマンド定義など）                  |
|                                | `milestones.json` の中身（Milestone / Goal / Task）                      |

エージェントは両方を読む。`docs/` がフレームワークのルール、`AGENTS.md` がアプリ固有のコンテキストを提供する。

---

## milestones.json スキーマ

```json
{
  "source": "docs/tasks/YYYYMMDD_HHMM_設計ドキュメント名.md",
  "milestones": [
    {
      "milestone": 1,
      "goal": "検証可能なゴール記述",
      "verification": "ゴール達成を検証するコマンド",
      "done": false,
      "tasks": []
    }
  ]
}
```

| フィールド    | 説明                            |
| -------- | ----------------------------- |
| `source` | 元の設計ドキュメントのパス。Planner が毎回参照する |

tasks は Planner が自動生成する:

```json
{"id": "kebab-case-id", "description": "具体的な実装内容", "wave": 1, "done": false}
```

---

## 環境変数

| 変数                      | デフォルト                  | 説明                     |
| ----------------------- | ---------------------- | ---------------------- |
| `RALPH_WORKTREE_BASE`   | `/tmp/ralph-worktrees` | worktree 作成先           |
| `RALPH_LOG_DIR`         | `/tmp/ralph-logs`      | ログ出力先                  |
| `MAX_PARALLEL`          | `8`                    | 同時実行 Builder 数上限       |
| `MAX_ROUNDS`            | `50`                   | Wave ラウンド上限            |
| `RALPH_SESSION_TIMEOUT` | `1800`                 | 各エージェントセッションのタイムアウト（秒） |

---

## プロンプトのカスタマイズ

`looper/prompts/` 配下のテンプレートを編集する。プレースホルダー:

| プレースホルダー         | 展開先              | 使用プロンプト           |
| ---------------- | ---------------- | ----------------- |
| `__MILESTONE__`  | 現在の Milestone 番号 | planner, verifier |
| `__GOAL__`       | Milestone のゴール   | planner           |
| `__SOURCE_DOC__` | 元の設計ドキュメントのパス    | planner           |
| `__TASK_ID__`    | タスク ID           | builder           |
| `__TASK_DESC__`  | タスク description  | builder           |
| `__PLAN_DOC__`   | 設計ドキュメントのパス      | builder           |
| `__BRANCHES__`   | マージ対象ブランチ一覧      | verifier          |

---

## 前提

* OpenCode（TUI/CLI）
* jq
* Git
* Playwright MCP（任意 — Milestone 完了時の UI 動作確認・録画に使用）
* ffmpeg（任意 — UI 録画の webm → MP4 変換に使用）

---

## 注意事項

* OpenCode は `opencode.json(c)` の `permission` 設定で、編集・コマンド実行などの承認（allow/ask/deny）を制御する
* macOS のスリープで API 接続が切れてタイムアウトする場合があるので、`caffeinate` などで回避する
* 利用する LLM プロバイダ／モデルに応じて API 利用料が発生する

```

OpenCodeに関する差分の根拠（この README が依存してる仕様）：
- `/init` で `AGENTS.md` を生成・更新する
- カスタムコマンド（TUI の `/my-command`、`commands/` ディレクトリ、config の `command` 定義）
- CLI で `--command` / `--agent` を指定して実行できる
- `.opencode` 配下に `commands/`, `agents/` などを置ける（標準構造）
- `permission` は allow/ask/deny、`tools` の扱い（permission への統合）
- 設定ファイルは JSON/JSONC をサポート
- MCP server を追加して外部ツールを使える
```
