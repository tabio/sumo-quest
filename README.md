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

## 技術構成

Next.js（App Router）／React／TypeScript。
サーバー処理（API Routes、Server Actions、DB）は使用しない。
詳細は設計書「3. システム構成」を参照。
