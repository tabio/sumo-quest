// ゲーム全体で共有する型。
// 定義の根拠は設計書「8. データモデル」。ここは実装への写しである。
// 型を変える必要が出た場合は、設計書を直接書き換えず docs/plans/decisions/ にADRを追加する。

/** ステージの永続キー。表示順は order で持ち、この並びには依存しない。 */
export type StageId =
  | "sumo-stable"
  | "dohyo"
  | "dojo"
  | "banzuke-shrine"
  | "kokugikan"
  | "yokozuna-castle";

/** ステージの進行状態。learning完了と取組クリアを区別する。 */
export type StageStatus = "locked" | "unlocked" | "lessonCompleted" | "cleared";

/** 番付の永続キー。累積EXPからの導出は lib 側で行う。 */
export type RankId =
  | "jonokuchi"
  | "jonidan"
  | "sandanme"
  | "makushita"
  | "juryo"
  | "maegashira"
  | "komusubi"
  | "sekiwake"
  | "ozeki"
  | "yokozuna";

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
