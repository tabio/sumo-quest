# CLAUDE.md

## プロジェクト

SUMO QUEST — 相撲をレトロRPG風に学ぶ静的Webコンテンツ。

| 文書 | 内容 |
|---|---|
| `docs/sumo-quest-prd.md` | 何を作るか（プロダクト要件） |
| `docs/sumo-quest-design.md` | どう作るか（設計） |
| `docs/plans/` | いつ・どの順序で作るか（実行計画） |

実装方針の判断は設計書を正とする。

## 言語

**PR、コミットメッセージ、Issue、レビューコメントはすべて日本語で書く。**

コード中の識別子は英語、コメントは日本語とする。

## ドキュメント

`docs/` 配下を編集する前に `docs/plans/CONVENTIONS.md` を読むこと。
並行作業でのコンフリクトを避けるための規約を定めている。

特に次の3点を守る。

- 進捗を中央のファイルに集約しない（各フェーズファイルの状態欄で管理する）
- 同じ事実を2箇所に書かない（転記せずリンクする）
- 設計書とPRDは直接編集せず、`docs/plans/decisions/` にADRを追加する

## 技術方針

- Next.js（App Router）／TypeScript／Static Export
- サーバー処理は使用しない（API Routes、Server Actions、DBなし）
- 保存先は localStorage のみ
- 配信は GitHub Pages（リポジトリ配下のサブパス）

`basePath` を前提に、リンクは `next/link`、画像はヘルパー経由で参照する。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
