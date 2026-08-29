import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { quizzes } from "@/data/quizzes";
import { stages } from "@/data/stages";
import { useGame } from "@/hooks/useGame";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import { ResultScreen } from "./ResultScreen";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// 設計書「6.6 リザルト」。
// P1-12 の完了条件は「報酬計算と保存が一度だけ実行される」。
//
// この画面は表示だけを行うため、「一度だけ」は構造として満たされる（ADR-0004）。
// ここでは、再描画・再読み込みでEXPが増えないことを確認する。

const stage = stages[0];
const stage1Quizzes = quizzes.filter((quiz) => quiz.stageId === stage.id);

/** 取組の終了を再現してから、リザルトを描画する。 */
function Harness({ allCorrect }: { allCorrect: boolean }) {
  const { dispatch } = useGame();

  return (
    <div>
      <button
        onClick={() =>
          dispatch({
            type: "FINISH_BATTLE",
            stage,
            results: stage1Quizzes.map((quiz, index) => ({
              quizId: quiz.id,
              // 不合格を作るときは最初の1問だけ正解にする。
              correct: allCorrect || index === 0,
            })),
            now: "2026-08-29T12:00:00.000Z",
          })
        }
      >
        取組をおえる
      </button>
      <ResultScreen stageId={stage.id} />
    </div>
  );
}

function storeSave(save: PlayerSave = createSave()) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderResult(allCorrect = true) {
  return render(
    <GameProvider>
      <Harness allCorrect={allCorrect} />
    </GameProvider>,
  );
}

function saved(): PlayerSave | undefined {
  const raw = window.localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw).data : undefined;
}

beforeEach(() => {
  window.localStorage.clear();
  replace.mockClear();
});

describe("リザルト画面", () => {
  it("合格時に成績と報酬を表示する", async () => {
    const user = userEvent.setup();
    storeSave();
    renderResult();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取組をおえる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "取組をおえる" }));

    expect(screen.getByRole("status")).toHaveTextContent("かちこし");
    expect(
      screen.getByText(`${stage1Quizzes.length} / ${stage1Quizzes.length}`),
    ).toBeInTheDocument();
    // 正解5問ぶん + クリア報酬50。
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("昇進した場合は前後の番付を出す", async () => {
    const user = userEvent.setup();
    // 60 EXP から始めると、100 EXP 獲得で 160 EXP になり三段目へ上がる。
    storeSave(createSave({ experience: 60 }));
    renderResult();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取組をおえる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "取組をおえる" }));

    expect(screen.getByRole("region", { name: "成績" })).toHaveTextContent(
      "序ノ口 → 三段目",
    );
    expect(screen.getByRole("region", { name: "成績" })).toHaveTextContent(
      "番付が 三段目 に上がった。",
    );
  });

  it("昇進していない場合は現在の番付だけを出す", async () => {
    const user = userEvent.setup();
    // 大関（1060）から100 EXP増えても、横綱は最終試験が条件なので昇進しない。
    storeSave(createSave({ experience: 1060 }));
    renderResult();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取組をおえる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "取組をおえる" }));

    const summary = screen.getByRole("region", { name: "成績" });
    expect(summary).toHaveTextContent("大関");
    expect(summary).not.toHaveTextContent("→");
  });

  it("次のステージの解放を知らせる", async () => {
    const user = userEvent.setup();
    storeSave();
    renderResult();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取組をおえる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "取組をおえる" }));

    expect(
      screen.getByRole("region", { name: "あたらしい場所" }),
    ).toHaveTextContent("土俵");
  });

  it("不合格では再挑戦の導線を出す", async () => {
    const user = userEvent.setup();
    storeSave();
    renderResult(false);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取組をおえる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "取組をおえる" }));

    expect(screen.getByRole("status")).toHaveTextContent("まけこし");
    expect(
      screen.getByRole("link", { name: "もういちど挑戦する" }),
    ).toHaveAttribute("href", `/battle/${stage.id}`);
  });

  it("表示し直してもEXPが増えない", async () => {
    const user = userEvent.setup();
    storeSave();
    const view = renderResult();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取組をおえる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "取組をおえる" }));
    await waitFor(() => expect(saved()?.experience).toBe(100));

    // 再描画しても報酬計算は走らない。
    view.rerender(
      <GameProvider>
        <Harness allCorrect />
      </GameProvider>,
    );

    expect(saved()?.experience).toBe(100);
  });

  it("再読み込み相当では結果を表示せず、EXPも増えない", async () => {
    const user = userEvent.setup();
    storeSave();
    const first = renderResult();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取組をおえる" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "取組をおえる" }));
    await waitFor(() => expect(saved()?.experience).toBe(100));

    first.unmount();
    render(
      <GameProvider>
        <ResultScreen stageId={stage.id} />
      </GameProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "表示できる結果がありません" }),
      ).toBeInTheDocument(),
    );
    expect(saved()?.experience).toBe(100);
  });

  it("別ステージの結果は表示しない", async () => {
    storeSave();
    render(
      <GameProvider>
        <ResultScreen stageId="dohyo" />
      </GameProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "表示できる結果がありません" }),
      ).toBeInTheDocument(),
    );
  });

  it("マップへ戻れる", async () => {
    storeSave();
    render(
      <GameProvider>
        <ResultScreen stageId={stage.id} />
      </GameProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "マップへもどる" }),
      ).toHaveAttribute("href", "/map"),
    );
  });
});
