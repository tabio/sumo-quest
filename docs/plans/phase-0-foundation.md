# Phase 0：土台

オーナー: 未定
前提: なし（起点）

## 目的

空のページがGitHub Pages上に表示され、以降のタスクが「アプリの中身」だけに集中できる状態を作る。

## タスク

| ID | タスク | 完了条件 | 状態 |
|---|---|---|---|
| P0-1 | Next.js（App Router）+ TypeScript でプロジェクト初期化 | `npm run dev` でトップページが表示される | 完了 |
| P0-2 | Lint / フォーマット / テストランナー導入 | `npm run lint`、テストコマンドが成功する | 完了 |
| P0-3 | `next.config.ts` に静的エクスポートと `basePath` を設定 | `npm run build` で `out/` が生成される | 完了 |
| P0-4 | GitHub Actions ワークフロー作成、Pages有効化 | mainへのpushで自動配信される | 進行中 |
| P0-5 | 型定義 `src/types/game.ts` を作成 | 設計書「8. データモデル」の型が揃う | 完了 |
| P0-6 | コンテンツデータの空ファイル雛形を作成 | `src/data/` 配下7ファイルが型付きで存在する | 未着手 |
| P0-7 | デザイントークン（色・余白・フォント）を `globals.css` に定義 | 限定色数のパレットが変数化されている | 未着手 |
| P0-8 | `GameShell` / `PixelWindow` / `PixelButton` を実装 | ダミーページでRPG風の枠と押せるボタンが出る | 未着手 |
| P0-9 | `basePath` を考慮した画像パスヘルパーを実装 | ローカルと本番の双方で画像が表示される | 未着手 |

## 完了ゲート

- [ ] GitHub PagesのURLで、ピクセル調の枠とボタンを持つダミーページが表示される
- [ ] そのページ内の画像とリンクがサブパス配下で壊れていない

## 注意点

`basePath` 起因のリンク切れ・画像切れは、この時点で確実に潰しておく。
Phase 1以降に持ち越すと、原因の切り分けコストが跳ね上がる。

## 関連

- リスク: [R-1](risks.md)（サブパス配信）
- 決定: [ADR-0002](decisions/0002-lint-format-test-tooling.md)（Lint・フォーマット・テストランナーの選定）
- 次フェーズ: [phase-1-vertical-slice.md](phase-1-vertical-slice.md)
