# OAuth Route Handler + Callback + Composition 更新

- **タスク ID**: auth-routes-and-composition
- **内容**: Milestone 7 ステップ C — OAuth ログイン/コールバック Route Handler、ドメイン検証 UseCase、Composition 全面書き換え、UI 更新

## 作成・変更したファイル

- `src/backend/contexts/auth/application/usecases/upsert-user-on-login.usecase.ts`（新規）
- `src/app/api/auth/login/route.ts`（新規）
- `src/app/api/auth/callback/route.ts`（新規）
- `src/backend/contexts/auth/presentation/composition/auth.composition.ts`（全面書き換え）
- `src/backend/contexts/auth/presentation/loaders/session.loader.ts`（書き換え）
- `src/backend/contexts/auth/presentation/actions/logout.action.ts`（書き換え）
- `src/app/api/auth/dev-login/route.ts`（import 変更）
- `src/app/(public)/login/page.tsx`（Google ログインボタン有効化）
- `src/app/(auth)/layout.tsx`（AvatarImage 追加）
- `test/unit/contexts/auth/application/usecases/upsert-user-on-login.usecase.test.ts`（新規）

## 設計判断

- `createAuthService()` オブジェクトリテラルパターンから個別関数エクスポート（`getSession`, `setDevSession`, `clearSession`, `createUpsertUserOnLoginUseCase`）に変更。他の Composition（content-check）と統一
- Supabase Auth は `getUser()` で検証（`getSession()` は JWT デコードのみで不十分）
- ドメイン検証は UseCase 層で実施。Google の `hd` パラメータはヒントのみ

## 次のタスクへの申し送り

- Milestone 7 の全ステップ（A/B/C）が完了。マージ可能
- 本番環境では Supabase の Google OAuth プロバイダー設定と環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）が必要
