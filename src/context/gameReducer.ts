import {
  applyQuizDiscoveries,
  clearStage,
  completeLesson,
  discoverTerms,
  isQuizPassed,
  learnTechniques,
  recordQuizResults,
  type QuizResult,
} from "@/lib/game";
import { rankFromExperience } from "@/lib/ranks";
import { currentRank } from "@/lib/selectors";
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

/**
 * 直近の取組の結果。リザルト画面の表示にだけ使う。
 * セーブには保存しない。再読み込みで消えてよい（ADR-0004）。
 */
export type BattleSummary = {
  stageId: StageId;
  stageName: string;
  score: number;
  total: number;
  passed: boolean;
  gainedExperience: number;
  rankBefore: string;
  rankAfter: string;
  promoted: boolean;
  newTechniqueIds: string[];
  newTermIds: string[];
  unlockedStageId?: StageId;
};

export type GameState = {
  save: PlayerSave | null;
  status: SaveStatus;
  /** 直近の保存に失敗したか。画面で「保存できませんでした」を出す。 */
  saveFailed: boolean;
  /** 直近の取組の結果。リザルト画面が読む。 */
  lastBattle: BattleSummary | null;
};

export const initialGameState: GameState = {
  save: null,
  status: { kind: "loading" },
  saveFailed: false,
  lastBattle: null,
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
  | { type: "FINISH_BATTLE"; stage: Stage; results: QuizResult[]; now: string }
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
        lastBattle: null,
      };

    case "LOAD_GAME": {
      const { result } = action;
      switch (result.status) {
        case "loaded":
          return {
            save: result.data,
            status: { kind: "ready" },
            saveFailed: false,
            lastBattle: null,
          };
        case "empty":
          return {
            save: null,
            status: { kind: "empty" },
            saveFailed: false,
            lastBattle: null,
          };
        case "corrupted":
          return {
            // 破損データは消さない。読み込まないだけにする。
            save: null,
            status: { kind: "corrupted", reason: result.reason },
            saveFailed: false,
            lastBattle: null,
          };
        case "unavailable":
          return {
            save: null,
            status: { kind: "unavailable" },
            saveFailed: false,
            lastBattle: null,
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

    case "FINISH_BATTLE": {
      if (!state.save) return state;

      const { stage, results, now } = action;
      const before = state.save;
      const score = results.filter((result) => result.correct).length;
      const passed = isQuizPassed(stage, score, results.length);

      const recorded = recordQuizResults(before, stage.id, results, now);
      // 出会った用語と覚えた技も、報酬と同じ時点で反映する（ADR-0004）。
      const discovered = applyQuizDiscoveries(recorded, results);
      const after = passed ? clearStage(discovered, stage, now) : discovered;

      return {
        ...state,
        save: after,
        lastBattle: {
          stageId: stage.id,
          stageName: stage.name,
          score,
          total: results.length,
          passed,
          gainedExperience: after.experience - before.experience,
          rankBefore: currentRank(before).name,
          rankAfter: currentRank(after).name,
          promoted: currentRank(before).id !== currentRank(after).id,
          newTechniqueIds: after.learnedTechniqueIds.filter(
            (id) => !before.learnedTechniqueIds.includes(id),
          ),
          newTermIds: after.discoveredTermIds.filter(
            (id) => !before.discoveredTermIds.includes(id),
          ),
          unlockedStageId:
            passed &&
            stage.unlocks &&
            before.stageProgress[stage.unlocks]?.status === "locked"
              ? stage.unlocks
              : undefined,
        },
      };
    }

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
      return {
        save: null,
        status: { kind: "empty" },
        saveFailed: false,
        lastBattle: null,
      };

    case "SAVE_FAILED":
      return state.saveFailed ? state : { ...state, saveFailed: true };

    case "SAVE_SUCCEEDED":
      return state.saveFailed ? { ...state, saveFailed: false } : state;
  }
}
