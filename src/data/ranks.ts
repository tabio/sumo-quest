import type { Rank } from "@/types/game";

// 番付のマスターデータ。
// 必要累積EXPは設計書「7. ゲーム進行ルール」の値を正とし、ここで保持する。
// 数値は暫定であり、Phase 3の通しプレイ（P3-6）で調整する（scope.md）。
// 調整がコード変更を伴わないよう、判定ロジックはこの配列だけを見る。
export const ranks: Rank[] = [
  { id: "jonokuchi", name: "序ノ口", order: 1, requiredExperience: 0 },
  { id: "jonidan", name: "序二段", order: 2, requiredExperience: 80 },
  { id: "sandanme", name: "三段目", order: 3, requiredExperience: 160 },
  { id: "makushita", name: "幕下", order: 4, requiredExperience: 260 },
  { id: "juryo", name: "十両", order: 5, requiredExperience: 380 },
  { id: "maegashira", name: "前頭", order: 6, requiredExperience: 520 },
  { id: "komusubi", name: "小結", order: 7, requiredExperience: 680 },
  { id: "sekiwake", name: "関脇", order: 8, requiredExperience: 860 },
  { id: "ozeki", name: "大関", order: 9, requiredExperience: 1060 },
  {
    id: "yokozuna",
    name: "横綱",
    order: 10,
    // 横綱だけはEXPでは昇進しない。最終試験クリアが必須（設計書「7.」）。
    requiredExperience: Number.POSITIVE_INFINITY,
    requiresFinalExam: true,
  },
];
