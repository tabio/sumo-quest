import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { techniques } from "@/data/techniques";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import EndingPage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// エンディング（P3-4）。
// 完了条件は「最終ステージクリアからのみ到達する」。

function storeSave(save: PlayerSave) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

/** 最終試験をクリアした状態のセーブ。 */
function finishedSave(overrides: Partial<PlayerSave> = {}): PlayerSave {
  const base = createSave();
  return createSave({
    experience: 760,
    stageProgress: {
      ...base.stageProgress,
      "yokozuna-castle": { status: "cleared", bestScore: 10, attempts: 1 },
    },
    ...overrides,
  });
}

function renderPage() {
  return render(
    <GameProvider>
      <EndingPage />
    </GameProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replace.mockClear();
});

describe("エンディング", () => {
  it("最終試験をクリアしていれば見られる", async () => {
    storeSave(finishedSave({ playerName: "ちからまる" }));
    renderPage();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "ちからまる は 横綱 になった。",
      ),
    );
    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.getByRole("region", { name: "旅のおわりに" }),
    ).toBeInTheDocument();
  });

  it("旅の記録を出す", async () => {
    storeSave(
      finishedSave({
        learnedTechniqueIds: ["yorikiri"],
        discoveredTermIds: ["dohyo"],
      }),
    );
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "旅の記録" }),
      ).toBeInTheDocument(),
    );
    const record = screen.getByRole("region", { name: "旅の記録" });
    expect(record).toHaveTextContent("760");
    expect(record).toHaveTextContent(`${techniques.length} のうち 1`);
  });

  it("最終試験をクリアしていないとマップへ戻す", async () => {
    storeSave(createSave({ experience: 100000 }));
    renderPage();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/map"));
    expect(
      screen.getByRole("region", { name: "まだ その先はありません" }),
    ).toBeInTheDocument();
    // 本文は先に見せない。
    expect(
      screen.queryByRole("region", { name: "旅のおわりに" }),
    ).not.toBeInTheDocument();
  });

  it("セーブがない場合はタイトルへ戻す", async () => {
    renderPage();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(
      screen.getByRole("region", { name: "記録がありません" }),
    ).toBeInTheDocument();
  });

  it("図鑑と辞典へ戻れる", async () => {
    storeSave(finishedSave());
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "マップへもどる" }),
      ).toHaveAttribute("href", "/map"),
    );
    expect(screen.getByRole("link", { name: "すもうじてん" })).toHaveAttribute(
      "href",
      "/dictionary",
    );
    expect(screen.getByRole("link", { name: "わざずかん" })).toHaveAttribute(
      "href",
      "/techniques",
    );
  });
});
