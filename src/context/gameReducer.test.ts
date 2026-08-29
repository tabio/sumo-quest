import { describe, expect, it } from "vitest";
import { createSave } from "@/test/fixtures";
import type { Stage } from "@/types/game";
import {
  createInitialSave,
  gameReducer,
  initialGameState,
  type GameAction,
  type GameState,
} from "./gameReducer";

// 設計書「10. 状態管理」の8アクションを検証する。
// Reducer が純粋関数であること（入力を書き換えないこと）もここで押さえる。

const NOW = "2026-08-29T12:00:00.000Z";

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

function readyState(save = createSave()): GameState {
  return { save, status: { kind: "ready" }, saveFailed: false };
}

describe("createInitialSave", () => {
  it("STAGE 1 だけが解放された状態で始まる", () => {
    const save = createInitialSave("たろう", NOW);

    expect(save.stageProgress["sumo-stable"].status).toBe("unlocked");
    expect(save.stageProgress.dohyo.status).toBe("locked");
  });

  it("名前とEXPと番付が初期値になる", () => {
    const save = createInitialSave("たろう", NOW);

    expect(save.playerName).toBe("たろう");
    expect(save.experience).toBe(0);
    expect(save.rankId).toBe("jonokuchi");
    expect(save.createdAt).toBe(NOW);
  });
});

describe("START_NEW_GAME", () => {
  it("新しいセーブを作る", () => {
    const next = gameReducer(initialGameState, {
      type: "START_NEW_GAME",
      playerName: "たろう",
      now: NOW,
    });

    expect(next.save?.playerName).toBe("たろう");
    expect(next.status).toEqual({ kind: "ready" });
  });
});

describe("LOAD_GAME", () => {
  it("読み込めた場合は ready になる", () => {
    const save = createSave();
    const next = gameReducer(initialGameState, {
      type: "LOAD_GAME",
      result: { status: "loaded", data: save },
    });

    expect(next).toEqual({
      save,
      status: { kind: "ready" },
      saveFailed: false,
    });
  });

  it("保存がない場合は empty になる", () => {
    const next = gameReducer(initialGameState, {
      type: "LOAD_GAME",
      result: { status: "empty" },
    });

    expect(next.status).toEqual({ kind: "empty" });
    expect(next.save).toBeNull();
  });

  it("破損している場合は理由を保持する", () => {
    const next = gameReducer(initialGameState, {
      type: "LOAD_GAME",
      result: { status: "corrupted", reason: "invalidJson" },
    });

    expect(next.status).toEqual({
      kind: "corrupted",
      reason: "invalidJson",
    });
  });

  it("localStorage が使えない場合は unavailable になる", () => {
    const next = gameReducer(initialGameState, {
      type: "LOAD_GAME",
      result: { status: "unavailable" },
    });

    expect(next.status).toEqual({ kind: "unavailable" });
  });
});

describe("進行のアクション", () => {
  it("COMPLETE_LESSON で学習完了と技・用語の獲得が同時に起きる", () => {
    const next = gameReducer(readyState(), {
      type: "COMPLETE_LESSON",
      stageId: "sumo-stable",
      lessonId: "lesson-1",
      techniqueIds: ["yorikiri"],
      termIds: ["dohyo"],
    });

    expect(next.save?.stageProgress["sumo-stable"].status).toBe(
      "lessonCompleted",
    );
    expect(next.save?.learnedTechniqueIds).toEqual(["yorikiri"]);
    expect(next.save?.discoveredTermIds).toEqual(["dohyo"]);
    expect(next.save?.experience).toBe(10);
  });

  it("RECORD_QUIZ_RESULT で結果が記録される", () => {
    const next = gameReducer(readyState(), {
      type: "RECORD_QUIZ_RESULT",
      stageId: "sumo-stable",
      results: [{ quizId: "quiz-1", correct: true }],
      now: NOW,
    });

    expect(next.save?.experience).toBe(10);
    expect(next.save?.quizHistory).toHaveLength(1);
  });

  it("CLEAR_STAGE で次のステージが解放される", () => {
    const next = gameReducer(readyState(), {
      type: "CLEAR_STAGE",
      stage: stage1,
      now: NOW,
    });

    expect(next.save?.stageProgress["sumo-stable"].status).toBe("cleared");
    expect(next.save?.stageProgress.dohyo.status).toBe("unlocked");
  });

  it("UNLOCK_TECHNIQUE と DISCOVER_TERM が働く", () => {
    const afterTechnique = gameReducer(readyState(), {
      type: "UNLOCK_TECHNIQUE",
      techniqueIds: ["oshidashi"],
    });
    const afterTerm = gameReducer(afterTechnique, {
      type: "DISCOVER_TERM",
      termIds: ["gyoji"],
    });

    expect(afterTerm.save?.learnedTechniqueIds).toEqual(["oshidashi"]);
    expect(afterTerm.save?.discoveredTermIds).toEqual(["gyoji"]);
  });

  it("変化がない場合は同じ状態を返す", () => {
    const state = readyState();
    const next = gameReducer(state, {
      type: "DISCOVER_TERM",
      termIds: [],
    });

    expect(next).toBe(state);
  });

  it("セーブがない状態では進行アクションを無視する", () => {
    const state: GameState = {
      save: null,
      status: { kind: "empty" },
      saveFailed: false,
    };
    const next = gameReducer(state, {
      type: "CLEAR_STAGE",
      stage: stage1,
      now: NOW,
    });

    expect(next).toBe(state);
  });
});

describe("RESET_GAME", () => {
  it("セーブを捨てて empty に戻す", () => {
    const next = gameReducer(readyState(), { type: "RESET_GAME" });

    expect(next.save).toBeNull();
    expect(next.status).toEqual({ kind: "empty" });
  });
});

describe("保存結果のアクション", () => {
  it("SAVE_FAILED で失敗を記録する", () => {
    const next = gameReducer(readyState(), { type: "SAVE_FAILED" });
    expect(next.saveFailed).toBe(true);
  });

  it("SAVE_SUCCEEDED で失敗表示を解除する", () => {
    const failed = gameReducer(readyState(), { type: "SAVE_FAILED" });
    const next = gameReducer(failed, { type: "SAVE_SUCCEEDED" });
    expect(next.saveFailed).toBe(false);
  });

  it("状態が変わらない場合は同じ参照を返す", () => {
    const state = readyState();
    expect(gameReducer(state, { type: "SAVE_SUCCEEDED" })).toBe(state);
  });
});

describe("純粋性", () => {
  it("入力の状態とセーブを書き換えない", () => {
    const save = createSave();
    const state = readyState(save);

    gameReducer(state, {
      type: "COMPLETE_LESSON",
      stageId: "sumo-stable",
      lessonId: "lesson-1",
      techniqueIds: ["yorikiri"],
      termIds: ["dohyo"],
    });

    expect(save.experience).toBe(0);
    expect(save.learnedTechniqueIds).toEqual([]);
    expect(state.status).toEqual({ kind: "ready" });
  });

  it("同じ入力に対して同じ結果を返す", () => {
    const state = readyState();
    const action: GameAction = {
      type: "RECORD_QUIZ_RESULT",
      stageId: "sumo-stable",
      results: [{ quizId: "quiz-1", correct: true }],
      now: NOW,
    };

    expect(gameReducer(state, action)).toEqual(gameReducer(state, action));
  });
});
