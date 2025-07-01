# ===== 1. ビルダーステージ (Builder Stage) =====
# 依存関係のインストールとアプリケーションのビルドを担当
FROM node:20.10.0-alpine AS builder

WORKDIR /app

# package.jsonとprismaスキーマを先にコピー
COPY photo-gallary/package*.json ./
COPY photo-gallary/prisma ./prisma/

# ビルドに必要な全ての依存関係をインストール
RUN npm install

# アプリケーションの全ソースコードをコピー (node_modules を除く)
# 先に必要なディレクトリを個別にコピーする
COPY photo-gallary/src ./src/
COPY photo-gallary/public ./public/
COPY photo-gallary/next.config.ts ./
COPY photo-gallary/tsconfig.json ./
COPY photo-gallary/next-env.d.ts ./
COPY photo-gallary/postcss.config.mjs ./
COPY photo-gallary/eslint.config.mjs ./
COPY photo-gallary/components.json ./
# ESLint configuration is already copied as eslint.config.mjs

# Next.jsアプリケーションをビルド
# ※ next.config.tsで `output: 'standalone'` の設定が必須です
# TypeScriptの設定ファイルをJavaScriptにコンパイル
RUN echo 'module.exports = { basePath: "/photo-gallary", output: "standalone" };' > next.config.js
# Build the Next.js application
RUN npm run build


# ===== 2. 実行ステージ (Runner Stage) =====
# ビルドされたアプリケーションの実行のみを担当
FROM node:20.10.0-alpine AS runner

WORKDIR /app

# 本番環境用の環境変数を設定
ENV NODE_ENV=production

# package.jsonとpackage-lock.jsonをコピー
COPY --from=builder /app/package*.json ./

# 依存関係をインストール (production only)
RUN npm ci --only=production

# ビルドされたアプリケーションをコピー
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/prisma ./prisma/

# Next.js standalone mode handles basePath automatically, no need to create directories

# アプリケーションが使用するポートを公開
EXPOSE 3001

# Next.jsのbasePath設定を環境変数として渡す
ENV NEXT_BASEPATH=/photo-gallary
# PORT環境変数を設定して、サーバーが正しいポートでリッスンするようにする
ENV PORT=3001

# マイグレーションを実行し、アプリケーションを起動する
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
