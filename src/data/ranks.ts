import type { Rank } from "@/types/game";

// 番付のマスターデータ。
// 必要累積EXPは設計書「7. ゲーム進行ルール」の値を正とし、ここで保持する。
// 横綱だけはEXPではなく最終試験クリアを条件とするため requiresFinalExam を持つ。
// 具体的な値の投入はステージデータと合わせて Phase 1 以降で行う。
export const ranks: Rank[] = [];
