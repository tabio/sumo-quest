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

  it("すべてクリアすると、最後の地点もクリア済みと出る", async () => {
    // 全クリア後は最後の地点が現在地になるため、表示の優先順位を確かめる。
    const cleared = Object.fromEntries(
      Object.keys(createSave().stageProgress).map((stageId) => [
        stageId,
        { status: "cleared", bestScore: 5, attempts: 1 },
      ]),
    ) as PlayerSave["stageProgress"];
    storeSave(createSave({ stageProgress: cleared }));
    renderMap();

    await waitFor(() =>
      expect(screen.getAllByText(/クリア済み/)).toHaveLength(6),
    );
    expect(screen.queryByText(/いまここ/)).not.toBeInTheDocument();
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

  it.each([
    ["わざずかん", "/techniques"],
    ["すもうじてん", "/dictionary"],
    ["ステータス", "/status"],
  ])("%s へ進める", async (label, href) => {
    storeSave(createSave());
    renderMap();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: label })).toHaveAttribute(
      "href",
      href,
    );
  });

  it("行き先の無いリンクを出さない", async () => {
    storeSave(createSave());
    renderMap();

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "ステータス" }),
      ).toBeInTheDocument(),
    );
    // 準備中の項目が残っていないこと。
    expect(screen.queryByText("準備中")).not.toBeInTheDocument();
  });
});
