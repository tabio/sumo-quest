import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { terms } from "@/data/terms";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import DictionaryPage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// 相撲用語辞典（P2-10）。
// 完了条件は「発見済みのみ表示、五十音順」。

function storeSave(save: PlayerSave) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderPage() {
  return render(
    <GameProvider>
      <DictionaryPage />
    </GameProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replace.mockClear();
});

describe("相撲用語辞典", () => {
  it("発見済みの用語だけを載せる", async () => {
    storeSave(createSave({ discoveredTermIds: ["dohyo"] }));
    renderPage();

    await waitFor(() => expect(screen.getByText("土俵")).toBeInTheDocument());
    expect(
      screen.getByText(terms.find((term) => term.id === "dohyo")!.description),
    ).toBeInTheDocument();

    // 未発見のものは名前も伏せ字も出さない。
    expect(screen.queryByText("まわし")).not.toBeInTheDocument();
    expect(screen.queryByText("？？？")).not.toBeInTheDocument();
  });

  it("五十音順に並べる", async () => {
    // 表記の文字コード順とは異なる並びになる組み合わせを選ぶ。
    storeSave(
      createSave({ discoveredTermIds: ["mawashi", "dohyo", "rikishi"] }),
    );
    renderPage();

    await waitFor(() => expect(screen.getByText("土俵")).toBeInTheDocument());

    const names = screen
      .getAllByRole("term")
      .map((element) => element.textContent);
    // どひょう → まわし → りきし
    expect(names).toEqual([
      expect.stringContaining("土俵"),
      expect.stringContaining("まわし"),
      expect.stringContaining("力士"),
    ]);
  });

  it("発見数を出す", async () => {
    storeSave(createSave({ discoveredTermIds: ["dohyo", "mawashi"] }));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("2 のことばに出会った")).toBeInTheDocument(),
    );
  });

  it("まだ何も発見していない場合は案内を出す", async () => {
    storeSave(createSave());
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "まだ何もない" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("0 のことばに出会った")).toBeInTheDocument();
  });

  it("マップへ戻れる", async () => {
    storeSave(createSave());
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "マップへもどる" }),
      ).toHaveAttribute("href", "/map"),
    );
  });

  it("セーブがない場合はタイトルへ戻す", async () => {
    renderPage();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(
      screen.getByRole("region", { name: "記録がありません" }),
    ).toBeInTheDocument();
  });
});
