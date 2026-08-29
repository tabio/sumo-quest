import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { techniques } from "@/data/techniques";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import { useGame } from "./useGame";

// フック経由で導出値が取れることを確認する。
// 計算そのものは selectors.test.ts が担当する。

function Probe() {
  const game = useGame();

  return (
    <ul>
      <li data-testid="ready">{String(game.isReady)}</li>
      <li data-testid="hasSave">{String(game.hasSave)}</li>
      <li data-testid="rank">{game.rank?.name ?? "なし"}</li>
      <li data-testid="next">{game.nextRank?.name ?? "なし"}</li>
      <li data-testid="toNext">{game.experienceToNextRank ?? "なし"}</li>
      <li data-testid="stage">{game.currentStage?.name ?? "なし"}</li>
      <li data-testid="unlocked">{String(game.isUnlocked("sumo-stable"))}</li>
      <li data-testid="locked">{String(game.isUnlocked("dohyo"))}</li>
      <li data-testid="techniqueRate">{game.techniqueCollectionRate}</li>
    </ul>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("useGame", () => {
  it("セーブがない場合でも例外にならない", async () => {
    render(
      <GameProvider>
        <Probe />
      </GameProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("ready")).toHaveTextContent("true"),
    );
    expect(screen.getByTestId("hasSave")).toHaveTextContent("false");
    expect(screen.getByTestId("rank")).toHaveTextContent("なし");
    expect(screen.getByTestId("techniqueRate")).toHaveTextContent("0");
  });

  it("セーブから導出値を返す", async () => {
    const save = createSave({
      experience: 100,
      learnedTechniqueIds: ["yorikiri"],
    });
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));

    render(
      <GameProvider>
        <Probe />
      </GameProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("hasSave")).toHaveTextContent("true"),
    );
    expect(screen.getByTestId("rank")).toHaveTextContent("序二段");
    expect(screen.getByTestId("next")).toHaveTextContent("三段目");
    expect(screen.getByTestId("toNext")).toHaveTextContent("60");
    expect(screen.getByTestId("stage")).toHaveTextContent("すもう部屋");
    expect(screen.getByTestId("unlocked")).toHaveTextContent("true");
    expect(screen.getByTestId("locked")).toHaveTextContent("false");
    // 技の総数は決まり手の投入とともに増えるため、データから導く。
    expect(screen.getByTestId("techniqueRate")).toHaveTextContent(
      String(1 / techniques.length),
    );
  });

  it("Provider の外で使うと分かるエラーになる", () => {
    expect(() => render(<Probe />)).toThrowError(
      /GameProvider の内側で使うこと/,
    );
  });
});
