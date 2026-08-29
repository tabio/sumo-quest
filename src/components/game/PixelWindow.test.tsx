import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelWindow } from "./PixelWindow";

describe("PixelWindow", () => {
  it("見出しを渡すと領域名を持つ", () => {
    render(
      <PixelWindow heading="ようこそ">
        <p>本文</p>
      </PixelWindow>,
    );

    expect(
      screen.getByRole("region", { name: "ようこそ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "ようこそ" }),
    ).toBeInTheDocument();
  });

  it("見出しがない場合は領域を作らない", () => {
    render(
      <PixelWindow>
        <p>本文</p>
      </PixelWindow>,
    );

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByText("本文")).toBeInTheDocument();
  });
});
