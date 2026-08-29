import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonPlayer } from "@/components/learning/LessonPlayer";
import { lessons } from "@/data/lessons";

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
