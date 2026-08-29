import { describe, expect, it } from "vitest";
import { createSave } from "@/test/fixtures";
import type { PlayerSave, Stage } from "@/types/game";
import {
  collectionRate,
  currentRank,
  currentStage,
  experienceToNext,
  isLessonCompleted,
  isStageCleared,
  isStageUnlocked,
  quizAccuracy,
  upcomingRank,
} from "./selectors";

// 設計書「10. 状態管理」の導出値を検証する。
// これらを保存値として持たないことが要件のため、計算結果の正しさをここで担保する。

const stageList: Stage[] = [
  {
    id: "sumo-stable",
    order: 1,
    name: "すもう部屋",
    theme: "基本",
    npcId: "oyakata",
    lessonIds: [],
    quizIds: [],
    passRate: 0.6,
    clearRewardExp: 50,
    unlocks: "dohyo",
  },
  {
    id: "dohyo",
    order: 2,
    name: "土俵",
    theme: "取組",
    npcId: "oyakata",
    lessonIds: [],
    quizIds: [],
    passRate: 0.6,
    clearRewardExp: 50,
  },
];

function withProgress(
  overrides: Partial<PlayerSave["stageProgress"]>,
  save: Partial<PlayerSave> = {},
): PlayerSave {
  const base = createSave(save);
  return {
    ...base,
    stageProgress: { ...base.stageProgress, ...overrides },
  };
}

describe("currentRank", () => {
  it("EXPから番付を導出する", () => {
    expect(currentRank(createSave({ experience: 160 })).id).toBe("sandanme");
  });

  it("保存されている番付が食い違ってもEXPを正とする", () => {
    const save = createSave({ experience: 0, rankId: "yokozuna" });
    expect(currentRank(save).id).toBe("jonokuchi");
  });

  it("最終ステージをクリアしていれば横綱になる", () => {
    const save = withProgress({
      "yokozuna-castle": { status: "cleared", bestScore: 5, attempts: 1 },
    });
    expect(currentRank(save).id).toBe("yokozuna");
  });
});

describe("次の番付", () => {
  it("残りEXPを返す", () => {
    expect(experienceToNext(createSave({ experience: 30 }))).toBe(50);
    expect(upcomingRank(createSave({ experience: 30 }))?.id).toBe("jonidan");
  });

  it("EXPで到達できる最上位では null", () => {
    const save = createSave({ experience: 100000 });
    expect(experienceToNext(save)).toBeNull();
    expect(upcomingRank(save)).toBeNull();
  });
});

describe("ステージの状態", () => {
  it("初期状態では STAGE 1 だけが解放されている", () => {
    const save = createSave();
    expect(isStageUnlocked(save, "sumo-stable")).toBe(true);
    expect(isStageUnlocked(save, "dohyo")).toBe(false);
  });

  it("クリア済みを判定する", () => {
    const save = withProgress({
      "sumo-stable": { status: "cleared", bestScore: 5, attempts: 1 },
    });
    expect(isStageCleared(save, "sumo-stable")).toBe(true);
  });

  it("学習完了はクリア済みでも真になる", () => {
    const lessonDone = withProgress({
      "sumo-stable": { status: "lessonCompleted", bestScore: 0, attempts: 0 },
    });
    const cleared = withProgress({
      "sumo-stable": { status: "cleared", bestScore: 5, attempts: 1 },
    });

    expect(isLessonCompleted(lessonDone, "sumo-stable")).toBe(true);
    expect(isLessonCompleted(cleared, "sumo-stable")).toBe(true);
    expect(isLessonCompleted(createSave(), "sumo-stable")).toBe(false);
  });
});

describe("currentStage", () => {
  it("未クリアで解放済みの最初のステージを返す", () => {
    expect(currentStage(createSave(), stageList)?.id).toBe("sumo-stable");
  });

  it("クリア済みなら次の解放済みステージへ進む", () => {
    const save = withProgress({
      "sumo-stable": { status: "cleared", bestScore: 5, attempts: 1 },
      dohyo: { status: "unlocked", bestScore: 0, attempts: 0 },
    });
    expect(currentStage(save, stageList)?.id).toBe("dohyo");
  });

  it("すべてクリア済みなら最後のステージを返す", () => {
    const save = withProgress({
      "sumo-stable": { status: "cleared", bestScore: 5, attempts: 1 },
      dohyo: { status: "cleared", bestScore: 5, attempts: 1 },
    });
    expect(currentStage(save, stageList)?.id).toBe("dohyo");
  });

  it("ステージが空なら null", () => {
    expect(currentStage(createSave(), [])).toBeNull();
  });

  it("配列の順序ではなく order に従う", () => {
    const reversed = [...stageList].reverse();
    expect(currentStage(createSave(), reversed)?.id).toBe("sumo-stable");
  });
});

describe("collectionRate", () => {
  it("完成率を返す", () => {
    expect(collectionRate(1, 4)).toBe(0.25);
  });

  it("母数が0でも例外にならない", () => {
    expect(collectionRate(0, 0)).toBe(0);
  });
});

describe("quizAccuracy", () => {
  it("挑戦がない場合は null", () => {
    expect(quizAccuracy(createSave(), "sumo-stable")).toBeNull();
  });

  it("直近の挑戦の正答率を返す", () => {
    const save = createSave({
      quizHistory: [
        {
          stageId: "sumo-stable",
          score: 1,
          total: 5,
          answeredAt: "2026-08-29T00:00:00.000Z",
        },
        {
          stageId: "sumo-stable",
          score: 4,
          total: 5,
          answeredAt: "2026-08-29T01:00:00.000Z",
        },
      ],
    });

    expect(quizAccuracy(save, "sumo-stable")).toBe(0.8);
  });

  it("他ステージの履歴を混ぜない", () => {
    const save = createSave({
      quizHistory: [
        {
          stageId: "dohyo",
          score: 5,
          total: 5,
          answeredAt: "2026-08-29T00:00:00.000Z",
        },
      ],
    });

    expect(quizAccuracy(save, "sumo-stable")).toBeNull();
  });
});

describe("保存値を増やさない", () => {
  it("導出値の計算がセーブを書き換えない", () => {
    const save = createSave({ experience: 200 });
    const snapshot = JSON.stringify(save);

    currentRank(save);
    experienceToNext(save);
    currentStage(save, stageList);
    quizAccuracy(save, "sumo-stable");

    expect(JSON.stringify(save)).toBe(snapshot);
  });
});
