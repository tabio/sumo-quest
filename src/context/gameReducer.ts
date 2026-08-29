import {
  clearStage,
  completeLesson,
  discoverTerms,
  learnTechniques,
  recordQuizResults,
  type QuizResult,
} from "@/lib/game";
import { rankFromExperience } from "@/lib/ranks";
import { SAVE_VERSION, type SaveErrorReason } from "@/lib/validation";
import {
  STAGE_IDS,
  type PlayerSave,
  type Stage,
  type StageId,
} from "@/types/game";

// ゲーム状態のReducer。
// 設計書「10. 状態管理」の8アクションを実装する。
//
// Reducerは純粋関数とする。localStorage への書き込みは Provider の副作用で行う。
// 時刻に依存する処理は、アクションの payload で now を受け取る。

/** 保存の読み込み状況。画面の出し分けに使う。 */
export type SaveStatus =
  /** まだ読み込んでいない（初回マウント前）。 */
  | { kind: "loading" }
  /** 保存がない。 */
  | { kind: "empty" }
  /** 読み込み済み。 */
  | { kind: "ready" }
  /** 保存はあるが読めない。消さずに案内を出す。 */
  | { kind: "corrupted"; reason: SaveErrorReason }
  /** localStorage が使えない。プレイは継続する。 */
  | { kind: "unavailable" };

export type GameState = {
  save: PlayerSave | null;
  status: SaveStatus;
  /** 直近の保存に失敗したか。画面で「保存できませんでした」を出す。 */
  saveFailed: boolean;
};

export const initialGameState: GameState = {
  save: null,
  status: { kind: "loading" },
  saveFailed: false,
};

export type GameAction =
  | { type: "START_NEW_GAME"; playerName: string; now: string }
  | { type: "LOAD_GAME"; result: LoadedResult }
  | {
      type: "COMPLETE_LESSON";
      stageId: StageId;
      lessonId: string;
      techniqueIds: string[];
      termIds: string[];
    }
  | {
      type: "RECORD_QUIZ_RESULT";
      stageId: StageId;
      results: QuizResult[];
      now: string;
    }
  | { type: "CLEAR_STAGE"; stage: Stage; now: string }
  | { type: "UNLOCK_TECHNIQUE"; techniqueIds: string[] }
  | { type: "DISCOVER_TERM"; termIds: string[] }
  | { type: "RESET_GAME" }
  | { type: "SAVE_FAILED" }
  | { type: "SAVE_SUCCEEDED" };

/** loadSave の結果を、Reducerが受け取れる形にしたもの。 */
export type LoadedResult =
  | { status: "empty" }
  | { status: "loaded"; data: PlayerSave }
  | { status: "corrupted"; reason: SaveErrorReason }
  | { status: "unavailable" };

/** 新規プレイヤーのセーブデータを作る。 */
export function createInitialSave(playerName: string, now: string): PlayerSave {
  const stageProgress = Object.fromEntries(
    STAGE_IDS.map((stageId, index) => [
      stageId,
      {
        // STAGE 1 だけが初期状態で unlocked（設計書「7.」）。
        status: index === 0 ? "unlocked" : "locked",
        bestScore: 0,
        attempts: 0,
      },
    ]),
  ) as PlayerSave["stageProgress"];

  return {
    version: SAVE_VERSION,
    playerName,
    experience: 0,
    rankId: rankFromExperience(0).id,
    stageProgress,
    learnedTechniqueIds: [],
    discoveredTermIds: [],
    rewardedLessonIds: [],
    rewardedQuizIds: [],
    quizHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** セーブを更新するアクションの共通処理。save が無い場合は何もしない。 */
function withSave(
  state: GameState,
  update: (save: PlayerSave) => PlayerSave,
): GameState {
  if (!state.save) return state;
  const next = update(state.save);
  if (next === state.save) return state;
  return { ...state, save: next };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_NEW_GAME":
      return {
        save: createInitialSave(action.playerName, action.now),
        status: { kind: "ready" },
        saveFailed: false,
      };

    case "LOAD_GAME": {
      const { result } = action;
      switch (result.status) {
        case "loaded":
          return {
            save: result.data,
            status: { kind: "ready" },
            saveFailed: false,
          };
        case "empty":
          return { save: null, status: { kind: "empty" }, saveFailed: false };
        case "corrupted":
          return {
            // 破損データは消さない。読み込まないだけにする。
            save: null,
            status: { kind: "corrupted", reason: result.reason },
            saveFailed: false,
          };
        case "unavailable":
          return {
            save: null,
            status: { kind: "unavailable" },
            saveFailed: false,
          };
      }
    }

    case "COMPLETE_LESSON":
      return withSave(state, (save) => {
        const afterLesson = completeLesson(
          save,
          action.stageId,
          action.lessonId,
        );
        const afterTechniques = learnTechniques(
          afterLesson,
          action.techniqueIds,
        );
        return discoverTerms(afterTechniques, action.termIds);
      });

    case "RECORD_QUIZ_RESULT":
      return withSave(state, (save) =>
        recordQuizResults(save, action.stageId, action.results, action.now),
      );

    case "CLEAR_STAGE":
      return withSave(state, (save) =>
        clearStage(save, action.stage, action.now),
      );

    case "UNLOCK_TECHNIQUE":
      return withSave(state, (save) =>
        learnTechniques(save, action.techniqueIds),
      );

    case "DISCOVER_TERM":
      return withSave(state, (save) => discoverTerms(save, action.termIds));

    case "RESET_GAME":
      return { save: null, status: { kind: "empty" }, saveFailed: false };

    case "SAVE_FAILED":
      return state.saveFailed ? state : { ...state, saveFailed: true };

    case "SAVE_SUCCEEDED":
      return state.saveFailed ? { ...state, saveFailed: false } : state;
  }
}
