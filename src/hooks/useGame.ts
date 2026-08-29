"use client";

import { useContext, useMemo } from "react";
import { GameContext, type GameContextValue } from "@/context/GameProvider";
import {
  collectionRate,
  currentRank,
  currentStage,
  experienceToNext,
  isAtHighestRank,
  isLessonCompleted,
  isStageCleared,
  isStageUnlocked,
  quizAccuracy,
  stageProgressOf,
  upcomingRank,
} from "@/lib/selectors";
import { stages } from "@/data/stages";
import { techniques } from "@/data/techniques";
import { terms } from "@/data/terms";
import type { Rank, Stage, StageId, StageProgress } from "@/types/game";

// ゲーム状態への入り口。
// 設計書「10. 状態管理」の導出値を、保存値を増やさずに返す。
//
// 画面は state を直接読まず、このフック経由で必要な値だけを取る。

export type UseGameValue = GameContextValue & {
  /** 保存の読み込みが済んでいるか。 */
  isReady: boolean;
  /** 続きから遊べるセーブがあるか。 */
  hasSave: boolean;
  /** 現在の番付。セーブがない場合は null。 */
  rank: Rank | null;
  /** 次の番付。最上位またはセーブなしでは null。 */
  nextRank: Rank | null;
  /** 次の番付までの残りEXP。最上位またはセーブなしでは null。 */
  experienceToNextRank: number | null;
  /** 最高位（横綱）に到達しているか。 */
  isTopRank: boolean;
  /** 現在地とみなすステージ。 */
  currentStage: Stage | null;
  /** 技図鑑の完成率（0〜1）。 */
  techniqueCollectionRate: number;
  /** 用語辞典の完成率（0〜1）。 */
  termCollectionRate: number;
  progressOf: (stageId: StageId) => StageProgress | undefined;
  isUnlocked: (stageId: StageId) => boolean;
  isCleared: (stageId: StageId) => boolean;
  isLessonDone: (stageId: StageId) => boolean;
  accuracyOf: (stageId: StageId) => number | null;
};

export function useGame(): UseGameValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame は GameProvider の内側で使うこと");
  }

  const { state } = context;
  const save = state.save;

  return useMemo<UseGameValue>(() => {
    return {
      ...context,
      isReady: state.status.kind !== "loading",
      hasSave: save !== null,
      rank: save ? currentRank(save) : null,
      nextRank: save ? upcomingRank(save) : null,
      experienceToNextRank: save ? experienceToNext(save) : null,
      isTopRank: save ? isAtHighestRank(save) : false,
      currentStage: save ? currentStage(save, stages) : null,
      techniqueCollectionRate: save
        ? collectionRate(save.learnedTechniqueIds.length, techniques.length)
        : 0,
      termCollectionRate: save
        ? collectionRate(save.discoveredTermIds.length, terms.length)
        : 0,
      progressOf: (stageId) =>
        save ? stageProgressOf(save, stageId) : undefined,
      isUnlocked: (stageId) => (save ? isStageUnlocked(save, stageId) : false),
      isCleared: (stageId) => (save ? isStageCleared(save, stageId) : false),
      isLessonDone: (stageId) =>
        save ? isLessonCompleted(save, stageId) : false,
      accuracyOf: (stageId) => (save ? quizAccuracy(save, stageId) : null),
    };
  }, [context, save, state.status.kind]);
}
