import { describe, expect, it } from "vitest";
import { createSave } from "@/test/fixtures";
import type { Quiz, Stage } from "@/types/game";
import {
  LESSON_REWARD_EXP,
  QUIZ_CORRECT_REWARD_EXP,
  advanceStatus,
  applyQuizDiscoveries,
  clearStage,
  completeLesson,
  discoverTerms,
  isCorrectChoice,
  isQuizPassed,
  isStagePlayable,
  learnTechniques,
  recordQuizResults,
} from "./game";

// 設計書「7. ゲーム進行ルール」を検証する。
// 特に R-3（初回報酬の二重付与）は、ここを通れば画面側で作り込む必要がなくなる。

const NOW = "2026-08-29T12:00:00.000Z";

const stage1: Stage = {
  id: "sumo-stable",
  order: 1,
  name: "すもう部屋",
  theme: "相撲の基本",
  npcId: "oyakata",
  lessonIds: ["lesson-1"],
  quizIds: ["quiz-1", "quiz-2"],
  passRate: 0.6,
  clearRewardExp: 50,
  unlocks: "dohyo",
};

const quiz: Quiz = {
  id: "quiz-1",
  stageId: "sumo-stable",
  question: "土俵の形は？",
  choices: [
    { id: "a", label: "まる" },
    { id: "b", label: "しかく" },
  ],
  correctChoiceId: "a",
  explanation: "土俵は円形である。",
  rewardExp: QUIZ_CORRECT_REWARD_EXP,
};

describe("advanceStatus", () => {
  it("先に進める", () => {
    expect(advanceStatus("unlocked", "lessonCompleted")).toBe(
      "lessonCompleted",
    );
  });

  it("後退させない", () => {
    expect(advanceStatus("cleared", "unlocked")).toBe("cleared");
  });
});

describe("isStagePlayable", () => {
  it("未解放は遊べない", () => {
    expect(
      isStagePlayable({ status: "locked", bestScore: 0, attempts: 0 }),
    ).toBe(false);
  });

  it("解放済みは遊べる", () => {
    expect(
      isStagePlayable({ status: "unlocked", bestScore: 0, attempts: 0 }),
    ).toBe(true);
  });

  it("存在しないステージは遊べない", () => {
    expect(isStagePlayable(undefined)).toBe(false);
  });
});

describe("isQuizPassed", () => {
  it("合格率ちょうどで合格する", () => {
    expect(isQuizPassed(stage1, 3, 5)).toBe(true);
  });

  it("合格率に届かないと不合格", () => {
    expect(isQuizPassed(stage1, 2, 5)).toBe(false);
  });

  it("問題が0問なら合格にしない", () => {
    expect(isQuizPassed(stage1, 0, 0)).toBe(false);
  });

  it("合格率はステージデータに従う", () => {
    const finalStage: Stage = { ...stage1, passRate: 0.8 };
    expect(isQuizPassed(finalStage, 3, 5)).toBe(false);
    expect(isQuizPassed(finalStage, 4, 5)).toBe(true);
  });
});

describe("isCorrectChoice", () => {
  it("選択肢IDで正誤を判定する", () => {
    expect(isCorrectChoice(quiz, "a")).toBe(true);
    expect(isCorrectChoice(quiz, "b")).toBe(false);
  });
});

describe("completeLesson", () => {
  it("初回はEXPが入り、状態が進む", () => {
    const after = completeLesson(createSave(), "sumo-stable", "lesson-1");

    expect(after.experience).toBe(LESSON_REWARD_EXP);
    expect(after.stageProgress["sumo-stable"].status).toBe("lessonCompleted");
    expect(after.rewardedLessonIds).toEqual(["lesson-1"]);
  });

  it("2回目はEXPが入らない", () => {
    const first = completeLesson(createSave(), "sumo-stable", "lesson-1");
    const second = completeLesson(first, "sumo-stable", "lesson-1");

    expect(second.experience).toBe(LESSON_REWARD_EXP);
    expect(second.rewardedLessonIds).toEqual(["lesson-1"]);
  });

  it("クリア済みステージの状態を後退させない", () => {
    const save = createSave({
      stageProgress: {
        ...createSave().stageProgress,
        "sumo-stable": { status: "cleared", bestScore: 2, attempts: 1 },
      },
    });

    const after = completeLesson(save, "sumo-stable", "lesson-1");
    expect(after.stageProgress["sumo-stable"].status).toBe("cleared");
  });

  it("元のセーブを書き換えない", () => {
    const save = createSave();
    completeLesson(save, "sumo-stable", "lesson-1");

    expect(save.experience).toBe(0);
    expect(save.rewardedLessonIds).toEqual([]);
  });
});

describe("recordQuizResults", () => {
  const results = [
    { quizId: "quiz-1", correct: true },
    { quizId: "quiz-2", correct: false },
  ];

  it("初回の正解だけ加点する", () => {
    const after = recordQuizResults(createSave(), "sumo-stable", results, NOW);

    expect(after.experience).toBe(QUIZ_CORRECT_REWARD_EXP);
    expect(after.rewardedQuizIds).toEqual(["quiz-1"]);
  });

  it("再挑戦で同じ問題に正解しても二重加点しない", () => {
    const first = recordQuizResults(createSave(), "sumo-stable", results, NOW);
    const second = recordQuizResults(first, "sumo-stable", results, NOW);

    expect(second.experience).toBe(QUIZ_CORRECT_REWARD_EXP);
    expect(second.rewardedQuizIds).toEqual(["quiz-1"]);
  });

  it("同一回に同じ問題が重複しても一度しか加点しない", () => {
    const duplicated = [
      { quizId: "quiz-1", correct: true },
      { quizId: "quiz-1", correct: true },
    ];
    const after = recordQuizResults(
      createSave(),
      "sumo-stable",
      duplicated,
      NOW,
    );

    expect(after.experience).toBe(QUIZ_CORRECT_REWARD_EXP);
  });

  it("再挑戦で新しく正解した問題は加点する", () => {
    const first = recordQuizResults(createSave(), "sumo-stable", results, NOW);
    const second = recordQuizResults(
      first,
      "sumo-stable",
      [
        { quizId: "quiz-1", correct: true },
        { quizId: "quiz-2", correct: true },
      ],
      NOW,
    );

    expect(second.experience).toBe(QUIZ_CORRECT_REWARD_EXP * 2);
    expect(second.rewardedQuizIds).toEqual(["quiz-1", "quiz-2"]);
  });

  it("挑戦回数と最高得点と履歴を記録する", () => {
    const after = recordQuizResults(createSave(), "sumo-stable", results, NOW);

    expect(after.stageProgress["sumo-stable"].attempts).toBe(1);
    expect(after.stageProgress["sumo-stable"].bestScore).toBe(1);
    expect(after.quizHistory).toEqual([
      { stageId: "sumo-stable", score: 1, total: 2, answeredAt: NOW },
    ]);
  });

  it("最高得点は下がらない", () => {
    const good = recordQuizResults(
      createSave(),
      "sumo-stable",
      [
        { quizId: "quiz-1", correct: true },
        { quizId: "quiz-2", correct: true },
      ],
      NOW,
    );
    const bad = recordQuizResults(
      good,
      "sumo-stable",
      [
        { quizId: "quiz-1", correct: false },
        { quizId: "quiz-2", correct: false },
      ],
      NOW,
    );

    expect(bad.stageProgress["sumo-stable"].bestScore).toBe(2);
  });
});

describe("clearStage", () => {
  it("初回クリアでEXPが入り、次のステージが解放される", () => {
    const after = clearStage(createSave(), stage1, NOW);

    expect(after.experience).toBe(stage1.clearRewardExp);
    expect(after.stageProgress["sumo-stable"].status).toBe("cleared");
    expect(after.stageProgress["sumo-stable"].clearedAt).toBe(NOW);
    expect(after.stageProgress.dohyo.status).toBe("unlocked");
  });

  it("再クリアではEXPが入らない", () => {
    const first = clearStage(createSave(), stage1, NOW);
    const second = clearStage(first, stage1, "2026-08-30T00:00:00.000Z");

    expect(second.experience).toBe(stage1.clearRewardExp);
    // 初回のクリア日時を保つ。
    expect(second.stageProgress["sumo-stable"].clearedAt).toBe(NOW);
  });

  it("解放先がすでに進んでいる場合は後退させない", () => {
    const save = createSave({
      stageProgress: {
        ...createSave().stageProgress,
        dohyo: { status: "cleared", bestScore: 2, attempts: 1 },
      },
    });

    const after = clearStage(save, stage1, NOW);
    expect(after.stageProgress.dohyo.status).toBe("cleared");
  });

  it("EXPに応じて番付が上がる", () => {
    const save = createSave({ experience: 70 });
    const after = clearStage(save, stage1, NOW);

    expect(after.experience).toBe(120);
    expect(after.rankId).toBe("jonidan");
  });

  it("最終ステージのクリアで横綱になる", () => {
    const finalStage: Stage = {
      ...stage1,
      id: "yokozuna-castle",
      order: 6,
      passRate: 0.8,
      unlocks: undefined,
    };

    const after = clearStage(createSave(), finalStage, NOW);
    expect(after.rankId).toBe("yokozuna");
  });
});

describe("learnTechniques と discoverTerms", () => {
  it("技を習得する", () => {
    const after = learnTechniques(createSave(), ["yorikiri"]);
    expect(after.learnedTechniqueIds).toEqual(["yorikiri"]);
  });

  it("同じ技を重複して持たない", () => {
    const first = learnTechniques(createSave(), ["yorikiri"]);
    const second = learnTechniques(first, ["yorikiri", "oshidashi"]);

    expect(second.learnedTechniqueIds).toEqual(["yorikiri", "oshidashi"]);
  });

  it("追加がない場合は同じ参照を返す", () => {
    const save = learnTechniques(createSave(), ["yorikiri"]);
    expect(learnTechniques(save, ["yorikiri"])).toBe(save);
  });

  it("用語を発見する", () => {
    const after = discoverTerms(createSave(), ["dohyo", "mawashi"]);
    expect(after.discoveredTermIds).toEqual(["dohyo", "mawashi"]);
  });

  it("同じ用語を重複して持たない", () => {
    const first = discoverTerms(createSave(), ["dohyo"]);
    expect(discoverTerms(first, ["dohyo"]).discoveredTermIds).toEqual([
      "dohyo",
    ]);
  });
});

describe("applyQuizDiscoveries", () => {
  it("正解した問題の技を習得する", () => {
    const after = applyQuizDiscoveries(createSave(), [
      { quizId: "q1", correct: true, techniqueId: "yorikiri" },
    ]);
    expect(after.learnedTechniqueIds).toEqual(["yorikiri"]);
  });

  it("誤答した問題の技は習得しない", () => {
    const after = applyQuizDiscoveries(createSave(), [
      { quizId: "q1", correct: false, techniqueId: "yorikiri" },
    ]);
    expect(after.learnedTechniqueIds).toEqual([]);
  });

  it("用語は誤答でも発見する", () => {
    // 誤答でも解説で説明を読むため、出会った用語として登録する
    // （PRD「9. コレクション」）。
    const after = applyQuizDiscoveries(createSave(), [
      { quizId: "q1", correct: false, termIds: ["dohyo"] },
    ]);
    expect(after.discoveredTermIds).toEqual(["dohyo"]);
  });

  it("すでに覚えているものを重複して持たない", () => {
    const save = createSave({
      learnedTechniqueIds: ["yorikiri"],
      discoveredTermIds: ["dohyo"],
    });
    const after = applyQuizDiscoveries(save, [
      {
        quizId: "q1",
        correct: true,
        techniqueId: "yorikiri",
        termIds: ["dohyo"],
      },
    ]);
    expect(after.learnedTechniqueIds).toEqual(["yorikiri"]);
    expect(after.discoveredTermIds).toEqual(["dohyo"]);
  });

  it("EXPは動かさない", () => {
    // 加点は recordQuizResults の担当。ここは覚えたものだけを扱う。
    const save = createSave({ experience: 40 });
    const after = applyQuizDiscoveries(save, [
      { quizId: "q1", correct: true, techniqueId: "yorikiri" },
    ]);
    expect(after.experience).toBe(40);
  });
});
