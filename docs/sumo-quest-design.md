# SUMO QUEST 設計書

## 1. 文書の目的

本書は「SUMO QUEST」MVPを、Next.jsの静的サイトとして実装するための基本設計・詳細設計を定める。画面遷移、ゲーム進行、状態、データ、コンポーネント、保存、配信、テスト、実装順を対象とする。

## 2. 設計方針

- 最初にSTAGE 1を端から端まで動かす縦切りを作る。
- ステージ追加は原則としてコンテンツデータの追加で行えるようにする。
- ゲームの進行ルールと表示を分離する。
- サーバーに依存せず、GitHub Pagesで動作させる。
- スマートフォン、キーボード、タッチ操作に対応する。
- 不正解による進行不能を作らない。

## 3. システム構成

```text
ブラウザ
├─ Next.js静的ページ
├─ React UI／ゲーム進行
├─ 静的コンテンツデータ
└─ localStorage（セーブデータ）
        ↓ build/export
GitHub Pages
```

### 採用技術

- Next.js（App Router）
- React
- TypeScript
- CSS ModulesまたはグローバルCSS
- Next.js Static Export
- GitHub ActionsによるGitHub Pages配信

状態管理ライブラリはMVPでは導入せず、React ContextとReducerで構成する。規模が拡大した場合のみ再評価する。

## 4. URL・画面一覧

| URL | 画面 | 役割 |
|---|---|---|
| `/` | タイトル | 新規開始、再開、図鑑・辞典への入口 |
| `/new-game` | 名前入力 | プレイヤー作成と初期化 |
| `/map` | ワールドマップ | ステージ選択、進捗表示 |
| `/stage/[stageId]` | 学習 | NPC会話と学習カード |
| `/battle/[stageId]` | 取組 | ステージクイズ |
| `/result/[stageId]` | リザルト | EXP、報酬、昇進、次の導線 |
| `/techniques` | 技図鑑 | 習得済み決まり手の閲覧 |
| `/dictionary` | 用語辞典 | 発見済み用語の閲覧 |
| `/status` | ステータス | 名前、番付、EXP、進捗 |
| `/ending` | エンディング | 横綱到達の演出 |

静的エクスポートのため、動的ルートは`generateStaticParams`で全ステージ分を生成する。

## 5. 画面遷移

```text
タイトル
├─ はじめから → 名前入力 → マップ
├─ つづきから ─────────→ マップ
├─ わざずかん ─────────→ 技図鑑
└─ すもうじてん ───────→ 用語辞典

マップ
  ↓ 解放済みステージを選択
学習
  ↓ 全レッスン完了
取組
  ↓ 規定条件達成
リザルト
  ├─ 通常ステージ → マップ（次を解放）
  └─ 最終ステージ → エンディング
```

未解放ステージを選択した場合は遷移させず、解放条件を短く表示する。セーブがない状態で再開や内部画面へ来た場合はタイトルへ戻す。

## 6. 主要画面設計

### 6.1 タイトル

- ロゴ
- 「はじめから」
- セーブがある場合のみ有効な「つづきから」
- 技図鑑、用語辞典
- 音設定（音を実装する場合）

「はじめから」で既存データがある場合は、上書き確認を行う。

### 6.2 名前入力

- 1〜12文字
- 前後空白を除去
- 空文字は不可
- 決定後に初期セーブを作成

### 6.3 ワールドマップ

- 6エリアを進行順に表示
- 現在地、解放済み、クリア済み、未解放を視覚的に区別
- プレイヤーの番付とEXPを常時表示
- 図鑑、辞典、ステータスへのメニュー

自由移動は実装せず、地点選択方式とする。

### 6.4 学習

- NPCの顔またはドット絵
- 1画面1メッセージの会話ウィンドウ
- 次へ／戻る
- 進捗（例：2/5）
- 用語や技を発見した際の通知
- 全項目閲覧後に「取組へ」

ページを開いただけでは完了扱いにせず、最後まで進んだ時点で学習完了とする。

### 6.5 取組

- 対戦相手
- 問題文
- 2〜4個の選択肢
- 回答後の正誤演出と解説
- 問題進捗

同一問題の二重加点を防ぐ。全問終了後に合格条件を評価し、不合格でも解説確認後に再挑戦できる。

### 6.6 リザルト

- 正答数
- 獲得EXP
- 新しく習得した技・用語
- 昇進前後の番付
- 次ステージ解放通知
- マップへ戻るボタン

報酬計算と保存を一度だけ行う。

### 6.7 技図鑑・用語辞典

習得済み項目は説明を表示する。未習得の技は「？？？」で掲載できるが、用語は発見済みのみ表示する。図鑑の情報は学習データと同じマスターデータを参照し、説明の重複管理を避ける。

## 7. ゲーム進行ルール

### ステージ状態

```text
locked → unlocked → lessonCompleted → cleared
```

- STAGE 1は初期状態で`unlocked`
- 前ステージを`cleared`にすると次を`unlocked`
- 学習完了で`lessonCompleted`
- 取組合格で`cleared`
- クリア済みステージは再プレイ可能

### クイズ合格

- 通常ステージ：正答率60%以上
- 最終試験：正答率80%以上

数値はコンテンツテスト後に調整可能とし、ステージデータで設定する。

### EXP

- 初回の学習完了：10 EXP
- 初回の各問題正解：10 EXP
- 初回のステージクリア：50 EXP
- 再プレイ：原則EXPなし

初回報酬フラグを保存し、無限加点を防ぐ。

### 番付

番付は累積EXPから導出し、セーブには現在値も保持して表示を簡単にする。ロード時に不整合があればEXPを正として再計算する。

| 番付 | 必要累積EXP（仮） |
|---|---:|
| 序ノ口 | 0 |
| 序二段 | 80 |
| 三段目 | 160 |
| 幕下 | 260 |
| 十両 | 380 |
| 前頭 | 520 |
| 小結 | 680 |
| 関脇 | 860 |
| 大関 | 1060 |
| 横綱 | 最終試験クリア |

横綱だけはEXPではなく最終試験クリアを必須とする。

## 8. データモデル

```ts
type StageId = "sumo-stable" | "dohyo" | "dojo" |
  "banzuke-shrine" | "kokugikan" | "yokozuna-castle";

type StageStatus = "locked" | "unlocked" |
  "lessonCompleted" | "cleared";

type RankId = "jonokuchi" | "jonidan" | "sandanme" |
  "makushita" | "juryo" | "maegashira" | "komusubi" |
  "sekiwake" | "ozeki" | "yokozuna";

type PlayerSave = {
  version: 1;
  playerName: string;
  experience: number;
  rankId: RankId;
  stageProgress: Record<StageId, StageProgress>;
  learnedTechniqueIds: string[];
  discoveredTermIds: string[];
  rewardedLessonIds: string[];
  rewardedQuizIds: string[];
  quizHistory: QuizAttempt[];
  createdAt: string;
  updatedAt: string;
};

type StageProgress = {
  status: StageStatus;
  bestScore: number;
  attempts: number;
  clearedAt?: string;
};

type Stage = {
  id: StageId;
  order: number;
  name: string;
  theme: string;
  npcId: string;
  lessonIds: string[];
  quizIds: string[];
  passRate: number;
  clearRewardExp: number;
  unlocks?: StageId;
};

type Lesson = {
  id: string;
  stageId: StageId;
  speakerId: string;
  messages: string[];
  rewardExp: number;
  unlockTechniqueIds?: string[];
  discoverTermIds?: string[];
};

type Quiz = {
  id: string;
  stageId: StageId;
  question: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
  rewardExp: number;
  techniqueId?: string;
  termIds?: string[];
};

type QuizAttempt = {
  stageId: StageId;
  score: number;
  total: number;
  answeredAt: string;
};
```

## 9. コンテンツデータ

```text
src/data/
├─ stages.ts
├─ lessons.ts
├─ quizzes.ts
├─ techniques.ts
├─ terms.ts
├─ ranks.ts
└─ npcs.ts
```

IDは変更しない永続キーとして扱う。表示順は配列位置ではなく`order`で管理する。クイズの正解は選択肢番号ではなく選択肢IDで保持し、並べ替えに耐えられるようにする。

## 10. 状態管理

### GameProvider

アプリ全体を`GameProvider`で包み、`useReducer`で次の操作を一元化する。

- `START_NEW_GAME`
- `LOAD_GAME`
- `COMPLETE_LESSON`
- `RECORD_QUIZ_RESULT`
- `CLEAR_STAGE`
- `UNLOCK_TECHNIQUE`
- `DISCOVER_TERM`
- `RESET_GAME`

Reducerは純粋関数とし、localStorageへの書き込みはProvider側の副作用で行う。初回マウント前にはlocalStorageへ触れず、SSR時の`window`未定義を避ける。

### 導出値

次は保存値を増やさず、セレクタ関数で導出する。

- 次の番付までのEXP
- ステージの解放可否
- 図鑑完成率
- クイズ正答率

## 11. localStorage設計

- キー：`sumo-quest:save`
- 形式：JSON
- 現行スキーマ：`version: 1`

```ts
type SaveEnvelope = {
  version: 1;
  data: PlayerSave;
};
```

### 読み込み

1. キーの存在確認
2. JSON解析
3. バージョンと必須項目を検証
4. 不正ならデータを消さず、タイトルに復旧案内を表示
5. 将来の変更時はmigration関数を通す

### 書き込み

進行変更後に同期保存する。保存失敗時もプレイは継続させ、画面上に「進行を保存できませんでした」と通知する。

## 12. コンポーネント設計

```text
src/components/
├─ game/
│  ├─ GameShell.tsx
│  ├─ PixelWindow.tsx
│  ├─ MessageWindow.tsx
│  ├─ GameMenu.tsx
│  ├─ PlayerStatus.tsx
│  ├─ WorldMap.tsx
│  └─ RewardDialog.tsx
├─ learning/
│  ├─ LessonPlayer.tsx
│  ├─ NpcPortrait.tsx
│  └─ DiscoveryToast.tsx
├─ battle/
│  ├─ BattleScene.tsx
│  ├─ QuizQuestion.tsx
│  ├─ ChoiceList.tsx
│  ├─ BattleFeedback.tsx
│  └─ BattleResult.tsx
├─ collection/
│  ├─ TechniqueGrid.tsx
│  ├─ TechniqueCard.tsx
│  └─ DictionaryList.tsx
└─ ui/
   ├─ PixelButton.tsx
   ├─ ProgressBar.tsx
   ├─ Modal.tsx
   └─ Toast.tsx
```

ページはデータ取得と画面構成を担当し、進行ルールは`lib/game`、保存は`lib/storage`、個別表示はコンポーネントへ分離する。

## 13. 推奨ディレクトリ

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ new-game/page.tsx
│  ├─ map/page.tsx
│  ├─ stage/[stageId]/page.tsx
│  ├─ battle/[stageId]/page.tsx
│  ├─ result/[stageId]/page.tsx
│  ├─ techniques/page.tsx
│  ├─ dictionary/page.tsx
│  ├─ status/page.tsx
│  ├─ ending/page.tsx
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
├─ context/GameProvider.tsx
├─ data/
├─ hooks/useGame.ts
├─ lib/
│  ├─ game.ts
│  ├─ ranks.ts
│  ├─ storage.ts
│  └─ validation.ts
└─ types/game.ts

public/
├─ images/
│  ├─ characters/
│  ├─ maps/
│  └─ techniques/
└─ icons/
```

## 14. GitHub Pages対応

```ts
// next.config.ts
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubPages && repositoryName
  ? `/${repositoryName}`
  : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
```

アプリ内リンクにはNext.jsの`Link`を使う。画像は`basePath`を考慮するヘルパー経由、またはimportで参照する。サーバーコンポーネント依存の動的処理、API Routes、Server Actionsは使用しない。

GitHub Actionsでは依存関係を導入し、ビルド後の`out/`をPagesへ配信する。

## 15. レスポンシブ・アクセシビリティ

- 基準幅320px以上
- タップ領域は最低44×44px
- 選択状態を色だけで伝えない
- 文字と背景の十分なコントラスト
- キーボードで選択肢を移動・決定可能
- フォーカスリングを表示
- アニメーション軽減設定を尊重
- 装飾画像は空の代替テキスト、情報画像には説明を付与
- ピクセルフォントが読みにくい本文には可読性の高い代替フォントを使用可能
- 音がなくてもすべて理解できる

## 16. エラー・例外設計

- 不明なstageId：マップへ戻し、案内を表示
- 未解放ステージへの直リンク：マップへ戻す
- セーブなしでゲーム画面へ直リンク：タイトルへ戻す
- セーブ破損：破棄せず、新規開始またはデータ初期化を選べるようにする
- 保存容量不足／禁止：一時的にプレイを続け、未保存を通知
- コンテンツ設定不備：開発時に検証してビルドを失敗させる

## 17. テスト設計

### 単体テスト

- EXPから番付を算出する
- 横綱条件を判定する
- ステージを順番に解放する
- 初回報酬の二重取得を防ぐ
- セーブデータの検証・移行
- クイズ合格率の境界値

### コンポーネントテスト

- 選択肢をキーボードとタッチで選べる
- 回答後に解説が表示される
- 未解放地点が操作できない
- セーブ有無で「つづきから」の状態が変わる

### E2Eテスト

1. 新規開始からSTAGE 1クリアまで
2. 再読み込み後の続きから
3. 全6ステージと横綱到達
4. 不正解から再挑戦
5. モバイル表示
6. GitHub Pagesのサブパス配信

### コンテンツ確認

- 相撲用語と説明の正確性
- 問題に正解が一つだけあること
- 誤答解説が誤解を生まないこと
- 小学生にも読める文章量と表現

## 18. 分析イベント（任意）

プライバシーに配慮した計測を導入する場合、個人名や回答本文は送信しない。

- `game_started`
- `stage_started`
- `lesson_completed`
- `quiz_completed`（stageId、scoreのみ）
- `stage_cleared`
- `rank_promoted`
- `ending_reached`
- `collection_viewed`

## 19. 実装フェーズ

### Phase 0：土台

- Next.js／TypeScript初期化
- 静的エクスポートとGitHub Pages設定
- デザイントークン、GameShell、PixelWindow
- 型とコンテンツデータの雛形

### Phase 1：STAGE 1の縦切り

- タイトル、名前入力、初期セーブ
- マップ
- STAGE 1学習
- 取組クイズ
- リザルト、EXP、番付、再開

この時点で実機とGitHub Pages上の一連の動作を確認する。

### Phase 2：データ駆動化

- 汎用LessonPlayer、BattleScene
- STAGE 2〜5のデータ追加
- 技・用語のアンロック
- 技図鑑、用語辞典、ステータス

### Phase 3：最終ステージ

- 横綱の城
- 総合問題
- 横綱昇進条件
- エンディング

### Phase 4：品質向上

- アクセシビリティ
- モバイル調整
- エラー復旧
- アニメーション軽減
- 全テストとコンテンツ校正

## 20. MVP受け入れ条件

- 新規ユーザーが名前を入力して開始できる。
- 6ステージが順番に解放される。
- 学習、クイズ、結果、報酬のループが成立する。
- 代表的な決まり手6種類、番付、本場所、基本ルールを学べる。
- 初回報酬が重複付与されない。
- セーブ後に再読み込みして再開できる。
- 横綱は最終試験合格時のみ取得できる。
- 未解放URLへの直接アクセスで進行を飛ばせない。
- 320px幅、タッチ、キーボードで主要機能を利用できる。
- GitHub Pagesのリポジトリ配下URLでリンクと画像が壊れない。

## 21. 実装上の最重要判断

本プロジェクトの中心は複雑なゲーム処理ではなく、短い学習と即時フィードバックの反復である。したがって、最初から6ステージを並行して作らず、STAGE 1だけで「開始→学習→取組→報酬→保存→再開」を完成させる。その後は、同じ仕組みに検証済みの相撲コンテンツを追加して拡張する。
