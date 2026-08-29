import { describe, expect, it } from "vitest";
import { createInitialSave } from "@/context/gameReducer";
import {
  applyQuizDiscoveries,
  clearStage,
  completeLesson,
  recordQuizResults,
  type QuizResult,
} from "@/lib/game";
import { currentRank } from "@/lib/selectors";
import type { PlayerSave } from "@/types/game";
import { quizzes } from "./quizzes";
import { ranks } from "./ranks";
import { stages } from "./stages";

// 昇進テンポの検査（P3-6）。
//
// 通しプレイを純粋関数だけで再現し、番付がどう動くかを見る。
// 数値はすべてデータ側にあるため、この検査もコード変更なしで追随する。
//
// 見ているのは「EXPの値」ではなく「番付の出方」である。
// 個々の数値は Phase 3 以降も調整されうるが、
// 全10段階を通ることと、各ステージで昇進することは崩してはならない。

const NOW = "2026-08-29T12:00:00.000Z";

type Point = {
  /** 何を終えた直後か。 */
  label: string;
  experience: number;
  rank: string;
};

const ordered = [...stages].sort((a, b) => a.order - b.order);

function quizResultsOf(stageId: string): QuizResult[] {
  return quizzes
    .filter((quiz) => quiz.stageId === stageId)
    .map((quiz) => ({
      quizId: quiz.id,
      correct: true,
      techniqueId: quiz.techniqueId,
      termIds: quiz.termIds,
    }));
}

/**
 * 全問正解で最後まで進めたときに、画面へ出るEXPと番付を順に返す。
 *
 * 取組は正解の加点・発見・クリアを1回の操作でまとめて反映する（ADR-0004）。
 * そのため、その途中の値は画面に出ない。ここでも同じ区切りで記録する。
 */
function playthrough(): Point[] {
  let save: PlayerSave = createInitialSave("ちからまる", NOW);
  const points: Point[] = [
    {
      label: "はじめ",
      experience: save.experience,
      rank: currentRank(save).name,
    },
  ];

  for (const stage of ordered) {
    for (const lessonId of stage.lessonIds) {
      save = completeLesson(save, stage.id, lessonId);
    }
    points.push({
      label: `${stage.name}：学習`,
      experience: save.experience,
      rank: currentRank(save).name,
    });

    const results = quizResultsOf(stage.id);
    save = recordQuizResults(save, stage.id, results, NOW);
    save = applyQuizDiscoveries(save, results);
    save = clearStage(save, stage, NOW);
    points.push({
      label: `${stage.name}：取組`,
      experience: save.experience,
      rank: currentRank(save).name,
    });
  }

  return points;
}

describe("通しプレイの昇進テンポ", () => {
  const points = playthrough();

  it("全10段階の番付を通る", () => {
    // 途中で飛ばされる番付があると、番付の順序を覚える手がかりにならない
    // （PRD「8. RPGシステム」）。
    const seen = new Set(points.map((point) => point.rank));
    expect([...seen].sort()).toEqual([...ranks.map((r) => r.name)].sort());
  });

  it("ステージの取組を終えるたびに番付が上がる", () => {
    const battles = points.filter((point) => point.label.endsWith("：取組"));
    expect(battles).toHaveLength(ordered.length);

    for (const [index, battle] of battles.entries()) {
      const before = points[points.indexOf(battle) - 1];
      expect(
        battle.rank,
        `${battle.label} で番付が上がっていない（${before.rank}）`,
      ).not.toBe(before.rank);
      expect(index).toBeLessThan(ordered.length);
    }
  });

  it("番付は下がらない", () => {
    const orderOf = (name: string) =>
      ranks.find((rank) => rank.name === name)!.order;

    for (let i = 1; i < points.length; i += 1) {
      expect(orderOf(points[i].rank)).toBeGreaterThanOrEqual(
        orderOf(points[i - 1].rank),
      );
    }
  });

  it("最後に横綱へ到達する", () => {
    const last = points.at(-1)!;
    const yokozuna = ranks.find((rank) => rank.requiresFinalExam)!;
    expect(last.rank).toBe(yokozuna.name);
  });

  it("EXPで上がれる番付は、すべて最終試験の前に到達できる", () => {
    // 最終試験のクリアと同時にしか届かない番付があると、
    // その番付は一度も画面に出ないまま横綱になってしまう。
    const beforeFinal = points.slice(0, -1);
    const reachable = Math.max(...beforeFinal.map((p) => p.experience));

    for (const rank of ranks.filter((r) => !r.requiresFinalExam)) {
      expect(
        rank.requiredExperience,
        `${rank.name} に届かない`,
      ).toBeLessThanOrEqual(reachable);
    }
  });
});
