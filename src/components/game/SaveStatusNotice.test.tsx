import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameShell } from "@/components/game/GameShell";
import { GameProvider } from "@/context/GameProvider";
import { useGame } from "@/hooks/useGame";
import { SAVE_KEY } from "@/lib/storage";

// 保存できていないことの通知（P4-7）。
//
// 保存に失敗してもプレイは止めない（R-6）。
// ただし黙って続けると、閉じた時点で失われたことに気づけない。

/** 保存を必ず失敗させる。書き込みだけを壊し、読み込みは通す。 */
function breakWriting() {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("QuotaExceededError");
  });
}

function Harness() {
  const { dispatch } = useGame();

  return (
    <GameShell title="テスト">
      <button
        onClick={() =>
          dispatch({
            type: "START_NEW_GAME",
            playerName: "ちからまる",
            now: "2026-08-29T12:00:00.000Z",
          })
        }
      >
        はじめる
      </button>
    </GameShell>
  );
}

function renderHarness() {
  return render(
    <GameProvider>
      <Harness />
    </GameProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("保存できていないことの通知", () => {
  it("保存に失敗すると知らせる", async () => {
    const user = userEvent.setup();
    breakWriting();
    renderHarness();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "はじめる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "進行を保存できませんでした。閉じると記録が失われます。",
    );
  });

  it("保存に失敗してもプレイは止めない", async () => {
    const user = userEvent.setup();
    breakWriting();
    renderHarness();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "はじめる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    // 画面は描画されたままで、操作もできる。
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "テスト",
    );
    expect(screen.getByRole("button", { name: "はじめる" })).toBeEnabled();
  });

  it("保存できている間は出さない", async () => {
    const user = userEvent.setup();
    renderHarness();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "はじめる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    await waitFor(() =>
      expect(window.localStorage.getItem(SAVE_KEY)).not.toBeNull(),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
