import { describe, expect, it } from "vitest";
import {
  collectContentProblems,
  type ContentBundle,
} from "@/lib/contentIntegrity";
import type { Lesson, Quiz, Stage } from "@/types/game";

// 検証規則そのもののテスト（P2-12）。
//
// 実データが健全なだけでは、規則が働いているかは分からない。
// わざと壊したデータを渡し、1件ずつ検出できることを確かめる。

const stage1: Stage = {
  id: "sumo-stable",
  order: 1,
  name: "すもう部屋",
  theme: "相撲の基本",
  npcId: "oyakata",
  lessonIds: ["lesson-1"],
  quizIds: ["quiz-1"],
  passRate: 0.6,
  clearRewardExp: 50,
  unlocks: "dohyo",
};

const stage2: Stage = {
  id: "dohyo",
  order: 2,
  name: "土俵",
  theme: "基本ルール",
  npcId: "oyakata",
  lessonIds: [],
  quizIds: [],
  passRate: 0.6,
  clearRewardExp: 50,
};

const lesson1: Lesson = {
  id: "lesson-1",
  stageId: "sumo-stable",
  speakerId: "oyakata",
  messages: ["よく来たな。"],
  rewardExp: 10,
  discoverTermIds: ["dohyo"],
  unlockTechniqueIds: ["yorikiri"],
};

const quiz1: Quiz = {
  id: "quiz-1",
  stageId: "sumo-stable",
  question: "土俵とは？",
  choices: [
    { id: "a", label: "取組を行う場所" },
    { id: "b", label: "力士の帯" },
  ],
  correctChoiceId: "a",
  explanation: "正解は取組を行う場所。",
  rewardExp: 10,
};

/** 健全なデータ一式。各テストはここから1点だけ壊す。 */
function soundBundle(): ContentBundle {
  return {
    stages: [structuredClone(stage1), structuredClone(stage2)],
    lessons: [structuredClone(lesson1)],
    quizzes: [structuredClone(quiz1)],
    techniques: [
      {
        id: "yorikiri",
        name: "寄り切り",
        reading: "よりきり",
        description: "土俵の外へ押し出す技。",
      },
    ],
    terms: [
      {
        id: "dohyo",
        name: "土俵",
        reading: "どひょう",
        description: "取組を行う場所。",
      },
    ],
    npcs: [
      { id: "oyakata", name: "親方", portraitPath: "characters/oyakata.png" },
    ],
  };
}

/** 1件だけ壊したデータを検証し、問題の文言を返す。 */
function problemsAfter(breakIt: (bundle: ContentBundle) => void): string[] {
  const bundle = soundBundle();
  breakIt(bundle);
  return collectContentProblems(bundle);
}

describe("コンテンツ検証", () => {
  it("健全なデータでは問題を返さない", () => {
    expect(collectContentProblems(soundBundle())).toEqual([]);
  });

  it("IDの重複を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.terms.push(structuredClone(bundle.terms[0]));
    });
    expect(problems).toContain("terms: IDが重複している（dohyo）");
  });

  it("正解が選択肢に無い場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.quizzes[0].correctChoiceId = "z";
    });
    expect(problems).toContain(
      "quiz quiz-1: 正解の選択肢がちょうど一つでない（0件）",
    );
  });

  it("正解が複数ある場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.quizzes[0].choices[1].id = "a";
    });
    expect(problems).toContain(
      "quiz quiz-1: 正解の選択肢がちょうど一つでない（2件）",
    );
  });

  it("選択肢が1つしかない場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.quizzes[0].choices = [bundle.quizzes[0].choices[0]];
    });
    expect(problems).toContain("quiz quiz-1: 選択肢が2〜4個でない（1個）");
  });

  it("選択肢の表示の重複を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.quizzes[0].choices[1].label = "取組を行う場所";
    });
    expect(problems).toContain(
      "quiz quiz-1: 選択肢の表示が重複している（取組を行う場所）",
    );
  });

  it("解説が無いクイズを検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.quizzes[0].explanation = "  ";
    });
    expect(problems).toContain("quiz quiz-1: 解説がない");
  });

  it("参照切れの用語を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.lessons[0].discoverTermIds = ["missing"];
    });
    expect(problems).toContain(
      "lesson lesson-1: 参照する用語が存在しない（missing）",
    );
  });

  it("参照切れの技を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.quizzes[0].techniqueId = "missing";
    });
    expect(problems).toContain(
      "quiz quiz-1: 参照する技が存在しない（missing）",
    );
  });

  it("参照切れのNPCを検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.lessons[0].speakerId = "missing";
    });
    expect(problems).toContain("lesson lesson-1: 話者が存在しない（missing）");
  });

  it("ステージが存在しない学習を参照している場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.stages[0].lessonIds = ["missing"];
    });
    expect(problems).toContain(
      "stage sumo-stable: 参照する学習が存在しない（missing）",
    );
  });

  it("学習が別のステージに属している場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.lessons[0].stageId = "dohyo";
    });
    expect(problems).toContain(
      "stage sumo-stable: 学習 lesson-1 が別のステージ（dohyo）に属している",
    );
  });

  it("空のメッセージを検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.lessons[0].messages = ["よく来たな。", "   "];
    });
    expect(problems).toContain("lesson lesson-1: 空のメッセージがある");
  });

  it("解放が途中で切れている場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.stages[0].unlocks = undefined;
    });
    expect(problems).toContain(
      "stage sumo-stable: 解放先が順番どおりでない（なし / 期待は dohyo）",
    );
  });

  it("orderが連番でない場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.stages[1].order = 5;
    });
    expect(problems).toContain(
      "stages: order が1からの連番になっていない（1, 5）",
    );
  });

  it("合格率が範囲外の場合を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.stages[0].passRate = 1.2;
    });
    expect(problems).toContain(
      "stage sumo-stable: 合格率が0より大きく1以下でない（1.2）",
    );
  });

  it("説明の無い用語を検出する", () => {
    const problems = problemsAfter((bundle) => {
      bundle.terms[0].description = "";
    });
    expect(problems).toContain("term dohyo: 名前・読み・説明のいずれかが空");
  });
});
