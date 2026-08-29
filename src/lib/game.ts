import { rankFromExperience } from "@/lib/ranks";
import type {
  PlayerSave,
  Quiz,
  Stage,
  StageId,
  StageProgress,
  StageStatus,
} from "@/types/game";

// ゲーム進行ルール。
// 設計書「7. ゲーム進行ルール」を実装する。
//
// ここはすべて純粋関数とし、localStorage にも React にも触れない。
// 保存は Provider 側の副作用で行う（設計書「10. 状態管理」）。
//
// 時刻を要する関数は now を引数で受け取る。
// 既定値は現在時刻だが、渡せば戻り値が入力だけで決まる。
//
// 報酬の二重付与（R-3）を防ぐ責務はこのモジュールにある。
// rewardedLessonIds / rewardedQuizIds を見て、初回だけ加点する。

/** 初回の学習完了で得られるEXP。 */
export const LESSON_REWARD_EXP = 10;

/** 初回の1問正解で得られるEXP。 */
export const QUIZ_CORRECT_REWARD_EXP = 10;

/** ステージの進行状態の順序。後退させないための比較に使う。 */
const STATUS_ORDER: StageStatus[] = [
  "locked",
  "unlocked",
  "lessonCompleted",
  "cleared",
];

function statusRank(status: StageStatus): number {
  return STATUS_ORDER.indexOf(status);
}

/**
 * 進行状態を進める。すでに先に進んでいる場合は後退させない。
 * クリア済みステージを再プレイしても locked に戻らないようにするため。
 */
export function advanceStatus(
  current: StageStatus,
  next: StageStatus,
): StageStatus {
  return statusRank(next) > statusRank(current) ? next : current;
}

/** ステージが遊べる状態か。未解放は入れない（設計書「16. エラー・例外設計」）。 */
export function isStagePlayable(progress: StageProgress | undefined): boolean {
  return progress !== undefined && progress.status !== "locked";
}

/** クイズの正答数から合格かを判定する。合格率はステージデータが持つ。 */
export function isQuizPassed(
  stage: Stage,
  score: number,
  total: number,
): boolean {
  if (total <= 0) return false;
  return score / total >= stage.passRate;
}

/** 選択肢IDが正解か。選択肢の並び順に依存しない。 */
export function isCorrectChoice(quiz: Quiz, choiceId: string): boolean {
  return quiz.correctChoiceId === choiceId;
}

/** 学習の報酬が未取得か。 */
export function isLessonRewardPending(
  save: PlayerSave,
  lessonId: string,
): boolean {
  return !save.rewardedLessonIds.includes(lessonId);
}

/** クイズの報酬が未取得か。 */
export function isQuizRewardPending(save: PlayerSave, quizId: string): boolean {
  return !save.rewardedQuizIds.includes(quizId);
}

function updateStage(
  save: PlayerSave,
  stageId: StageId,
  update: (progress: StageProgress) => StageProgress,
): PlayerSave["stageProgress"] {
  const current = save.stageProgress[stageId];
  if (!current) return save.stageProgress;
  return { ...save.stageProgress, [stageId]: update(current) };
}

/** EXPを加算し、番付を再導出したセーブを返す。 */
function withExperience(save: PlayerSave, gained: number): PlayerSave {
  const experience = save.experience + gained;
  return {
    ...save,
    experience,
    // 番付は常にEXPから導出する。保存値は表示用の写しに過ぎない。
    rankId: rankFromExperience(experience, hasClearedFinalStage(save)).id,
  };
}

/** 最終ステージをクリア済みか。横綱の判定に使う。 */
export function hasClearedFinalStage(save: PlayerSave): boolean {
  return save.stageProgress["yokozuna-castle"]?.status === "cleared";
}

/**
 * 学習を完了する。
 * 初回のみEXPを加算し、報酬済みとして記録する。
 */
export function completeLesson(
  save: PlayerSave,
  stageId: StageId,
  lessonId: string,
): PlayerSave {
  const first = isLessonRewardPending(save, lessonId);
  const gained = first ? LESSON_REWARD_EXP : 0;

  const next: PlayerSave = {
    ...save,
    stageProgress: updateStage(save, stageId, (progress) => ({
      ...progress,
      status: advanceStatus(progress.status, "lessonCompleted"),
    })),
    rewardedLessonIds: first
      ? [...save.rewardedLessonIds, lessonId]
      : save.rewardedLessonIds,
  };

  return withExperience(next, gained);
}

export type QuizResult = {
  quizId: string;
  correct: boolean;
  /** 正解したときに習得する技。クイズデータから引いて渡す。 */
  techniqueId?: string;
  /** その問題で扱った用語。クイズデータから引いて渡す。 */
  termIds?: string[];
};

/**
 * 取組で出会った用語と、正解して覚えた技を反映する。
 *
 * 用語は正誤にかかわらず登録する。
 * 誤答でも解説で説明を読むため、PRD「9. コレクション」の
 * 「出会った用語を自動登録する」にあたる。
 *
 * 技は正解した問題のものだけとする。
 * 覚えたという手応えを、正解と結び付けておくため。
 */
export function applyQuizDiscoveries(
  save: PlayerSave,
  results: QuizResult[],
): PlayerSave {
  const techniqueIds = results
    .filter((result) => result.correct)
    .flatMap((result) => (result.techniqueId ? [result.techniqueId] : []));
  const termIds = results.flatMap((result) => result.termIds ?? []);

  return discoverTerms(learnTechniques(save, techniqueIds), termIds);
}

/**
 * 取組の結果を記録する。
 * 正解した問題のうち、報酬が未取得のものだけを加点する。
 */
export function recordQuizResults(
  save: PlayerSave,
  stageId: StageId,
  results: QuizResult[],
  now: string = new Date().toISOString(),
): PlayerSave {
  const newlyRewarded = results
    .filter(
      (result) => result.correct && isQuizRewardPending(save, result.quizId),
    )
    .map((result) => result.quizId);

  // 同じ問題が複数回渡されても一度しか加点しない。
  const uniqueRewarded = [...new Set(newlyRewarded)];
  const gained = uniqueRewarded.length * QUIZ_CORRECT_REWARD_EXP;
  const score = results.filter((result) => result.correct).length;

  const next: PlayerSave = {
    ...save,
    stageProgress: updateStage(save, stageId, (progress) => ({
      ...progress,
      attempts: progress.attempts + 1,
      bestScore: Math.max(progress.bestScore, score),
    })),
    rewardedQuizIds: [...save.rewardedQuizIds, ...uniqueRewarded],
    quizHistory: [
      ...save.quizHistory,
      {
        stageId,
        score,
        total: results.length,
        answeredAt: now,
      },
    ],
  };

  return withExperience(next, gained);
}

/**
 * ステージをクリアし、次のステージを解放する。
 * 初回クリアのみクリア報酬EXPを加算する。
 */
export function clearStage(
  save: PlayerSave,
  stage: Stage,
  now: string = new Date().toISOString(),
): PlayerSave {
  const current = save.stageProgress[stage.id];
  const firstClear = current?.status !== "cleared";

  let stageProgress = updateStage(save, stage.id, (progress) => ({
    ...progress,
    status: "cleared",
    clearedAt: progress.clearedAt ?? now,
  }));

  // 次のステージを解放する。すでに進んでいる場合は後退させない。
  const unlocks = stage.unlocks;
  if (unlocks && stageProgress[unlocks]) {
    stageProgress = {
      ...stageProgress,
      [unlocks]: {
        ...stageProgress[unlocks],
        status: advanceStatus(stageProgress[unlocks].status, "unlocked"),
      },
    };
  }

  const next: PlayerSave = { ...save, stageProgress };
  return withExperience(next, firstClear ? stage.clearRewardExp : 0);
}

/** 技を習得する。すでに習得済みなら何もしない。 */
export function learnTechniques(
  save: PlayerSave,
  techniqueIds: string[],
): PlayerSave {
  const added = techniqueIds.filter(
    (id) => !save.learnedTechniqueIds.includes(id),
  );
  if (added.length === 0) return save;
  return {
    ...save,
    learnedTechniqueIds: [...save.learnedTechniqueIds, ...added],
  };
}

/** 用語を発見する。すでに発見済みなら何もしない。 */
export function discoverTerms(save: PlayerSave, termIds: string[]): PlayerSave {
  const added = termIds.filter((id) => !save.discoveredTermIds.includes(id));
  if (added.length === 0) return save;
  return {
    ...save,
    discoveredTermIds: [...save.discoveredTermIds, ...added],
  };
}
