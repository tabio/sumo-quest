import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PixelButton } from "./PixelButton";

describe("PixelButton", () => {
  it("既定で type=button となり、フォームを送信しない", () => {
    render(<PixelButton>はじめから</PixelButton>);
    expect(screen.getByRole("button", { name: "はじめから" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("キーボードで押せる", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PixelButton onClick={onClick}>取組へ</PixelButton>);

    await user.tab();
    expect(screen.getByRole("button", { name: "取組へ" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("無効時は押せない", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <PixelButton disabled onClick={onClick}>
        つづきから
      </PixelButton>,
    );

    await user.click(screen.getByRole("button", { name: "つづきから" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("選択中を色以外でも伝える", () => {
    render(<PixelButton selected>技図鑑</PixelButton>);
    expect(screen.getByRole("button", { name: "技図鑑" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
