import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LESSON_FIGURES, LessonFigure } from "./index";
import { lessons } from "@/data/lessons";
import { LESSON_FIGURE_IDS } from "@/types/game";

// 学習に差し込む図（ADR-0009）。
//
// 図の見た目そのものは自動では確かめられない。
// ここで守るのは、見出しと説明が欠けないことと、
// データと図の対応が切れないことの2点に絞る。

describe("学習の図", () => {
  it.each(LESSON_FIGURE_IDS)("%s に見出しと説明がある", (figureId) => {
    const figure = LESSON_FIGURES[figureId];

    expect(figure.caption.trim()).not.toBe("");
    // 説明は読み上げ用。何が描かれているかが分かる長さを求める（設計書「15.」）。
    expect(figure.description.length).toBeGreaterThan(20);
  });

  it("学習データが参照する図がすべて存在する", () => {
    const referenced = lessons.flatMap((lesson) =>
      lesson.messages
        .map((message) => message.figureId)
        .filter((figureId) => figureId !== undefined),
    );

    expect(referenced.length).toBeGreaterThan(0);
    for (const figureId of referenced) {
      expect(LESSON_FIGURES[figureId]).toBeDefined();
    }
  });

  it("使われていない図を残さない", () => {
    // 図だけが残ると、直したときに画面で確かめられないまま古びる。
    const referenced = new Set(
      lessons.flatMap((lesson) =>
        lesson.messages.map((message) => message.figureId),
      ),
    );

    expect(
      LESSON_FIGURE_IDS.filter((figureId) => !referenced.has(figureId)),
    ).toEqual([]);
  });

  it("図はひとつの情報画像として読み上げる", () => {
    // 中の図形を1つずつ読み上げても意味が伝わらないため、
    // 図全体に説明を1つ与える（設計書「15.」情報画像には説明を付与）。
    render(<LessonFigure figureId="dohyo-layout" />);

    expect(
      screen.getByRole("img", {
        name: LESSON_FIGURES["dohyo-layout"].description,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(LESSON_FIGURES["dohyo-layout"].caption),
    ).toBeInTheDocument();
  });
});
