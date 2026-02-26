# source-infrastructure: ステップ B インフラレイヤー実装

## タスク ID: source-infrastructure
PrismaSourceRepository + PrismaSourceArticleRepository + NoteApi/Stub ArticleFetchAdapter + PrismaKnowledgeRepository 拡張

## 作成・変更ファイル
- `infrastructure/repositories/prisma-source.repository.ts`（新規）: Source の CRUD。PrismaExpressionRuleRepository と同パターン
- `infrastructure/repositories/prisma-source-article.repository.ts`（新規）: SourceArticle の CRUD + saveMany(createMany + skipDuplicates) + countBySourceId
- `infrastructure/adapters/note-api-article-fetch.adapter.ts`（新規）: note.com 非公式 API でページネーション取得 + HTML→テキスト変換
- `infrastructure/adapters/stub-article-fetch.adapter.ts`（新規）: テスト用スタブ（固定3記事を返す）

## 設計判断
- PrismaKnowledgeRepository の findBySourceArticleIds はステップ A で既に追加済みだったため、変更不要
- NoteApiArticleFetchAdapter ではレートリミット回避のためページング間に 500ms の待機を入れた
- 既存の PrismaExpressionRuleRepository / PrismaKnowledgeRepository のパターンを忠実に踏襲

## 次のタスクへの申し送り
- ステップ C (source-usecases) でこれらの Repository/Adapter を UseCase から利用する
- ステップ D (source-presentation) で Composition Root にファクトリ関数を追加する
