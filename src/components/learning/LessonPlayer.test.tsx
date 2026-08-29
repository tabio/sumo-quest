import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LESSON_FIGURES } from "@/components/learning/figures";
import { LessonPlayer } from "@/components/learning/LessonPlayer";
import { lessons } from "@/data/lessons";
import type { Lesson } from "@/types/game";

// 学習パートの表示（P4-8）。
// 代替テキストの方針：装飾は空、情報を持つ画像には説明を付ける。

const lesson = lessons[0];

describe("学習パートの画像", () => {
  it("話者の立ち絵は装飾として扱い、代替テキストを空にする", () => {
    render(<LessonPlayer lesson={lesson} onComplete={vi.fn()} />);

    // 名前は隣に文字で出ているため、画像に同じ情報を持たせない。
    const portrait = document.querySelector("img");
    expect(portrait).not.toBeNull();
    expect(portrait).toHaveAttribute("alt", "");
    expect(screen.getByText("親方")).toBeInTheDocument();

    // 空の代替テキストは支援技術から辿れない扱いになる。
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

// 図の差し込み（ADR-0009）。
// 図はすべての画面に付くわけではない。付いている画面でだけ出る。

const withFigure: Lesson = {
  id: "figure-lesson",
  stageId: "dohyo",
  speakerId: "oyakata",
  messages: [
    { text: "ここが土俵だ。" },
    { text: "円のふちには俵がうめてある。", figureId: "dohyo-layout" },
  ],
  rewardExp: 0,
};

describe("学習パートの図", () => {
  it("図のない画面では図を出さない", () => {
    render(<LessonPlayer lesson={withFigure} onComplete={vi.fn()} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("図のある画面で、説明つきの図を出す", async () => {
    const user = userEvent.setup();
    render(<LessonPlayer lesson={withFigure} onComplete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "つぎへ" }));

    expect(
      screen.getByRole("img", {
        name: LESSON_FIGURES["dohyo-layout"].description,
      }),
    ).toBeInTheDocument();
  });
});
