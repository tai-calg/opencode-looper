## タスク
- ID: source-usecases
- 内容: Milestone 5 ステップ C — ListSources/CreateSource/GetSourceDetail/SyncArticles/ImportArticles UseCase + Unit テスト

## 作成ファイル
- `apps/webapp/src/backend/contexts/source-management/application/usecases/list-sources.usecase.ts`
- `apps/webapp/src/backend/contexts/source-management/application/usecases/create-source.usecase.ts`
- `apps/webapp/src/backend/contexts/source-management/application/usecases/get-source-detail.usecase.ts`
- `apps/webapp/src/backend/contexts/source-management/application/usecases/sync-articles.usecase.ts`
- `apps/webapp/src/backend/contexts/source-management/application/usecases/import-articles.usecase.ts`
- `apps/webapp/test/unit/contexts/source-management/application/usecases/source-usecases.test.ts`

## 設計判断
- 既存の CreateKnowledgeUseCase / ListKnowledgeUseCase と同じ DI パターンを踏襲
- ImportArticlesUseCase は逐次処理（for ループ）で実装。note API レートリミット回避のため並列化しない
- SyncArticlesUseCase は URL ベースで既存記事と突合し、新規のみ追加
- GetSourceDetailUseCase の knowledgeMapping は取込済み記事のみ findBySourceArticleIds を呼ぶ最適化付き
- テストは knowledge-usecases.test.ts と同じモック方式（vi.fn + mockResolvedValue）で14テストケース作成

## 次のタスクへの申し送り
- ステップ D（source-presentation）で Composition Root にファクトリ関数を追加し、Loader/Action を作成する
