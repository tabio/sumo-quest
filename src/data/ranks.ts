import type { Rank } from "@/types/game";

// 番付のマスターデータ。
// 必要累積EXPは設計書「7. ゲーム進行ルール」の値を正とし、ここで保持する。
// 調整がコード変更を伴わないよう、判定ロジックはこの配列だけを見る。
//
// 値は Phase 3 の通しプレイで調整した（P3-6）。
// 調整前は通しでプレイしても 関脇・大関 に届かず、小結も画面に出ないままだった。
//
// EXPは大きな単位でしか増えない。
// 学習で10、取組で「正解ぶん＋クリア報酬」がまとめて入るため、
// 通しプレイ中に画面へ出るEXPは13通りしかない。
// そこで、番付の境目をその13点に合わせて置いてある。
//
// - 各ステージの取組後に必ず1つ上がる
// - 幕下・小結・大関は、次のステージの学習を終えた時点で上がる
// - 横綱だけはEXPでは上がらない（最終試験のクリアが条件）
//
// 境目どうしの間隔が不揃いなのはこのためである。
// 実際に全10段階を通ることは src/data/pacing.test.ts が確認する。
export const ranks: Rank[] = [
  { id: "jonokuchi", name: "序ノ口", order: 1, requiredExperience: 0 },
  { id: "jonidan", name: "序二段", order: 2, requiredExperience: 100 },
  { id: "sandanme", name: "三段目", order: 3, requiredExperience: 200 },
  { id: "makushita", name: "幕下", order: 4, requiredExperience: 230 },
  { id: "juryo", name: "十両", order: 5, requiredExperience: 320 },
  { id: "maegashira", name: "前頭", order: 6, requiredExperience: 430 },
  { id: "komusubi", name: "小結", order: 7, requiredExperience: 450 },
  { id: "sekiwake", name: "関脇", order: 8, requiredExperience: 540 },
  { id: "ozeki", name: "大関", order: 9, requiredExperience: 560 },
  {
    id: "yokozuna",
    name: "横綱",
    order: 10,
    // 横綱だけはEXPでは昇進しない。最終試験クリアが必須（設計書「7.」）。
    requiredExperience: Number.POSITIVE_INFINITY,
    requiresFinalExam: true,
  },
];
