import { describe, expect, it } from "vitest";
import { STAGE_IDS } from "@/types/game";
import { lessons } from "./lessons";
import { npcs } from "./npcs";
import { quizzes } from "./quizzes";
import { stages } from "./stages";
import { techniques } from "./techniques";
import { terms } from "./terms";

// STAGE 1 のコンテンツ検証。
// P1-15 の完了条件「正解が一つだけ存在し、誤答解説が誤解を生まない」のうち、
// 機械で確かめられる部分を押さえる。
// 全ステージを対象にしたビルド時検証は P2-12 で行う（testing.md）。
// 文章の妥当性は人手での校正（P4-10）に委ねる。

const ids = (items: { id: string }[]) => new Set(items.map((item) => item.id));

const termIds = ids(terms);
const techniqueIds = ids(techniques);
const npcIds = ids(npcs);
const lessonIds = ids(lessons);
const quizIds = ids(quizzes);

describe("ステージ", () => {
  it("STAGE 1 が定義されている", () => {
    expect(stages.map((stage) => stage.id)).toEqual(["sumo-stable"]);
  });

  it.each(stages)("$name が参照するNPCが存在する", (stage) => {
    expect(npcIds.has(stage.npcId)).toBe(true);
  });

  it.each(stages)("$name が参照する学習が存在する", (stage) => {
    for (const lessonId of stage.lessonIds) {
      expect(lessonIds.has(lessonId)).toBe(true);
    }
  });

  it.each(stages)("$name が参照するクイズが存在する", (stage) => {
    for (const quizId of stage.quizIds) {
      expect(quizIds.has(quizId)).toBe(true);
    }
  });

  it.each(stages)("$name の解放先が実在するステージである", (stage) => {
    if (stage.unlocks === undefined) return;
    expect(STAGE_IDS).toContain(stage.unlocks);
  });

  it.each(stages)("$name の合格率が0より大きく1以下である", (stage) => {
    expect(stage.passRate).toBeGreaterThan(0);
    expect(stage.passRate).toBeLessThanOrEqual(1);
  });
});

describe("学習", () => {
  it.each(lessons)("$id が空でないメッセージを持つ", (lesson) => {
    expect(lesson.messages.length).toBeGreaterThan(0);
    for (const message of lesson.messages) {
      expect(message.trim()).not.toBe("");
    }
  });

  it.each(lessons)("$id の話者が存在する", (lesson) => {
    expect(npcIds.has(lesson.speakerId)).toBe(true);
  });

  it.each(lessons)("$id が参照する用語と技が存在する", (lesson) => {
    for (const termId of lesson.discoverTermIds ?? []) {
      expect(termIds.has(termId)).toBe(true);
    }
    for (const techniqueId of lesson.unlockTechniqueIds ?? []) {
      expect(techniqueIds.has(techniqueId)).toBe(true);
    }
  });
});

describe("クイズ", () => {
  it("STAGE 1 のクイズが5問ある", () => {
    expect(
      quizzes.filter((quiz) => quiz.stageId === "sumo-stable"),
    ).toHaveLength(5);
  });

  it.each(quizzes)("$id の正解が選択肢の中にちょうど一つある", (quiz) => {
    const matched = quiz.choices.filter(
      (choice) => choice.id === quiz.correctChoiceId,
    );
    expect(matched).toHaveLength(1);
  });

  it.each(quizzes)("$id の選択肢IDが重複しない", (quiz) => {
    const choiceIds = quiz.choices.map((choice) => choice.id);
    expect(new Set(choiceIds).size).toBe(choiceIds.length);
  });

  it.each(quizzes)("$id の選択肢が2〜4個である", (quiz) => {
    // 設計書「6.5 取組」。
    expect(quiz.choices.length).toBeGreaterThanOrEqual(2);
    expect(quiz.choices.length).toBeLessThanOrEqual(4);
  });

  it.each(quizzes)("$id の選択肢の表示が重複しない", (quiz) => {
    const labels = quiz.choices.map((choice) => choice.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it.each(quizzes)("$id に解説がある", (quiz) => {
    // 不正解のまま進ませないため、解説は必須とする（設計書「6.5」）。
    expect(quiz.explanation.trim()).not.toBe("");
  });

  it.each(quizzes)("$id が参照する用語と技が存在する", (quiz) => {
    for (const termId of quiz.termIds ?? []) {
      expect(termIds.has(termId)).toBe(true);
    }
    if (quiz.techniqueId !== undefined) {
      expect(techniqueIds.has(quiz.techniqueId)).toBe(true);
    }
  });

  it.each(quizzes)("$id が実在するステージに属する", (quiz) => {
    expect(ids(stages).has(quiz.stageId)).toBe(true);
  });
});

describe("用語と技", () => {
  it.each(terms)("$id に読みと説明がある", (term) => {
    expect(term.reading.trim()).not.toBe("");
    expect(term.description.trim()).not.toBe("");
  });

  it.each(techniques)("$id に読みと説明がある", (technique) => {
    expect(technique.reading.trim()).not.toBe("");
    expect(technique.description.trim()).not.toBe("");
  });
});
