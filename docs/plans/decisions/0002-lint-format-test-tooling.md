# ADR-0002: Lint・フォーマット・テストランナーの選定

状態: 採用
日付: 2026-08-29

## 背景

実行計画の [P0-2](../phase-0-foundation.md) は「Lint / フォーマット / テストランナー導入」を求めている。

一方、[設計書](../../sumo-quest-design.md)「17. テスト設計」はテストの**種類**を定めているが、
具体的なツールは指定していない。

そのため、ツール選定はここで決める必要がある。

## 決定

次の構成を採用する。

| 目的 | ツール | コマンド |
|---|---|---|
| Lint | ESLint（`eslint-config-next` の `core-web-vitals` + `typescript`） | `npm run lint` |
| フォーマット | Prettier | `npm run format` / `npm run format:check` |
| 型検査 | TypeScript | `npm run typecheck` |
| 単体・コンポーネントテスト | Vitest + Testing Library（jsdom） | `npm test` |

あわせて次の方針をとる。

- `npm run lint` は `--max-warnings=0` を付け、警告も失敗として扱う
- ESLintは整形に関与させない（`eslint-config-prettier` で競合ルールを無効化する）
- Prettierの対象からMarkdownを除外する
- ESLintは `9` 系に固定する

E2E（Playwright）は Phase 1 の完了ゲートで導入する。
時期は [testing.md](../testing.md) を正とする。

## 理由

Vitestを選ぶのは、Viteベースで設定が小さく、ESM・TypeScript・JSXを追加設定なしで扱えるため。
Jestは同等のことができるが、Next.js構成では変換設定の記述量が増える。

Testing Libraryは、設計書「15. レスポンシブ・アクセシビリティ」および
「コンポーネントテスト」の項目が、ロール・ラベル経由の操作を前提としているため適する。

`--max-warnings=0` とするのは、既定では警告が終了コードに影響せず、
「`npm run lint` が成功する」という完了条件がCIで意味を持たなくなるため。

MarkdownをPrettierの対象から外すのは、表の桁揃えや折り返しが差分を広げ、
[CONVENTIONS.md](../CONVENTIONS.md) が避けようとしている `docs/` の並行更新の衝突を増やすため。

ESLintを `9` 系に固定するのは、`eslint-config-next@16.3.3` が内包する
`eslint-plugin-react` がESLint 10で動作せず、ルール読み込み時に失敗するため。
ESLint 10へは、依存側が対応した時点で上げる。

## 影響

- `package.json` に `lint` / `format` / `format:check` / `typecheck` / `test` などのスクリプトが追加される
- テストファイルは実装と同じ場所に `*.test.ts(x)` として置く
- 以降のタスクは、これらのコマンドが成功する状態を保って進める
- CIでの実行は P0-4 のワークフローに組み込む

## 検討した代替案

### Jest + React Testing Library

Next.jsの公式手順が用意されており実績もある。
しかし本プロジェクトはサーバー処理を持たない静的サイトで、変換設定を厚くする理由が乏しい。
起動の速さが実装と同時にテストを書く方針（[testing.md](../testing.md)）と噛み合うため、Vitestを採る。

### Biome（Lintとフォーマットの統合）

単一ツールで完結し高速である。
ただし `eslint-config-next` が提供するNext.js固有ルール（画像・リンク・Core Web Vitals）が失われる。
`basePath` 配信を前提とする本プロジェクトでは、この検査を手放す損失が大きい。

### フォーマットもESLintで行う

ツールが1つで済むが、整形ルールと品質ルールが同じ設定に混ざり、差分の意図が読みにくくなる。
役割を分け、ESLintは整形に関与させない。
