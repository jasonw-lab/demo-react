# フォトギャラリーアプリケーション

Next.jsで構築された現代的なフォトギャラリーアプリケーションで、ユーザーは写真のアップロード、閲覧、編集、削除ができます。このアプリケーションは以下を使用しています：

- **フロントエンド＆バックエンド**: Next.js
- **データベース**: MySQL（Prisma ORMを使用）
- **ストレージ**: 写真保存用のMinio
- **UI**: Tailwind CSSとshadcn/uiコンポーネント

## 機能

- レスポンシブなグリッドレイアウトですべての写真を表示
- タイトルと説明付きで新しい写真をアップロード
- 既存の写真を編集（タイトル、説明、画像）
- 写真の削除
- モバイルとデスクトップで動作するレスポンシブデザイン

## 前提条件

このアプリケーションを実行する前に、以下のインストールが必要です：

1. Node.js（v18以降）
2. MySQLサーバー
3. Minioサーバー（または任意のS3互換ストレージ）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
# または
yarn install
# または
pnpm install
```

### 2. MySQLのセットアップ

新しいMySQLデータベースを作成します：

```sql
CREATE DATABASE photo_gallery;
```

### 3. Minioのセットアップ

[公式ドキュメント](https://min.io/docs/minio/container/index.html)に従ってMinioをインストールして実行します。

デフォルトの認証情報は以下の通りです：
- アクセスキー: minioadmin
- シークレットキー: minioadmin

### 4. 環境変数の設定

ルートディレクトリに`.env.local`ファイルを作成し、以下の変数を設定します：

```
# データベース
DATABASE_URL="mysql://username:password@localhost:3306/photo_gallery"

# Minio
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="photos"
MINIO_PUBLIC_URL="http://localhost:9000"
NEXT_PUBLIC_MINIO_PUBLIC_URL="http://localhost:9000"
```

`username`と`password`をあなたのMySQL認証情報に置き換えてください。

### 5. データベースの初期化

Prismaマイグレーションを実行してデータベーススキーマを作成します：

```bash
npx prisma migrate dev --name init
```

## 開始方法

開発サーバーを実行します：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開いてアプリケーションを確認します。

## Dockerセットアップ（代替方法）

docker-compose.ymlを参照

## プロジェクト構造

- `/src/app` - Next.jsのアプリルーターページとAPIルート
- `/src/components` - Reactコンポーネント
- `/src/lib` - ユーティリティ関数とサービス
  - `prisma.ts` - Prismaクライアントのセットアップ
  - `minio.ts` - Minioクライアントのセットアップ
  - `photoService.ts` - APIと対話するためのフロントエンドサービス
- `/prisma` - Prismaスキーマとマイグレーション

## APIルート

- `GET /api/photos` - すべての写真を取得
- `POST /api/photos` - 新しい写真を作成
- `GET /api/photos/[id]` - 特定の写真を取得
- `PUT /api/photos/[id]` - 写真を更新
- `DELETE /api/photos/[id]` - 写真を削除

## 本番環境の設定

### 現在の設定

アプリケーションは以下の本番環境へのデプロイ用に設定されています：
```
http://160.251.178.119/photo-gallary/
```

`next.config.ts`ファイルには以下の設定が含まれています：
```javascript
output: "export",
basePath: '/photo-gallary',
```

これらの設定には以下の効果があります：
- `output: "export"`はサーバーサイド機能のない完全に静的なサイトを生成します
- `basePath: '/photo-gallary'`はすべてのルートのベースパスを'/photo-gallary'に設定します

### APIルートに関する重要な注意

**現在の設定ではすべてのAPIルートが無効になります。**

`output: "export"`を使用すると、Next.jsはサーバーサイド機能のない完全に静的なサイトを生成します。これは、本番環境では上記のすべてのAPIルート（上記のリストを含む）が機能しないことを意味します。

この制限に関する詳細情報と推奨される解決策については、[API Solution](./API_SOLUTION.md)ドキュメントを参照してください。

### 本番環境設定のテスト

本番環境の設定でアプリケーションをテストするには：

1. アプリケーションをビルドします：
   ```
   npm run build
   ```

2. サーバーを起動します：
   ```
   npm run start
   ```

3. 以下のURLでアプリケーションにアクセスします：
   ```
   http://localhost:3001/photo-gallary/
   ```

4. API制限をデモンストレーションするには、以下を実行します：
   ```
   node test-static-api.js
   ```
   このスクリプトはAPIエンドポイントへのアクセスを試み、静的エクスポートの制限を示すために失敗することが予想されます。

### デプロイメント

このアプリケーションを本番環境にデプロイするには：

1. アプリケーションをビルドします：
   ```
   npm run build
   ```

2. 出力は`out`ディレクトリに格納され、Webサーバーにデプロイできます。

3. Webサーバーを設定して、`out`ディレクトリから`/photo-gallary/`パスで静的ファイルを提供するようにします。

4. API機能については、[API Solution](./API_SOLUTION.md)ドキュメントに記載されている解決策のいずれかを実装してください。
