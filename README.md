# Group3Team5

## ブランチ命名規則

- 機能追加: feature/#<issue番号>-<概要>
- バグ修正: fix/#<issue番号>-<概要>
- リファクタリング: refactor/#<issue番号>-<概要>

## 以下をコミット前に行いエラーが発生する場合は修正する(可能であれば)

型チェックの実行(コードの型に問題がないか確認)

```bash
npm run typecheck
```

リンターの実行(コードに問題がないか確認)

```bash
npm run lint
```

フォーマットの実行(コード整形)

```bash
npm run format
```

## Getting Started

### 依存関係のインストール

- Docker、NodeJs、Pythonをインストールしていない場合はインストールしてください。

Nodeモジュールのインストール ※最初とパッケージが追加された場合

```bash
npm install
```

### セットアップ

環境変数のコピー ※最初のみ実行

```bash
cp .env.example .env
```

データベースを起動 ※毎回

```bash
docker compose up -d
```

セットアップ ※最初のみ実行

```bash
npm run setup
```

DBマイグレーション ※データベースに変更があった場合のみ実行

```bash
npm run migrate
```

### 開発

開発サーバーを起動

```bash
npm run dev
```

- ReactRouterは `http://localhost:5173`
- FastAPIは `http://localhost:8000`

APIの型定義等

```bash
npm run openapi
```

Python依存関係インストール ※依存関係変更時に実行

```bash
npm run setup:python
```

### ビルド

```bash
npm run build
```

### スタート

```bash
npm run start
```

## ディレクトリ構成

Group3Team5/  
├── .env  
├── .gitignore  
├── docker-compose.yaml #DB用  
├── public/ # 画像とか  
├── prisma/ # データベース関連  
│ ├── schema.prisma # データベースのスキーマ  
│ └── seed.ts # データベースのシード  
│  
├── model_api/ # Python (FastAPI)  
│ ├── app # FastAPI  
│ │ ├── modules/ # 関数群  
│ │ ├── main.py # エントリーポイント  
│ │ └── schemas.py # APIのデータ型定義  
│ └── requirements.txt # Python依存関係  
│  
├── app/ # React Router  
│ ├── routes/ # ページ  
│ ├── components/ # 再利用コンポーネント  
│ ├── models/ # データベース操作関数群  
│ ├── services/ # ログイン関連  
│ ├── utils/ # ユーティリティ  
│ ├── lib/ # ライブラリ  
│ ├── api/ # FastAPIの型定義  
│ ├── routes.ts # ルートの定義  
│ ├── app.css # CSSファイル  
│ └── root.tsx  
│  
└── package.json #コマンドやパッケージ類

## トラブルシューティング

- もし、AIなどが出力するコードのChakra UIコンポーネントで型エラーが発生する場合、バージョン違いによる問題かと思われます。https://zenn.dev/anyland/articles/3d2b09eb8198a3
