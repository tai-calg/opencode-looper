# ExpressionRule ドメインモデル + UseCase 実装

- **タスク ID**: rule-domain-and-usecases
- **内容**: Milestone 2 ステップ A — ExpressionRule ドメインモデル + Repository インターフェース + 5 UseCase + Unit テスト

## 作成したファイル
- `apps/webapp/src/backend/contexts/source-management/domain/models/expression-rule.model.ts` — ドメインモデル（create/reconstruct/update/toggleEnabled）
- `apps/webapp/src/backend/contexts/source-management/domain/repositories/expression-rule.repository.ts` — Repository インターフェース
- `apps/webapp/src/backend/contexts/source-management/application/usecases/list-rules.usecase.ts` — 一覧取得
- `apps/webapp/src/backend/contexts/source-management/application/usecases/create-rule.usecase.ts` — 新規作成
- `apps/webapp/src/backend/contexts/source-management/application/usecases/update-rule.usecase.ts` — 更新
- `apps/webapp/src/backend/contexts/source-management/application/usecases/delete-rule.usecase.ts` — 削除
- `apps/webapp/src/backend/contexts/source-management/application/usecases/toggle-rule.usecase.ts` — 有効/無効切替
- `apps/webapp/test/unit/contexts/source-management/domain/models/expression-rule.model.test.ts` — モデルテスト（8テスト）
- `apps/webapp/test/unit/contexts/source-management/application/usecases/rule-usecases.test.ts` — UseCase テスト（8テスト）

## 設計判断
- 設計ドキュメントの型定義・シグネチャに完全に従った（Rich Domain Model + イミュータブル更新パターン）
- 既存の Result / Timestamp モデルを活用し、domain 層は外部依存なし

## 次のタスクへの申し送り
- ステップ B（rule-infrastructure-and-ui）で Prisma Repository 実装・Composition Root・Actions・UI コンポーネントを追加する
