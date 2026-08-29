import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import { GameContext, GameProvider } from "./GameProvider";

// Provider の副作用（localStorage の読み書き）を検証する。
// Reducer 側の遷移は gameReducer.test.ts が担当する。

function Probe() {
  const context = useContext(GameContext);
  if (!context) return <p>コンテキストがない</p>;

  const { state, dispatch, resetGame } = context;

  return (
    <div>
      <p data-testid="status">{state.status.kind}</p>
      <p data-testid="name">{state.save?.playerName ?? "なし"}</p>
      <p data-testid="exp">{state.save?.experience ?? -1}</p>
      <p data-testid="saveFailed">{String(state.saveFailed)}</p>
      <button
        onClick={() =>
          dispatch({
            type: "START_NEW_GAME",
            playerName: "たろう",
            now: "2026-08-29T12:00:00.000Z",
          })
        }
      >
        はじめから
      </button>
      <button
        onClick={() =>
          dispatch({
            type: "COMPLETE_LESSON",
            stageId: "sumo-stable",
            lessonId: "lesson-1",
            techniqueIds: [],
            termIds: [],
          })
        }
      >
        学習完了
      </button>
      <button onClick={resetGame}>初期化</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <GameProvider>
      <Probe />
    </GameProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GameProvider", () => {
  it("保存がない場合は empty になる", async () => {
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("empty"),
    );
  });

  it("保存済みのデータを読み込む", async () => {
    const save = createSave({ playerName: "はなこ", experience: 90 });
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("ready"),
    );
    expect(screen.getByTestId("name")).toHaveTextContent("はなこ");
    expect(screen.getByTestId("exp")).toHaveTextContent("90");
  });

  it("破損データを読み込まず、削除もしない", async () => {
    window.localStorage.setItem(SAVE_KEY, "{壊れている");

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("corrupted"),
    );
    expect(window.localStorage.getItem(SAVE_KEY)).toBe("{壊れている");
  });

  it("進行するとlocalStorageへ保存される", async () => {
    const user = userEvent.setup();
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("empty"),
    );

    await user.click(screen.getByRole("button", { name: "はじめから" }));
    await user.click(screen.getByRole("button", { name: "学習完了" }));

    await waitFor(() => {
      const raw = window.localStorage.getItem(SAVE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw ?? "").data.experience).toBe(10);
    });
  });

  it("再マウントで続きから再開できる", async () => {
    const user = userEvent.setup();
    const first = renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("empty"),
    );

    await user.click(screen.getByRole("button", { name: "はじめから" }));
    await user.click(screen.getByRole("button", { name: "学習完了" }));
    await waitFor(() =>
      expect(screen.getByTestId("exp")).toHaveTextContent("10"),
    );

    first.unmount();
    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("ready"),
    );
    expect(screen.getByTestId("name")).toHaveTextContent("たろう");
    expect(screen.getByTestId("exp")).toHaveTextContent("10");
  });

  it("保存に失敗してもプレイを継続し、失敗を伝える", async () => {
    const user = userEvent.setup();
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("empty"),
    );

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    await user.click(screen.getByRole("button", { name: "はじめから" }));

    await waitFor(() =>
      expect(screen.getByTestId("saveFailed")).toHaveTextContent("true"),
    );
    // 状態は進んでおり、プレイは続けられる。
    expect(screen.getByTestId("name")).toHaveTextContent("たろう");
  });

  it("初期化で保存を消す", async () => {
    const user = userEvent.setup();
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("empty"),
    );

    await user.click(screen.getByRole("button", { name: "はじめから" }));
    await waitFor(() =>
      expect(window.localStorage.getItem(SAVE_KEY)).not.toBeNull(),
    );

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "初期化" }));
    });

    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(screen.getByTestId("status")).toHaveTextContent("empty");
  });
});
