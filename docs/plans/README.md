# SUMO QUEST 実行計画

本ディレクトリは、`../sumo-quest-prd.md`（何を作るか）と `../sumo-quest-design.md`（どう作るか）を受けて、
**いつ・どの順序で・何を完了とみなして進めるか**を定める。

設計判断そのものは設計書を正とし、本ディレクトリでは扱わない。
対象範囲はMVP（設計書「20. MVP受け入れ条件」）まで。

複数人での並行更新を前提にフェーズ単位へ分割している。
編集前に [CONVENTIONS.md](CONVENTIONS.md) を読むこと。

## 文書構成

| ファイル | 役割 | 更新者 |
|---|---|---|
| [README.md](README.md)（本書） | 索引と全体像 | 変更頻度：低 |
| [CONVENTIONS.md](CONVENTIONS.md) | 文書の運用規約 | 変更頻度：低 |
| [phase-0-foundation.md](phase-0-foundation.md) | Phase 0：土台 | Phase 0オーナー |
| [phase-1-vertical-slice.md](phase-1-vertical-slice.md) | Phase 1：STAGE 1縦切り | Phase 1オーナー |
| [phase-2-data-driven.md](phase-2-data-driven.md) | Phase 2：データ駆動化とSTAGE 2〜5 | Phase 2オーナー |
| [phase-3-final-stage.md](phase-3-final-stage.md) | Phase 3：最終ステージ | Phase 3オーナー |
| [phase-4-quality.md](phase-4-quality.md) | Phase 4：品質向上 | Phase 4オーナー |
| [testing.md](testing.md) | テストの投入計画（横断） | テスト担当 |
| [risks.md](risks.md) | リスク台帳（追記型） | 全員（追記のみ） |
| [scope.md](scope.md) | スコープ境界と数値パラメータの扱い | 変更頻度：低 |
| [decisions/](decisions/) | 決定記録（1決定1ファイル） | 全員（新規作成のみ） |

**進捗は本書に書かない。**
各フェーズファイルの状態欄で管理する。理由は [CONVENTIONS.md](CONVENTIONS.md) の「進捗を中央に集約しない」を参照。

## 前提と制約

| 項目 | 内容 |
|---|---|
| 配信先 | GitHub Pages（リポジトリ配下のサブパス） |
| サーバー | 使用しない。API Routes / Server Actions / DB なし |
| 保存先 | ブラウザの localStorage のみ |
| 主要技術 | Next.js（App Router）／React／TypeScript／Static Export |
| 状態管理 | React Context + useReducer（ライブラリ導入なし） |
| 対応端末 | 320px幅以上のスマートフォン、タッチ、キーボード |

## 進め方の原則

1. **縦切りを最優先する。**
   STAGE 1で「開始→学習→取組→報酬→保存→再開」を先に完成させる。6ステージを並行して作らない。
2. **仕組みが先、コンテンツが後。**
   汎用化された画面が動いてから、残りステージをデータ追加で増やす。
3. **各フェーズの終わりに必ず本番URLで確認する。**
   ローカルで動いてもGitHub Pagesのサブパスで壊れる不具合は、最後に出ると高コストになる。
4. **相撲コンテンツの正確性は実装と別レーンで進める。**
   実装を待たずに文章を用意し、実装完了時点で差し替えられる状態にしておく。

## フェーズ全体像

```text
Phase 0  土台
   ↓        ← 完了ゲート: 空ページがGitHub Pagesで表示される
Phase 1  STAGE 1 縦切り
   ↓        ← 完了ゲート: 1ステージ分のループが本番URLで通る（最重要ゲート）
Phase 2  データ駆動化 + STAGE 2〜5
   ↓        ← 完了ゲート: 5ステージがデータ追加のみで成立する
Phase 3  最終ステージとエンディング
   ↓        ← 完了ゲート: 横綱到達まで通しでプレイできる
Phase 4  品質向上
            ← 完了ゲート: MVP受け入れ条件を全て満たす
```

各フェーズは**前フェーズの完了ゲートを通過してから着手する**。
ただしコンテンツ執筆（レーンC）と素材制作（レーンD）は、Phase 0開始と同時に並行で走らせる。

## 並行レーン

| レーン | 内容 | 開始時期 |
|---|---|---|
| A：実装 | Phase 0〜4のタスク | 直列 |
| B：配信基盤 | next.config、GitHub Actions、Pages設定 | Phase 0 |
| C：コンテンツ執筆 | 会話文、クイズ、用語・技の説明 | Phase 0と同時 |
| D：ピクセル素材 | NPC、マップ、技アイコン | Phase 0と同時（暫定素材で先行可） |

レーンCとDの遅れが実装を止めないよう、
**プレースホルダ（仮テキスト・単色矩形）で先に実装を通し、後から差し替える**方針とする。

## 着手順の要約

```text
1. Phase 0を終わらせ、まず「本番URLで表示される」状態を作る
2. Phase 1でSTAGE 1だけを端から端まで完成させ、再読み込み再開まで実機で確認する
3. Phase 2で汎用化してから、STAGE 2〜5をデータで追加する
4. Phase 3で最終試験と横綱昇進、エンディングを繋ぐ
5. Phase 4でアクセシビリティ、エラー復旧、テスト、コンテンツ校正を仕上げる
```

最も重要なのは2である。
ここを完成させずに3以降へ進むと、欠陥が全ステージへ複製される。
