import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { kimarite, kimariteSource } from "@/data/kimarite";
import { kimariteCategories } from "@/data/kimariteCategories";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import KimaritePage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// 決まり手一覧（ADR-0012）。
// 進行に連動せず全件を載せること、出典へ案内することを確かめる。

function storeSave(save: PlayerSave) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderPage() {
  return render(
    <GameProvider>
      <KimaritePage />
    </GameProvider>,
  );
}

async function waitForReady() {
  await waitFor(() =>
    expect(screen.getByText("決まり手 82 ＋ 非技 5")).toBeInTheDocument(),
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replace.mockClear();
});

describe("決まり手一覧", () => {
  it("セーブがなくても全件を名前と読みつきで載せる", async () => {
    renderPage();
    await waitForReady();

    const entries = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(entries).toEqual(
      kimarite.map((item) =>
        item.reading === item.name ? item.name : item.name + item.reading,
      ),
    );
    // 伏せ字は使わない。習得の記録ではないため。
    expect(screen.queryByText("？？？")).not.toBeInTheDocument();
  });

  it("分類ごとに件数つきで分け、各分類にその分類の技だけを載せる", async () => {
    renderPage();
    await waitForReady();

    for (const category of kimariteCategories) {
      const members = kimarite.filter(
        (item) => item.categoryId === category.id,
      );
      const region = screen.getByRole("region", {
        name: `${category.name}（${members.length}）`,
      });
      const names = within(region)
        .getAllByRole("listitem")
        .map((li) => li.firstChild?.textContent);
      expect(names).toEqual(members.map((item) => item.name));
    }
  });

  it("出典として協会のページを別タブで開ける", async () => {
    renderPage();
    await waitForReady();

    const link = screen.getByRole("link", { name: /協会のページをひらく/ });
    expect(link).toHaveAttribute("href", kimariteSource.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("セーブがなければタイトルへ、あればマップへ戻る", async () => {
    const { unmount } = renderPage();
    await waitForReady();
    expect(
      screen.getByRole("link", { name: "タイトルへもどる" }),
    ).toHaveAttribute("href", "/");
    unmount();

    storeSave(createSave());
    renderPage();
    await waitForReady();
    expect(
      screen.getByRole("link", { name: "マップへもどる" }),
    ).toHaveAttribute("href", "/map");
  });
});
