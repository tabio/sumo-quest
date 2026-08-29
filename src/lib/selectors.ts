import { hasClearedFinalStage } from "@/lib/game";
import {
  experienceToNextRank,
  nextRank,
  rankFromExperience,
} from "@/lib/ranks";
import type {
  PlayerSave,
  Rank,
  Stage,
  StageId,
  StageProgress,
} from "@/types/game";

// 導出値のセレクタ。
// 設計書「10. 状態管理」の「導出値」に対応する。
//
// ここで計算する値は保存しない。保存すると更新漏れで実際の進行と食い違う。

/**
 * 現在の番付。
 * 保存されている rankId ではなくEXPから導出する。
 * 保存値と食い違う場合はEXPを正とする（設計書「11. localStorage設計」）。
 */
export function currentRank(save: PlayerSave): Rank {
  return rankFromExperience(save.experience, hasClearedFinalStage(save));
}

/** 次の番付までに必要な残りEXP。最上位では null。 */
export function experienceToNext(save: PlayerSave): number | null {
  return experienceToNextRank(save.experience);
}

/** 次の番付。最上位では null。 */
export function upcomingRank(save: PlayerSave): Rank | null {
  return nextRank(save.experience);
}

/** ステージの進行状況。未知のステージでは undefined。 */
export function stageProgressOf(
  save: PlayerSave,
  stageId: StageId,
): StageProgress | undefined {
  return save.stageProgress[stageId];
}

/** ステージが解放済みか。 */
export function isStageUnlocked(save: PlayerSave, stageId: StageId): boolean {
  return stageProgressOf(save, stageId)?.status !== "locked";
}

/** ステージがクリア済みか。 */
export function isStageCleared(save: PlayerSave, stageId: StageId): boolean {
  return stageProgressOf(save, stageId)?.status === "cleared";
}

/** 学習を終えているか。 */
export function isLessonCompleted(save: PlayerSave, stageId: StageId): boolean {
  const status = stageProgressOf(save, stageId)?.status;
  return status === "lessonCompleted" || status === "cleared";
}

/**
 * 現在地とみなすステージ。
 * 未クリアで解放済みのもののうち、最も順序が小さいものを選ぶ。
 * すべてクリア済みなら最後のステージを返す。
 */
export function currentStage(save: PlayerSave, stages: Stage[]): Stage | null {
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  if (ordered.length === 0) return null;

  const pending = ordered.find(
    (stage) =>
      isStageUnlocked(save, stage.id) && !isStageCleared(save, stage.id),
  );
  return pending ?? ordered[ordered.length - 1];
}

/** 図鑑の完成率（0〜1）。母数が0の場合は0を返す。 */
export function collectionRate(collected: number, total: number): number {
  if (total <= 0) return 0;
  return collected / total;
}

/** クイズの正答率（0〜1）。挑戦がない場合は null。 */
export function quizAccuracy(
  save: PlayerSave,
  stageId: StageId,
): number | null {
  const attempts = save.quizHistory.filter(
    (attempt) => attempt.stageId === stageId,
  );
  if (attempts.length === 0) return null;

  const latest = attempts[attempts.length - 1];
  if (latest.total <= 0) return null;
  return latest.score / latest.total;
}
