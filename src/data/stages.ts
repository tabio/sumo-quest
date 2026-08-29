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
  // STAGE 2以降は地点だけを置き、学習とクイズは Phase 2 と Phase 3 で入れる。
  // マップに6地点を並べるために必要なため、名前とテーマだけ先に確定させている。
  // 名前とテーマの出典はPRD「7. 学習ステージ」。
  {
    id: "dohyo",
    order: 2,
    name: "土俵",
    theme: "相撲の基本ルール",
    npcId: "oyakata",
    lessonIds: [],
    quizIds: [],
    passRate: 0.6,
    clearRewardExp: 50,
    unlocks: "dojo",
  },
  {
    id: "dojo",
    order: 3,
    name: "わざ道場",
    theme: "決まり手",
    npcId: "oyakata",
    lessonIds: [],
    quizIds: [],
    passRate: 0.6,
    clearRewardExp: 50,
    unlocks: "banzuke-shrine",
  },
  {
    id: "banzuke-shrine",
    order: 4,
    name: "ばんづけ神社",
    theme: "番付",
    npcId: "oyakata",
    lessonIds: [],
    quizIds: [],
    passRate: 0.6,
    clearRewardExp: 50,
    unlocks: "kokugikan",
  },
  {
    id: "kokugikan",
    order: 5,
    name: "国技館の町",
    theme: "大相撲を観戦しよう",
    npcId: "oyakata",
    lessonIds: [],
    quizIds: [],
    passRate: 0.6,
    clearRewardExp: 50,
    unlocks: "yokozuna-castle",
  },
  {
    id: "yokozuna-castle",
    order: 6,
    name: "横綱の城",
    theme: "最終試験",
    npcId: "oyakata",
    lessonIds: [],
    quizIds: [],
    // 最終試験だけ合格率が高い（設計書「7. ゲーム進行ルール」）。
    passRate: 0.8,
    clearRewardExp: 100,
  },
];
