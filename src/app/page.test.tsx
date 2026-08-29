import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

// テストランナーが動作することを確認するための最小のテスト。
describe("トップページ", () => {
  it("タイトルを表示する", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "SUMO QUEST" }),
    ).toBeInTheDocument();
  });
});
