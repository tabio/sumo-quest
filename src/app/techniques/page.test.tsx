import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { techniques } from "@/data/techniques";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import TechniquesPage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// 技図鑑（P2-9）。
// PRD「9. コレクション」の完了条件は「未習得は『？？？』で掲載」。

function storeSave(save: PlayerSave) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderPage() {
  return render(
    <GameProvider>
      <TechniquesPage />
    </GameProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replace.mockClear();
});

describe("技図鑑", () => {
  it("習得済みの技は名前と説明を出す", async () => {
    storeSave(createSave({ learnedTechniqueIds: ["yorikiri"] }));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("寄り切り")).toBeInTheDocument(),
    );
    expect(
      screen.getByText(
        techniques.find((technique) => technique.id === "yorikiri")!
          .description,
      ),
    ).toBeInTheDocument();
  });

  it("未習得の技は名前を伏せる", async () => {
    storeSave(createSave({ learnedTechniqueIds: ["yorikiri"] }));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("寄り切り")).toBeInTheDocument(),
    );
    // 習得済みの1件をのぞく全件が伏せられる。
    expect(screen.getAllByText("？？？")).toHaveLength(techniques.length - 1);
    expect(screen.queryByText("押し出し")).not.toBeInTheDocument();
  });

  it("未習得も件数には数え、残りが分かるようにする", async () => {
    storeSave(createSave({ learnedTechniqueIds: ["yorikiri"] }));
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText(`${techniques.length} のうち 1 をおぼえた`),
      ).toBeInTheDocument(),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(techniques.length);
  });

  it("難易度を記号だけで伝えない", async () => {
    storeSave(createSave({ learnedTechniqueIds: [] }));
    renderPage();

    await waitFor(() =>
      expect(screen.getAllByText(/むずかしさ/)).toHaveLength(techniques.length),
    );
    // 記号は読み上げから隠し、数値を添える（設計書「15.」）。
    for (const technique of techniques) {
      expect(
        screen.getAllByText(String(technique.difficulty)).length,
      ).toBeGreaterThan(0);
    }
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

  it("セーブがなくても開ける", async () => {
    // タイトルからの導線に含まれるため（PRD「12. 主要画面」）。
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "決まり手" }),
      ).toBeInTheDocument(),
    );
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getAllByText("？？？")).toHaveLength(techniques.length);
    expect(
      screen.getByText(`${techniques.length} のうち 0 をおぼえた`),
    ).toBeInTheDocument();
    // マップへは入れないため、戻り先はタイトルにする。
    expect(
      screen.getByRole("link", { name: "タイトルへもどる" }),
    ).toHaveAttribute("href", "/");
  });
});
