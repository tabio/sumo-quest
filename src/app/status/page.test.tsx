import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { stages } from "@/data/stages";
import { techniques } from "@/data/techniques";
import { terms } from "@/data/terms";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import StatusPage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// ステータス画面（P2-11）。
// 完了条件は「名前・番付・EXP・進捗が表示される」。

function storeSave(save: PlayerSave) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderPage() {
  return render(
    <GameProvider>
      <StatusPage />
    </GameProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replace.mockClear();
});

describe("ステータス画面", () => {
  it("名前・番付・EXPを出す", async () => {
    storeSave(createSave({ playerName: "ちからまる", experience: 100 }));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("ちからまる")).toBeInTheDocument(),
    );
    expect(screen.getByText("序二段")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(/三段目 まで あと 60 EXP/)).toBeInTheDocument();
  });

  it("集めたものの数を出す", async () => {
    storeSave(
      createSave({
        learnedTechniqueIds: ["yorikiri"],
        discoveredTermIds: ["dohyo", "mawashi"],
      }),
    );
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText(`${techniques.length} のうち 1`),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(`${terms.length} のうち 2`)).toBeInTheDocument();
    // 初期状態ではまだ1つもクリアしていない。
    expect(screen.getByText(`${stages.length} のうち 0`)).toBeInTheDocument();
  });

  it("ばしょごとの進行と挑戦の記録を出す", async () => {
    storeSave(
      createSave({
        stageProgress: {
          ...createSave().stageProgress,
          "sumo-stable": { status: "cleared", bestScore: 4, attempts: 2 },
        },
        quizHistory: [
          {
            stageId: "sumo-stable",
            score: 4,
            total: 5,
            answeredAt: "2026-08-29T12:00:00.000Z",
          },
        ],
      }),
    );
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("すもう部屋")).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/クリア／2 回 挑戦／最高 4 問/),
    ).toBeInTheDocument();
    expect(screen.getByText("直近の正答率 80%")).toBeInTheDocument();

    // 6地点すべての状態が並ぶ。
    expect(screen.getAllByRole("listitem")).toHaveLength(stages.length);
    // 手で作った記録なので、クリアした1件以外は未解放のまま。
    expect(screen.getAllByText(/まだ行けない／挑戦はまだ/)).toHaveLength(
      stages.length - 1,
    );
  });

  it("最上位ではつぎの番付を出さない", async () => {
    storeSave(
      createSave({
        experience: 2000,
        stageProgress: {
          ...createSave().stageProgress,
          "yokozuna-castle": { status: "cleared", bestScore: 5, attempts: 1 },
        },
      }),
    );
    renderPage();

    await waitFor(() => expect(screen.getByText("横綱")).toBeInTheDocument());
    expect(screen.getByText("これより上はない")).toBeInTheDocument();
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
