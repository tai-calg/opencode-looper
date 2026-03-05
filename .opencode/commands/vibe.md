---
allowed-tools: Bash(TZ=Asia/Tokyo date:*), Write, Read, Glob, Grep
description: VIBE.md からタスクを読み取り、規模に応じて適切なマイルストーンを生成する (project)
---

## やること

あなたはプロジェクトの Milestone 設計者およびタスクルーターです。
ルートディレクトリにある `VIBE.md` （ユーザーが事前に追加・編集したタスクの箇条書きリスト）を読み取り、タスクの規模（大・小）を自動判定して、適切なマイルストーンとして `looper/milestones.json` に登録します。

### 手順

1. **タスクの読み込みと分類**:
   ルートディレクトリの `VIBE.md` を読み込みます。タスク群の意図を汲み取り、以下の基準で「大（慎重な設計要）」と「小（直感的に即実装可）」に分類してください。
   - **大**: 要件整理・アーキテクチャ設計が必要なもの。新しいドメイン概念の追加、DBスキーマの大きな変更、外部APIの新規組み込みなど。
   - **小**: 設計が自明または不要なもの。UIの微細な変更、単一機能（関数・メソッド）の追加、文言修正など、バイブコーディング的に直感で実装できるもの。

2. **既存情報の調査**:
   必要に応じて `docs/` 配下の規約（`architecture.md`, `frontend.md`, `infrastructure.md`, `quality.md`）や `AGENTS.md` を読み、既存コードと実装方針の整合性を考慮してください。既存の `looper/milestones.json` があれば読み込み、必要に応じて `/gen-milestones` と同様に元のファイルをアーカイブ（リネーム）してください（例: `looper/milestones.$(date +%Y%m%d_%H%M%S).json`）。

3. **大タスクの処理**:
   大タスク（あるいはその集合）ごとに、`/plan` コマンド相当の処理を行い、詳細な設計ドキュメントを作成します。
   - 作成先: `docs/tasks/YYYYMMDD_HHMM_vibe_plan_{概要}.md`
   - フォーマットは `/plan` コマンドで作成される設計ドキュメントの形式に準ずる。
   - `milestones.json` の `milestones` 配列に、このタスク群を表すマイルストーンを追加します。その際、`tasks` は空配列 (`[]`) にしてください（`looper/run.sh` 実行時に `Planner` が詳細設計・タスク分割を行います）。 `plan_doc` には作成した設計ドキュメントのパスを指定します。

4. **小タスクの処理**:
   小タスクは、まとめて1つの「軽量版仕様書（設計ドキュメント）」を作成し、即座に実装可能な状態にします。
   - 作成先: `docs/tasks/YYYYMMDD_HHMM_vibe_tasks.md`
   - 軽量版仕様書には、変更対象のファイルと実装方針を端的に明記します。「opencode-looperの設計思想に準拠し、実装前に仕様書を提案する」ことが目的です。
   - `milestones.json` に新しいマイルストーンを追加し、`plan_doc` に上記の軽量版仕様書のパスを指定します。
   - このマイルストーンの `tasks` 配列には、小タスク群を以下のようなタスクオブジェクトとして **直接埋め込んでください**。
     `{"id": "kebab-case-id", "description": "具体的な実装内容", "wave": 1, "done": false}`
   - *（これにより、次回ループ実行時にPlannerを経由せず、Builderが当該タスクの実装に直行します）*

5. **`milestones.json` の出力・コミット**:
   結果として単一の `looper/milestones.json` ファイルを生成・上書きし、アーカイブしたものと合わせてコミットします。
   ```bash
   git add looper/milestones*.json docs/tasks/*vibe*.md && git commit -m "chore: routing vibe tasks from VIBE.md"
   ```

6. **完了とレビュー依頼**:
   軽量版仕様書（および該当する場合は通常仕様書）、更新された `milestones.json` のパスをユーザーに提示し、「仕様書を作成しました。内容とルーティングに問題がなければ、実装（ループ実行）に進めてください。」とレビューを依頼してください。**ユーザーの許可なく勝手に実装フェーズ（`Builder`操作など）には進まないでください。**
