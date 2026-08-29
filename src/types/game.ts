// ゲーム全体で共有する型。
// 定義の根拠は設計書「8. データモデル」。ここは実装への写しである。
// 型を変える必要が出た場合は、設計書を直接書き換えず docs/plans/decisions/ にADRを追加する。

/** ステージの永続キーの一覧。セーブデータの検証で実体が必要になるため定数で持つ。 */
export const STAGE_IDS = [
  "sumo-stable",
  "dohyo",
  "dojo",
  "banzuke-shrine",
  "kokugikan",
  "yokozuna-castle",
] as const;

/** ステージの永続キー。表示順は order で持ち、この並びには依存しない。 */
export type StageId = (typeof STAGE_IDS)[number];

/** ステージの進行状態。learning完了と取組クリアを区別する。 */
export type StageStatus = "locked" | "unlocked" | "lessonCompleted" | "cleared";

/** 番付の永続キーの一覧。下位から昇順。 */
export const RANK_IDS = [
  "jonokuchi",
  "jonidan",
  "sandanme",
  "makushita",
  "juryo",
  "maegashira",
  "komusubi",
  "sekiwake",
  "ozeki",
  "yokozuna",
] as const;

/** 番付の永続キー。累積EXPからの導出は lib 側で行う。 */
export type RankId = (typeof RANK_IDS)[number];

/** localStorage に保存するセーブデータ。version は移行判定に使う。 */
export type PlayerSave = {
  version: 1;
  playerName: string;
  experience: number;
  rankId: RankId;
  stageProgress: Record<StageId, StageProgress>;
  learnedTechniqueIds: string[];
  discoveredTermIds: string[];
  /** 報酬を付与済みの学習ID。二重付与を防ぐために持つ。 */
  rewardedLessonIds: string[];
  /** 報酬を付与済みのクイズID。二重付与を防ぐために持つ。 */
  rewardedQuizIds: string[];
  quizHistory: QuizAttempt[];
  createdAt: string;
  updatedAt: string;
};

export type StageProgress = {
  status: StageStatus;
  bestScore: number;
  attempts: number;
  clearedAt?: string;
};

export type Stage = {
  id: StageId;
  /** 表示順。配列の位置ではなくこの値を正とする。 */
  order: number;
  name: string;
  theme: string;
  npcId: string;
  lessonIds: string[];
  quizIds: string[];
  /** 合格に必要な正答率。値は設計書「7. ゲーム進行ルール」を正とする。 */
  passRate: number;
  clearRewardExp: number;
  unlocks?: StageId;
};

export type Lesson = {
  id: string;
  stageId: StageId;
  speakerId: string;
  /** 1画面1メッセージで表示する。 */
  messages: string[];
  rewardExp: number;
  unlockTechniqueIds?: string[];
  discoverTermIds?: string[];
};

export type QuizChoice = {
  id: string;
  label: string;
};

export type Quiz = {
  id: string;
  stageId: StageId;
  question: string;
  choices: QuizChoice[];
  /** 正解は選択肢の番号ではなくIDで持ち、並べ替えに耐えられるようにする。 */
  correctChoiceId: string;
  explanation: string;
  rewardExp: number;
  techniqueId?: string;
  termIds?: string[];
};

export type QuizAttempt = {
  stageId: StageId;
  score: number;
  total: number;
  answeredAt: string;
};

// 以下の4つは設計書「8. データモデル」に定義がない。
// 設計書「9. コンテンツデータ」が要求するファイルに対応させるため、ここで補っている。
// 経緯は docs/plans/decisions/0003-master-data-types.md を参照。

/** 技の難易度。1がやさしく、3がむずかしい。 */
export type TechniqueDifficulty = 1 | 2 | 3;

export type Technique = {
  id: string;
  /** 決まり手の名称。 */
  name: string;
  reading: string;
  description: string;
  /** 技図鑑に掲載する難易度（PRD「9. コレクション」）。経緯は ADR-0006。 */
  difficulty: TechniqueDifficulty;
};

export type Term = {
  id: string;
  /** 相撲用語。 */
  name: string;
  reading: string;
  description: string;
};

export type Npc = {
  id: string;
  name: string;
  /** public/images/characters/ 配下の相対パス。解決はパスヘルパーが行う。 */
  portraitPath: string;
};

export type Rank = {
  id: RankId;
  /** 表示名。例：序ノ口。 */
  name: string;
  /** 番付の並び。下位から昇順。 */
  order: number;
  /** 昇進に必要な累積EXP。値は設計書「7. ゲーム進行ルール」を正とする。 */
  requiredExperience: number;
  /** 横綱のみ true。EXPを満たしても最終試験クリアまで昇進しない。 */
  requiresFinalExam?: boolean;
};
