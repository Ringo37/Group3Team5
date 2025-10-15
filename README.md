# Group3Team5

## Getting Started

### Installation

- DockerとNodeJsをインストールしていない場合はインストールしてください。

Install the dependencies:

※最初とエラーでうごかないときに以下を実行。

```bash
npm install
```

### Development

```bash
sudo docker compose up -d
```

※マイグレートしていない場合のみ

```bash
npm run setup
```

※データベースに変更があった場合のみ

```bash
npm run migrate
```

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```
