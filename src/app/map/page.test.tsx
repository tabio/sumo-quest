import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import MapPage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// 設計書「6.3 ワールドマップ」。
// P1-9 の完了条件は「現在地・解放済み・クリア済み・未解放が色以外でも区別できる」。

function storeSave(save: PlayerSave) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderMap() {
  return render(
    <GameProvider>
      <MapPage />
    </GameProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replace.mockClear();
});

describe("ワールドマップ", () => {
  it("6地点を順番に表示する", async () => {
    storeSave(createSave());
    renderMap();

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "ワールドマップ" }),
      ).toBeInTheDocument(),
    );

    // 一覧はマップ以外にもあるため、ワールドマップの中だけを数える。
    const items = within(
      screen.getByRole("region", { name: "ワールドマップ" }),
    ).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveTextContent("すもう部屋");
    expect(items[5]).toHaveTextContent("横綱の城");
  });

  it("状態を文言でも区別できる", async () => {
    storeSave(
      createSave({
        stageProgress: {
          ...createSave().stageProgress,
          "sumo-stable": { status: "cleared", bestScore: 5, attempts: 1 },
          dohyo: { status: "unlocked", bestScore: 0, attempts: 0 },
        },
      }),
    );
    renderMap();

    await waitFor(() =>
      expect(screen.getByText(/クリア済み/)).toBeInTheDocument(),
    );
    // 現在地は解放済みで未クリアの最初のステージ。
    expect(screen.getByText(/いまここ/)).toBeInTheDocument();
    expect(screen.getAllByText(/まだ行けない/)).toHaveLength(4);
  });

  it("解放済みのステージへは進める", async () => {
    storeSave(createSave());
    renderMap();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /すもう部屋/ })).toHaveAttribute(
        "href",
        "/stage/sumo-stable",
      ),
    );
  });

  it("未解放のステージは操作できない", async () => {
    storeSave(createSave());
    renderMap();

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: /すもう部屋/ }),
      ).toBeInTheDocument(),
    );
    // リンクになっているのは解放済みの1件だけ。
    const stageLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/stage/"));
    expect(stageLinks).toHaveLength(1);
    expect(
      screen.getByText("横綱の城").closest("[aria-disabled]"),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("番付とEXPを常時表示する", async () => {
    storeSave(createSave({ playerName: "はなこ", experience: 100 }));
    renderMap();

    await waitFor(() => expect(screen.getByText("はなこ")).toBeInTheDocument());
    expect(screen.getByText("序二段")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(
      screen.getByText(/つぎの三段目まで あと 60 EXP/),
    ).toBeInTheDocument();
  });

  it("セーブがない場合はタイトルへ戻す", async () => {
    renderMap();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(
      screen.getByRole("region", { name: "記録がありません" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "タイトルへ" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("できている画面へは進める", async () => {
    storeSave(createSave());
    renderMap();

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "わざずかん" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: "わざずかん" })).toHaveAttribute(
      "href",
      "/techniques",
    );
  });

  // 辞典（P2-10）とステータス（P2-11）はまだ無い。
  // 画面が無いうちにリンクを出すと、押した利用者が404で行き止まりになる。
  it("まだ無い画面は準備中として押せない状態で並ぶ", async () => {
    storeSave(createSave());
    renderMap();

    await waitFor(() =>
      expect(screen.getByText("すもうじてん")).toBeInTheDocument(),
    );

    for (const label of ["すもうじてん", "ステータス"]) {
      expect(
        screen.getByText(label).closest("[aria-disabled]"),
      ).toHaveAttribute("aria-disabled", "true");
    }

    // 色以外でも準備中だと分かるようにする（設計書「15.」）。
    expect(screen.getAllByText("準備中")).toHaveLength(2);

    // 行き先の無いリンクを出さない。
    for (const href of ["/dictionary", "/status"]) {
      expect(document.querySelector(`a[href="${href}"]`)).toBeNull();
    }
  });
});
