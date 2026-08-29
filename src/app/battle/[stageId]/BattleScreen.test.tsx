import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { quizzes } from "@/data/quizzes";
import { stages } from "@/data/stages";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import { BattleScreen } from "./BattleScreen";

// 設計書「6.5 取組」。
// P1-11 の完了条件は「選択肢の正誤演出と解説、同一問題の二重加点なし」。

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

const stage1Quizzes = quizzes.filter((quiz) => quiz.stageId === "sumo-stable");

function unlockedSave(overrides: Partial<PlayerSave> = {}): PlayerSave {
  const base = createSave(overrides);
  return {
    ...base,
    stageProgress: {
      ...base.stageProgress,
      "sumo-stable": {
        status: "lessonCompleted",
        bestScore: 0,
        attempts: 0,
      },
    },
  };
}

function storeSave(save: PlayerSave = unlockedSave()) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderBattle(stageId = "sumo-stable") {
  return render(
    <GameProvider>
      <BattleScreen stageId={stageId} />
    </GameProvider>,
  );
}

function saved(): PlayerSave | undefined {
  const raw = window.localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw).data : undefined;
}

/** すべての問題に、正解または不正解で回答する。 */
async function answerAll(
  user: ReturnType<typeof userEvent.setup>,
  correct: boolean,
) {
  for (const [index, quiz] of stage1Quizzes.entries()) {
    const choice = correct
      ? quiz.choices.find((c) => c.id === quiz.correctChoiceId)
      : quiz.choices.find((c) => c.id !== quiz.correctChoiceId);

    await user.click(screen.getByRole("button", { name: choice?.label ?? "" }));

    const isLast = index === stage1Quizzes.length - 1;
    await user.click(
      screen.getByRole("button", {
        name: isLast ? "けっかへ" : "つぎの問題へ",
      }),
    );
  }
}

beforeEach(() => {
  window.localStorage.clear();
  push.mockClear();
  replace.mockClear();
});

describe("取組画面", () => {
  it("1問ずつ表示し、進捗を出す", async () => {
    storeSave();
    renderBattle();

    await waitFor(() =>
      expect(screen.getByText(stage1Quizzes[0].question)).toBeInTheDocument(),
    );
    expect(
      screen.getByText(`1 問目 / 全 ${stage1Quizzes.length} 問`),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(stage1Quizzes[1].question),
    ).not.toBeInTheDocument();
  });

  it("正解すると正誤と解説が出る", async () => {
    const user = userEvent.setup();
    storeSave();
    renderBattle();

    const quiz = stage1Quizzes[0];
    await waitFor(() =>
      expect(screen.getByText(quiz.question)).toBeInTheDocument(),
    );

    const correct = quiz.choices.find((c) => c.id === quiz.correctChoiceId);
    await user.click(
      screen.getByRole("button", { name: correct?.label ?? "" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("せいかい");
    expect(screen.getByText(quiz.explanation)).toBeInTheDocument();
  });

  it("不正解でも解説が出て、先に進める", async () => {
    const user = userEvent.setup();
    storeSave();
    renderBattle();

    const quiz = stage1Quizzes[0];
    await waitFor(() =>
      expect(screen.getByText(quiz.question)).toBeInTheDocument(),
    );

    const wrong = quiz.choices.find((c) => c.id !== quiz.correctChoiceId);
    await user.click(screen.getByRole("button", { name: wrong?.label ?? "" }));

    expect(screen.getByRole("status")).toHaveTextContent("まちがい");
    expect(screen.getByText(quiz.explanation)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "つぎの問題へ" }),
    ).toBeInTheDocument();
  });

  it("回答後は選択肢を押し直せない", async () => {
    const user = userEvent.setup();
    storeSave();
    renderBattle();

    const quiz = stage1Quizzes[0];
    await waitFor(() =>
      expect(screen.getByText(quiz.question)).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole("button", { name: quiz.choices[0].label }),
    );

    for (const choice of quiz.choices) {
      expect(screen.getByRole("button", { name: choice.label })).toBeDisabled();
    }
  });

  it("全問正解でクリアし、次のステージが解放される", async () => {
    const user = userEvent.setup();
    storeSave();
    renderBattle();

    await waitFor(() =>
      expect(screen.getByText(stage1Quizzes[0].question)).toBeInTheDocument(),
    );
    await answerAll(user, true);

    await waitFor(() =>
      expect(saved()?.stageProgress["sumo-stable"].status).toBe("cleared"),
    );
    // 正解5問ぶん + クリア報酬。
    expect(saved()?.experience).toBe(10 * stage1Quizzes.length + 50);
    expect(saved()?.stageProgress.dohyo.status).toBe("unlocked");
    expect(push).toHaveBeenCalledWith("/result/sumo-stable");
  });

  it("全問不正解では合格せず、進行不能にもならない", async () => {
    const user = userEvent.setup();
    storeSave();
    renderBattle();

    await waitFor(() =>
      expect(screen.getByText(stage1Quizzes[0].question)).toBeInTheDocument(),
    );
    await answerAll(user, false);

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(saved()?.stageProgress["sumo-stable"].status).toBe(
      "lessonCompleted",
    );
    expect(saved()?.experience).toBe(0);
    // 再挑戦できるよう、解放状態は保たれる。
    expect(saved()?.stageProgress.dohyo.status).toBe("locked");
  });

  it("再挑戦しても同じ問題では二重に加点しない", async () => {
    const user = userEvent.setup();
    storeSave();
    const first = renderBattle();

    await waitFor(() =>
      expect(screen.getByText(stage1Quizzes[0].question)).toBeInTheDocument(),
    );
    await answerAll(user, true);
    await waitFor(() =>
      expect(saved()?.experience).toBe(10 * stage1Quizzes.length + 50),
    );

    first.unmount();
    renderBattle();

    await waitFor(() =>
      expect(screen.getByText(stage1Quizzes[0].question)).toBeInTheDocument(),
    );
    await answerAll(user, true);

    await waitFor(() => expect(push).toHaveBeenCalledTimes(2));
    // 2周目は加点なし。
    expect(saved()?.experience).toBe(10 * stage1Quizzes.length + 50);
  });

  it("未解放のステージへの直リンクはマップへ戻す", async () => {
    storeSave();
    renderBattle("dohyo");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/map"));
    expect(
      screen.getByRole("region", { name: "まだ行けません" }),
    ).toBeInTheDocument();
  });

  it("問題がないステージでは準備中を出す", async () => {
    // どのステージが未投入かはコンテンツの追加とともに変わるため、データから引く。
    const empty = stages.find((stage) => stage.quizIds.length === 0)!;
    storeSave(
      unlockedSave({
        stageProgress: {
          ...createSave().stageProgress,
          "sumo-stable": { status: "cleared", bestScore: 5, attempts: 1 },
          [empty.id]: { status: "unlocked", bestScore: 0, attempts: 0 },
        },
      }),
    );
    renderBattle(empty.id);

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "準備中" }),
      ).toBeInTheDocument(),
    );
  });
});
