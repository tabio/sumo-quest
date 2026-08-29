# SUMO QUEST

相撲をレトロRPG風に学ぶ静的Webコンテンツ。

- 何を作るか: [docs/sumo-quest-prd.md](docs/sumo-quest-prd.md)
- どう作るか: [docs/sumo-quest-design.md](docs/sumo-quest-design.md)
- いつ・どの順序で作るか: [docs/plans/](docs/plans/README.md)

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動する |
| `npm run build` | 本番ビルドを作成する |
| `npm run lint` | ESLintを実行する（警告も失敗として扱う） |
| `npm run format` | Prettierで整形する |
| `npm run format:check` | 整形済みかを検査する |
| `npm run typecheck` | 型検査を実行する |
| `npm test` | テストを実行する |
| `npm run test:e2e` | E2Eテストを実行する（先に `npm run build` が必要） |

ツール選定の理由は [ADR-0002](docs/plans/decisions/0002-lint-format-test-tooling.md) を参照。

## 技術構成

Next.js（App Router）／React／TypeScript。
サーバー処理（API Routes、Server Actions、DB）は使用しない。
詳細は設計書「3. システム構成」を参照。
