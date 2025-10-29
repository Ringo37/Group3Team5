# ===== Stage 1: Install dependencies =====
FROM node:22-bookworm AS deps

# Python 3.11 を追加
RUN apt-get update && apt-get install -y python3.11 python3.11-venv python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

# ===== Stage 2: Build =====
FROM node:22-bookworm AS build

# Python 3.11 を同様に追加
RUN apt-get update && apt-get install -y python3.11 python3.11-venv python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules

# Python セットアップスクリプトを実行
RUN npm run setup:python

# アプリケーションをビルド
RUN npm run build

# ===== Stage 3: Production runtime =====
FROM node:22-bookworm AS runtime

# Python 3.11 を同様に追加
RUN apt-get update && apt-get install -y python3.11 python3.11-venv python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# package.json と lock ファイルをコピー
COPY package*.json ./

# node_modules（本番用のみ）をコピー
COPY --from=deps /app/node_modules ./node_modules

# FastAPIをコピー
COPY --from=build /app/model_api ./model_api

# ビルド成果物をコピー
COPY --from=build /app/build ./build

# Prisma スキーマなど必要なファイルもコピー
COPY prisma ./prisma

# Prisma キャッシュを削除して再生成
RUN npx prisma generate

EXPOSE 3000

# 起動時コマンド
CMD ["/bin/sh", "-c", "npm run migrate:deploy && npm run start"]
