import type { Stage } from "@/types/game";

// ステージのマスターデータ。
// 表示順は配列の位置ではなく order を正とする。
// 合格率とEXPは暫定値であり、Phase 3の通しプレイ（P3-6）で調整する（scope.md）。
// STAGE 2以降は Phase 2 で追加する。
export const stages: Stage[] = [
  {
    id: "sumo-stable",
    order: 1,
    name: "すもう部屋",
    theme: "相撲の基本",
    npcId: "oyakata",
    lessonIds: ["sumo-stable-lesson"],
    quizIds: [
      "sumo-stable-quiz-1",
      "sumo-stable-quiz-2",
      "sumo-stable-quiz-3",
      "sumo-stable-quiz-4",
      "sumo-stable-quiz-5",
    ],
    passRate: 0.6,
    clearRewardExp: 50,
    unlocks: "dohyo",
  },
];
