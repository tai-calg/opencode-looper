# ContentCheck Slack フィールド Repository 反映

## タスク ID
`content-check-slack-fields-repository`

## 内容
ContentCheck ドメインモデルと Repository への Slack フィールド反映

## 作成・変更したファイル
- `apps/content-reviewer/src/backend/contexts/content-check/infrastructure/repositories/prisma-content-check.repository.ts`
  - `save()` の `upsert update` 句に `slackChannelId` と `slackThreadTs` を追加
- `apps/content-reviewer/test/unit/contexts/content-check/infrastructure/repositories/prisma-content-check.repository.test.ts`
  - `save()` テストの `update` 句の期待値を修正（slackChannelId/slackThreadTs を含めるよう更新）
  - Slack フィールドが設定された save テストケース追加
  - `toDomain()` で Slack フィールドをマッピングするテストケース追加

## 設計判断
- **ドメインモデル（content-check.model.ts）**: W1（slack-contracts タスク）で既に `slackChannelId`/`slackThreadTs` フィールドがコンストラクタ・create()・reconstruct()・startProcessing()・complete()・fail()（toProps() 経由）で正しく受け渡されていた。追加変更不要。
- **Repository（prisma-content-check.repository.ts）**: `toDomain()` と `toPrisma()` は既に Slack フィールドをマッピングしていたが、`save()` の `upsert update` 句だけが抜けていた。この1箇所のみ修正。
- `update` 句に slackChannelId と slackThreadTs を追加したことで、既存レコード更新時にも Slack フィールドが上書きされるようになった。

## 詰まった点・解決方法
特になし。調査の結果、実装の大部分は既に W1 で完了しており、save() の update 句への追加が唯一の残作業だった。

## 次のタスクへの申し送り
- Slack フィールドの DB マッピングが完成。Slack からのコンテンツチェックを扱う UseCase / Application 層の実装（W3 以降）はこれを前提に進められる。
- `failedReason` カラムが Prisma スキーマに未存在（toDomain では常に null を渡している）。今後追加が必要な場合は Prisma マイグレーションが必要。
