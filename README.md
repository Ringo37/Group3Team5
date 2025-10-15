# Group3Team5

## Getting Started

### Installation

- DockerとNodeJsをインストールしていない場合はインストールしてください。

※最初とエラーでうごかないときに以下を実行。

```bash
npm install
```

### Development

環境変数のコピー

```bash
cp .env.example .env
```

データベースを起動

```bash
sudo docker compose up -d
```

※最初とデータシートを削除したときのみ実行

```bash
npm run setup
```

※データベースに変更があった場合のみ実行

```bash
npm run migrate
```

開発サーバーを起動

```bash
npm run dev
```

eslintの実行

```bash
npm run lint
```

フォーマットの実行

```bash
npm run format
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```
