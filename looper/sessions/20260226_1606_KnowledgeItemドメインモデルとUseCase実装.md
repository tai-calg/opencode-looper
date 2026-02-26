# knowledge-domain-and-usecases: Milestone 3 ステップ A

## タスク内容
EmbeddingGateway インターフェース + SourceType + KnowledgeItem ドメインモデル + Repository インターフェース + 4 UseCase + Unit テスト

## 作成ファイル（10ファイル）
- `apps/webapp/src/backend/contexts/shared/domain/gateways/embedding.gateway.ts` — EmbeddingGateway インターフェース
- `apps/webapp/src/backend/contexts/source-management/domain/models/source-type.model.ts` — SourceType union + type guard
- `apps/webapp/src/backend/contexts/source-management/domain/models/knowledge-item.model.ts` — KnowledgeItem Rich Domain Model
- `apps/webapp/src/backend/contexts/source-management/domain/repositories/knowledge.repository.ts` — KnowledgeRepository インターフェース
- `apps/webapp/src/backend/contexts/source-management/application/usecases/list-knowledge.usecase.ts`
- `apps/webapp/src/backend/contexts/source-management/application/usecases/create-knowledge.usecase.ts`
- `apps/webapp/src/backend/contexts/source-management/application/usecases/update-knowledge.usecase.ts`
- `apps/webapp/src/backend/contexts/source-management/application/usecases/delete-knowledge.usecase.ts`
- `apps/webapp/test/unit/contexts/source-management/domain/models/knowledge-item.model.test.ts` — モデルテスト（10テスト）
- `apps/webapp/test/unit/contexts/source-management/application/usecases/knowledge-usecases.test.ts` — UseCase テスト（8テスト）

## 設計判断
- ExpressionRule と同一の Rich Domain Model パターンを踏襲
- KnowledgeItem.update() で content 変更検知→embedding クリア、UseCase 側で再生成判断する責務分離
- EmbeddingGateway は shared コンテキストに配置（他 BC からも利用可能に）

## 次のタスクへの申し送り
- ステップ B（knowledge-infrastructure-and-ui）で OpenAI/Stub アダプタ、Prisma Repository、UI を実装する
