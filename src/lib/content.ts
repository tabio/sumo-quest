import { lessons } from "@/data/lessons";
import { npcs } from "@/data/npcs";
import { quizzes } from "@/data/quizzes";
import { stages } from "@/data/stages";
import type { Lesson, Npc, Quiz, Stage, StageId } from "@/types/game";

// コンテンツデータの参照。
// 画面が data/ を直接 find する処理を各所に書かないよう、ここへ集約する。

export function findStage(stageId: string): Stage | undefined {
  return stages.find((stage) => stage.id === stageId);
}

export function findNpc(npcId: string): Npc | undefined {
  return npcs.find((npc) => npc.id === npcId);
}

/** ステージの学習を、ステージデータの並び順で取得する。 */
export function lessonsOfStage(stage: Stage): Lesson[] {
  return stage.lessonIds
    .map((lessonId) => lessons.find((lesson) => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

/** ステージのクイズを、ステージデータの並び順で取得する。 */
export function quizzesOfStage(stage: Stage): Quiz[] {
  return stage.quizIds
    .map((quizId) => quizzes.find((quiz) => quiz.id === quizId))
    .filter((quiz): quiz is Quiz => quiz !== undefined);
}

/** ステージに遊べる中身があるか。準備中の地点を判別する。 */
export function hasContent(stage: Stage): boolean {
  return lessonsOfStage(stage).length > 0;
}

/** 静的エクスポート用に全ステージIDを返す。 */
export function allStageIds(): StageId[] {
  return stages.map((stage) => stage.id);
}
