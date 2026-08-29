import { describe, expect, it } from "vitest";
import { shuffle, shuffleQuizChoices } from "@/lib/shuffle";
import type { Quiz } from "@/types/game";

// 選択肢のランダム化（ADR-0010）。
// 乱数源を差し替えて、並びが入力だけで決まる状態で確かめる。

/** 0,1,2,... を順に返す乱数源。並びを固定するために使う。 */
function sequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

const quiz: Quiz = {
  id: "quiz-1",
  stageId: "sumo-stable",
  question: "土俵とは？",
  choices: [
    { id: "a", label: "取組を行う場所" },
    { id: "b", label: "力士の帯" },
    { id: "c", label: "行司のうちわ" },
  ],
  correctChoiceId: "a",
  explanation: "正解は取組を行う場所。",
  rewardExp: 10,
};

describe("shuffle", () => {
  it("元の配列を変更しない", () => {
    const items = [1, 2, 3];
    shuffle(items, sequence([0]));
    expect(items).toEqual([1, 2, 3]);
  });

  it("要素を失わず、重複もさせない", () => {
    const items = ["a", "b", "c", "d", "e"];
    const result = shuffle(items, sequence([0.1, 0.7, 0.3, 0.9]));
    expect([...result].sort()).toEqual([...items].sort());
  });

  it("乱数源が同じなら並びも同じになる", () => {
    const items = ["a", "b", "c", "d"];
    const values = [0.42, 0.11, 0.87, 0.35];
    expect(shuffle(items, sequence(values))).toEqual(
      shuffle(items, sequence(values)),
    );
  });

  it("要素が1個以下でもそのまま返す", () => {
    expect(shuffle([], sequence([0]))).toEqual([]);
    expect(shuffle(["a"], sequence([0]))).toEqual(["a"]);
  });
});

describe("shuffleQuizChoices", () => {
  it("選択肢の並びを変える", () => {
    // Fisher-Yates は末尾から入れ替える。常に0を返すと先頭へ寄る。
    const result = shuffleQuizChoices(quiz, sequence([0]));
    expect(result.choices.map((choice) => choice.id)).not.toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("選択肢を失わない", () => {
    const result = shuffleQuizChoices(quiz, sequence([0.5, 0.2]));
    expect(result.choices.map((choice) => choice.id).sort()).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("問題文と正解は変えない", () => {
    const result = shuffleQuizChoices(quiz, sequence([0.5, 0.2]));
    expect(result.id).toBe(quiz.id);
    expect(result.question).toBe(quiz.question);
    expect(result.correctChoiceId).toBe(quiz.correctChoiceId);
    expect(result.explanation).toBe(quiz.explanation);
  });

  it("元のクイズを変更しない", () => {
    shuffleQuizChoices(quiz, sequence([0]));
    expect(quiz.choices.map((choice) => choice.id)).toEqual(["a", "b", "c"]);
  });
});
