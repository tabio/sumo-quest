import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

describe("取組パートの操作", () => {
  it("キーボードだけで選択肢を選べる", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<BattleScene quizzes={[quiz]} onFinish={onFinish} />);

    // Tab で選択肢まで移動し、Enter で決定する。
    await user.tab();
    expect(
      screen.getByRole("button", { name: "取組を行う場所" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("status")).toHaveTextContent("せいかい");
  });

  it("スペースキーでも決定できる", async () => {
    const user = userEvent.setup();
    render(<BattleScene quizzes={[quiz]} onFinish={vi.fn()} />);

    await user.tab();
    await user.tab();
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
