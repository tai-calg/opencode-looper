# Frontend Rules

Next.js App Router + shadcn/ui + Tailwind CSS におけるフロントエンド規約。

---

## ディレクトリ構成

`apps/{app}/src/` 配下:

| ディレクトリ | 責務 |
|---|---|
| `app/(auth)/` | 認証必須ページ。Layout で認証チェックを行う |
| `app/(public)/` | 認証不要の公開ページ（LP・ログイン・サインアップ等） |
| `frontend/` | フロントエンド共通コード |
| `frontend/components/` | React コンポーネント。`'use client'` でクライアントを明示 |
| `frontend/hooks/` | カスタム hooks |
| `frontend/lib/` | クライアント側 util（fetcher, formatter 等） |
| `backend/` | サーバーサイド DDD 構造（`architecture.md` 参照） |

---

## 認証ルートグループ

認証があるサービスでは、`app/` 直下を Next.js の Route Group で分割する:

- **`(auth)/`** — 認証必須ページ。`(auth)/layout.tsx` でセッション検証を行い、未認証なら `/login` へリダイレクト
- **`(public)/`** — 認証不要の公開ページ（LP・ログイン・サインアップ・利用規約等）

```
app/
├── (auth)/
│   ├── layout.tsx        ← 認証チェック Layout
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx          ← LP
│   └── login/page.tsx
└── layout.tsx            ← Root Layout（共通 Provider 等）
```

> Route Group は URL に影響しないため、`(auth)/dashboard/page.tsx` の URL は `/dashboard` になる。

page.tsx は loader 呼び出し + props 渡しのみとする原則は各グループ内でも同様。

---

## Server Components / Client Components

- **デフォルトは Server Component。** `'use client'` は必要な場合のみ付与
- Client Component が必要なケース: SSE ストリーム受信、ユーザーインタラクション、リアルタイム更新
- **初期データは必ず Server Component** (page.tsx + loader) で取得。Client Component は差分のみ fetch

---

## データフロー

### 読み取り

page.tsx → loader (`backend/presentation/loaders/`) → UseCase → Repository

**loader は BFF として振る舞う。** ページに必要なデータは loader で一括取得し、クライアントからの追加 fetch を最小限にする。複数データソースがある場合は loader 内で並列取得（`Promise.all`）する。

### 副作用

Client Component → action (`backend/presentation/actions/`, `'use server'`) → UseCase → Gateway / Repository

### SSE ストリーム

action が UseCase の `onProgress` コールバックを `ReadableStream` + SSE フォーマットに変換。Client Component 側で `ReadableStream` を consume してリアルタイム表示。

---

## UI スタック

- **shadcn/ui**: コンポーネントライブラリ。`frontend/components/ui/` に配置
- **Tailwind CSS**: スタイリング。カスタム CSS は原則不要
- **Lucide React**: アイコン。`lucide-react` からインポートして使用
- **Biome**: lint / format（タブインデント、シングルクォート、セミコロン必須）
