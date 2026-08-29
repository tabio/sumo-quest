import { describe, expect, it } from "vitest";
import { collectContentProblems } from "@/lib/contentIntegrity";
import { lessons } from "./lessons";
import { npcs } from "./npcs";
import { quizzes } from "./quizzes";
import { stages } from "./stages";
import { techniques } from "./techniques";
import { terms } from "./terms";

// 実データの検証。
//
// 参照切れIDや正解の不整合といった横断的な規則は
// src/lib/contentIntegrity.ts を正とし、ここでは実データを通すだけにする。
// 同じ規則をテストとビルド前チェックの双方に書くと、片方だけ緩む（P2-12）。
//
// この分量と表現が小学生向けとして妥当かは、人手での校正に委ねる（P4-10）。

describe("コンテンツデータの整合", () => {
  it("検証で問題が出ない", () => {
    const problems = collectContentProblems({
      stages,
      lessons,
      quizzes,
      techniques,
      terms,
      npcs,
    });
    expect(problems).toEqual([]);
  });
});

// 以下はフェーズごとの投入状況に対する検査。
// 横断的な規則ではないため、contentIntegrity には置かない。

describe("ステージの投入状況", () => {
  it("6地点が定義されている", () => {
    expect(stages).toHaveLength(6);
  });

  it("コンテンツが入っているのは STAGE 1 のみ", () => {
    // STAGE 2以降は P2-4〜P2-7 と Phase 3 で投入する。
    const withContent = stages.filter((stage) => stage.lessonIds.length > 0);
    expect(withContent.map((stage) => stage.id)).toEqual(["sumo-stable"]);
  });

  it("STAGE 1 のクイズが5問ある", () => {
    expect(
      quizzes.filter((quiz) => quiz.stageId === "sumo-stable"),
    ).toHaveLength(5);
  });
});
