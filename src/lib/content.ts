import { lessons } from "@/data/lessons";
import { npcs } from "@/data/npcs";
import { quizzes } from "@/data/quizzes";
import { stages } from "@/data/stages";
import { techniques } from "@/data/techniques";
import { terms } from "@/data/terms";
import type {
  Lesson,
  Npc,
  Quiz,
  Stage,
  StageId,
  Technique,
  Term,
} from "@/types/game";

// コンテンツデータの参照。
// 画面が data/ を直接 find する処理を各所に書かないよう、ここへ集約する。

export function findStage(stageId: string): Stage | undefined {
  return stages.find((stage) => stage.id === stageId);
}

export function findNpc(npcId: string): Npc | undefined {
  return npcs.find((npc) => npc.id === npcId);
}

export function findTechnique(techniqueId: string): Technique | undefined {
  return techniques.find((technique) => technique.id === techniqueId);
}

export function findTerm(termId: string): Term | undefined {
  return terms.find((term) => term.id === termId);
}

/**
 * 発見済みの用語を五十音順で返す（PRD「9. コレクション」）。
 * 未発見のものは含めない。
 *
 * 並べ替えは読みで行う。表記には漢字が混ざるため、
 * 見出しの文字コード順では五十音順にならない。
 */
export function discoveredTerms(discoveredTermIds: string[]): Term[] {
  const discovered = new Set(discoveredTermIds);
  return terms
    .filter((term) => discovered.has(term.id))
    .sort((a, b) => a.reading.localeCompare(b.reading, "ja"));
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

/** 最終ステージ。order が最も大きいものを正とする。 */
export function finalStage(): Stage {
  return [...stages].sort((a, b) => b.order - a.order)[0];
}

/** 静的エクスポート用に全ステージIDを返す。 */
export function allStageIds(): StageId[] {
  return stages.map((stage) => stage.id);
}
