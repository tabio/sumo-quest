import { SAVE_VERSION } from "@/lib/validation";
import { STAGE_IDS, type PlayerSave, type StageProgress } from "@/types/game";

// テスト用のセーブデータ生成。
// 各テストで必要な部分だけを上書きできるようにし、全項目を毎回書かずに済ませる。

function initialStageProgress(index: number): StageProgress {
  // STAGE 1 だけが初期状態で unlocked（設計書「7. ゲーム進行ルール」）。
  return {
    status: index === 0 ? "unlocked" : "locked",
    bestScore: 0,
    attempts: 0,
  };
}

export function createSave(overrides: Partial<PlayerSave> = {}): PlayerSave {
  const stageProgress = Object.fromEntries(
    STAGE_IDS.map((stageId, index) => [stageId, initialStageProgress(index)]),
  ) as PlayerSave["stageProgress"];

  return {
    version: SAVE_VERSION,
    playerName: "ちからまる",
    experience: 0,
    rankId: "jonokuchi",
    stageProgress,
    learnedTechniqueIds: [],
    discoveredTermIds: [],
    rewardedLessonIds: [],
    rewardedQuizIds: [],
    quizHistory: [],
    createdAt: "2026-08-29T00:00:00.000Z",
    updatedAt: "2026-08-29T00:00:00.000Z",
    ...overrides,
  };
}
