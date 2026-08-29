import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BattleScene } from "@/components/battle/BattleScene";
import type { Quiz } from "@/types/game";

// 取組パートの操作性（P4-1）。
// testing.md「コンポーネントテスト」の「選択肢をキーボードとタッチで選べる」に対応する。

const quiz: Quiz = {
  id: "quiz-1",
  stageId: "sumo-stable",
  question: "土俵とは？",
  choices: [
    { id: "a", label: "取組を行う場所" },
    { id: "b", label: "力士の帯" },
  ],
  correctChoiceId: "a",
  explanation: "正解は取組を行う場所。",
  rewardExp: 10,
};

/** 表示されている選択肢ボタンを、画面に出ている順で返す。 */
function choiceButtons(): HTMLElement[] {
  return screen
    .getAllByRole("listitem")
    .map((item) => within(item).getByRole("button"));
}

/**
 * 指定した表示の選択肢までTabで移動する。
 * 並びはランダムなため（ADR-0010）、何番目かではなく表示で指定する。
 */
async function tabToChoice(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
): Promise<void> {
  const position = choiceButtons().findIndex(
    (button) => button.textContent?.trim() === label,
  );
  for (let step = 0; step <= position; step++) {
    await user.tab();
  }
}

describe("取組パートの操作", () => {
  it("キーボードだけで選択肢を選べる", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<BattleScene quizzes={[quiz]} onFinish={onFinish} />);

    // Tab で選択肢まで移動し、Enter で決定する。
    await tabToChoice(user, "取組を行う場所");
    expect(
      screen.getByRole("button", { name: "取組を行う場所" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("status")).toHaveTextContent("せいかい");
  });

  it("スペースキーでも決定できる", async () => {
    const user = userEvent.setup();
    render(<BattleScene quizzes={[quiz]} onFinish={vi.fn()} />);

    await tabToChoice(user, "力士の帯");
    expect(screen.getByRole("button", { name: "力士の帯" })).toHaveFocus();
    await user.keyboard(" ");

    expect(screen.getByRole("status")).toHaveTextContent("まちがい");
  });

  it("回答後は次へ進むボタンへ移れる", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<BattleScene quizzes={[quiz]} onFinish={onFinish} />);

    await user.click(screen.getByRole("button", { name: "取組を行う場所" }));
    await user.click(screen.getByRole("button", { name: "けっかへ" }));

    expect(onFinish).toHaveBeenCalledWith([
      expect.objectContaining({ quizId: "quiz-1", correct: true }),
    ]);
  });

  it("回答済みの選択肢は押し直せない", async () => {
    const user = userEvent.setup();
    render(<BattleScene quizzes={[quiz]} onFinish={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "取組を行う場所" }));
    expect(screen.getByRole("button", { name: "力士の帯" })).toBeDisabled();
  });
});

// 選択肢の並びのランダム化（ADR-0010）。
// 位置ではなく内容で答えさせるため、正解が毎回同じ位置に出ないことを確かめる。

const threeChoiceQuiz: Quiz = {
  id: "quiz-2",
  stageId: "sumo-stable",
  question: "行司が持つものは？",
  choices: [
    { id: "a", label: "軍配" },
    { id: "b", label: "まわし" },
    { id: "c", label: "俵" },
  ],
  correctChoiceId: "a",
  explanation: "正解は軍配。",
  rewardExp: 10,
};

function renderedLabels(): string[] {
  return screen.getAllByRole("listitem").map((item) => item.textContent ?? "");
}

describe("選択肢の並び", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("マスターデータの並びのまま出さない", () => {
    // Fisher-Yates は末尾から入れ替える。常に0を返すと先頭へ寄る。
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<BattleScene quizzes={[threeChoiceQuiz]} onFinish={vi.fn()} />);

    expect(renderedLabels()).not.toEqual(["軍配", "まわし", "俵"]);
  });

  it("選択肢を落とさない", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    render(<BattleScene quizzes={[threeChoiceQuiz]} onFinish={vi.fn()} />);

    expect([...renderedLabels()].sort()).toEqual(
      ["軍配", "まわし", "俵"].sort(),
    );
  });

  it("並べ替えても正解の判定は変わらない", async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<BattleScene quizzes={[threeChoiceQuiz]} onFinish={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "軍配" }));

    expect(screen.getByRole("status")).toHaveTextContent("せいかい");
  });

  it("回答しても選択肢の並びが入れ替わらない", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<BattleScene quizzes={[threeChoiceQuiz]} onFinish={onFinish} />);

    const before = renderedLabels();
    await user.click(screen.getByRole("button", { name: "まわし" }));

    expect(renderedLabels()).toEqual(before);
  });
});
