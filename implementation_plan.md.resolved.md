# Vibe Coding（バイブコーディング）タスクフローの実装計画

opencode-looperを用いたタスク投入スタイルを実現します。
大小様々なタスクの箇条書きを受け取り、タスクの規模（プランニングが必要か、小規模な実装で済むか）をLLMに自動判定させ、適切なマイルストーンとして [looper/milestones.json](file:///Users/taniguchitaichi/LifeManagement/opencode-looper/looper/milestones.json) に登録する新しいコマンドを作成します。

## プロセス概要

新しいOpenCodeコマンド `/vibe` を追加します。このコマンドはルートディレクトリにある [VIBE.md](file:///Users/taniguchitaichi/LifeManagement/opencode-looper/VIBE.md) （ユーザーが事前に追加・編集したタスクの箇条書きリスト）を読み取り、以下のルーティングを行います。

1. **大タスク（要件整理・設計が必要な機能追加や変更）**:
   通常の `/plan` コマンド相当の処理を行い、詳細な設計ドキュメント（`docs/tasks/...md`）を作成。`milestones.json` に `tasks: []` となるマイルストーンを追加します。これにより、次回 [looper/run.sh](file:///Users/taniguchitaichi/LifeManagement/opencode-looper/looper/run.sh) 実行時に `Planner` エージェントが起動し、Waveを用いた詳細なタスク分割が行われます。
2. **小タスク（設計不要、UI変更や単一機能の追加などの直感的なタスク）**:
   これらは「小タスク用マイルストーン」にまとめますが、**実装に入る前に必ず軽量版仕様書（設計ドキュメント）を提案します（opencode-looperの設計思想に準拠）**。
   `/vibe` コマンドは以下の処理を行います。
   - まとめて1つの軽量版仕様書（例: `docs/tasks/YYYYMMDD_HHMM_vibe_tasks.md`）を自動生成する。このドキュメントには、どのファイルを変更するか、どのような実装を行うかの概要が記述されます。
   - `milestones.json` にマイルストーンを追加し、`plan_doc` に上記で生成した軽量版仕様書を指定します。
   - `tasks: [{id, description, wave: 1, done: false}, ...]` のように、Builderが実行する小タスクを配列に直接注入します。
   - ユーザーに生成された仕様書の確認を依頼します。
   
   これにより、ユーザーは実装前に内容をレビューでき（仕様書先出しの原則の維持）、実行時（[looper/run.sh](file:///Users/taniguchitaichi/LifeManagement/opencode-looper/looper/run.sh)）には `Planner` 処理をスキップして即座に `Builder` が仕様書を読み込んで並列実装を開始します。

## ユーザーレビュー（完了）

- コマンド名は `/vibe` を採用。
- 小タスクを投げる場合でも、実装に直行するのではなく、事前に軽量な仕様書を生成してユーザーに提案する挙動に変更。

## Proposed Changes

### OpenCode Commands

#### [NEW] .opencode/commands/vibe.md

このファイルには以下のプロンプト（指示）を含めます。

- ルートディレクトリの [VIBE.md](file:///Users/taniguchitaichi/LifeManagement/opencode-looper/VIBE.md) を読み込み、箇条書きタスクの意図を汲み取り、タスクを「大（慎重な設計要）」と「小（直感的に即実装可）」に分類する。
- **大のタスク**: 個別に設計ドキュメントファイルを作成し、`milestones.json` の `milestones` に追加する（`tasks: []`）。
- **小のタスク**: まとめて1つの軽量版仕様書（設計ドキュメント）を作成し、変更対象のファイルと実装方針を明記する。`milestones.json` に追加する際、`plan_doc` にその仕様書を記載し、`tasks: [{id, description, wave: 1, done: false}, ...]` を直接埋め込む。
- 仕様書作成後、ユーザーにレビューを求めるよう指示する。

## Verification Plan

### Automated Tests
- 今回はシェルスクリプト自体の変更はなくプロンプト追加になるため、自動テストによる検証は行いません。

### Manual Verification
1. `/vibe` コマンドに大タスクと小タスクを混在させて実行します。
2. 実行後、LLMが実装に直行せず、`docs/tasks/` に軽量版仕様書（および通常仕様書）を作成してユーザーに提案するかを確認します。
3. `looper/milestones.json` に正しく `plan_doc` と `tasks` (小タスクの場合はwave: 1で登録済) が反映されるかを確認します。
