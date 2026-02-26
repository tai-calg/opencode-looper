# RunCheckUseCase + Composition + Loaders + Actions + Unit テスト

- **タスク ID**: check-orchestration-and-presentation
- **内容**: Milestone 4 ステップ F — RunCheckUseCase（オーケストレーション）と Composition Root、Loader、Server Actions を実装

## 作成ファイル
1. `apps/webapp/src/backend/contexts/content-check/application/usecases/run-check.usecase.ts` — 5観点並列チェック + セクション直列処理のオーケストレータ
2. `apps/webapp/src/backend/contexts/content-check/presentation/composition/content-check.composition.ts` — DI 用ファクトリ（環境変数で本番/Stub 切替）
3. `apps/webapp/src/backend/contexts/content-check/presentation/loaders/check-list.loader.ts` — 一覧取得 Loader
4. `apps/webapp/src/backend/contexts/content-check/presentation/loaders/check-detail.loader.ts` — 詳細取得 Loader
5. `apps/webapp/src/backend/contexts/content-check/presentation/actions/create-check.action.ts` — チェック開始 Server Action
6. `apps/webapp/src/backend/contexts/content-check/presentation/actions/resolve-issue.action.ts` — Issue 解決トグル Action
7. `apps/webapp/src/backend/contexts/content-check/presentation/actions/retry-check.action.ts` — 再チェック Action
8. `apps/webapp/src/backend/contexts/content-check/presentation/actions/delete-check.action.ts` — 削除 Action
9. `apps/webapp/test/unit/contexts/content-check/application/usecases/run-check.test.ts` — RunCheckUseCase ユニットテスト

## 設計判断
- source-management の composition/loader/action パターンをそのまま踏襲
- Composition で ANTHROPIC_API_KEY / OPENAI_API_KEY / DATABASE_URL の有無で本番/Stub を切替
- Loader はドメインモデルから plain object（Date → ISO 文字列）に変換して返す

## 次のタスクへの申し送り
- ステップ G（check-frontend）で Loader/Action を利用するフロントエンドを実装する
- ポーリング用 API Route（`/api/checks/[id]`）もステップ G で作成が必要
