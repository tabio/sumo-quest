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

  it("全6地点にコンテンツが入っている", () => {
    const withContent = stages.filter(
      (stage) => stage.lessonIds.length > 0 && stage.quizIds.length > 0,
    );
    expect(withContent).toHaveLength(stages.length);
  });

  it("MVPで扱う決まり手が6種類そろっている", () => {
    // PRD「7. 学習ステージ」STAGE 3。
    expect(techniques).toHaveLength(6);
  });

  it.each(["sumo-stable", "dohyo", "dojo", "banzuke-shrine", "kokugikan"])(
    "%s のクイズが5問ある",
    (stageId) => {
      expect(quizzes.filter((quiz) => quiz.stageId === stageId)).toHaveLength(
        5,
      );
    },
  );
});

describe("最終試験", () => {
  const finalStage = [...stages].sort((a, b) => b.order - a.order)[0];
  const finalQuizzes = quizzes.filter((quiz) => quiz.stageId === finalStage.id);

  it("10問ある", () => {
    expect(finalQuizzes).toHaveLength(10);
  });

  it("合格率が他のステージより高い", () => {
    // 設計書「7. ゲーム進行ルール」。最終試験だけ高くする。
    const others = stages.filter((stage) => stage.id !== finalStage.id);
    for (const stage of others) {
      expect(finalStage.passRate).toBeGreaterThan(stage.passRate);
    }
  });

  it("全ステージの範囲から出題される", () => {
    // どのステージの用語・技かは、それを最初に登場させた学習から辿る。
    const sourceOf = new Map<string, string>();
    for (const lesson of lessons) {
      for (const id of [
        ...(lesson.discoverTermIds ?? []),
        ...(lesson.unlockTechniqueIds ?? []),
      ]) {
        if (!sourceOf.has(id)) sourceOf.set(id, lesson.stageId);
      }
    }

    const covered = new Set(
      finalQuizzes
        .flatMap((quiz) => [
          ...(quiz.termIds ?? []),
          ...(quiz.techniqueId ? [quiz.techniqueId] : []),
        ])
        .map((id) => sourceOf.get(id))
        .filter((stageId): stageId is string => stageId !== undefined),
    );

    const earlier = stages
      .filter((stage) => stage.order < finalStage.order)
      .map((stage) => stage.id);
    expect([...covered].sort()).toEqual([...earlier].sort());
  });
});
