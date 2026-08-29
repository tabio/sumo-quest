import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { StageExit } from "./StageExit";

// ステージ途中の離脱導線（ADR-0008）。
// 学習と取組は最後まで進めないと次の画面へ移らないため、ここが唯一の抜け道になる。

const WARNING = "とちゅうでやめた取組は記録されません。";

describe("ステージ途中の離脱", () => {
  it("押しただけでは移動せず、まず確認する", async () => {
    const user = userEvent.setup();
    render(<StageExit warning={WARNING} />);

    expect(
      screen.queryByRole("link", { name: "タイトルへもどる" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "やめる" }));

    const confirm = screen.getByRole("region", { name: "ここでやめますか" });
    expect(confirm).toHaveTextContent(WARNING);
    // 何が消えて何が残るのかを、やめる前に伝える。
    expect(confirm).toHaveTextContent("これまでの記録");
  });

  it("タイトルとマップのどちらへも戻れる", async () => {
    const user = userEvent.setup();
    render(<StageExit warning={WARNING} />);

    await user.click(screen.getByRole("button", { name: "やめる" }));

    expect(
      screen.getByRole("link", { name: "タイトルへもどる" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "マップへもどる" }),
    ).toHaveAttribute("href", "/map");
  });

  it("やめずに続けられる", async () => {
    const user = userEvent.setup();
    render(<StageExit warning={WARNING} />);

    await user.click(screen.getByRole("button", { name: "やめる" }));
    await user.click(screen.getByRole("button", { name: "つづける" }));

    expect(
      screen.queryByRole("region", { name: "ここでやめますか" }),
    ).not.toBeInTheDocument();
  });

  it("確認を開いても、押したボタンは消えない", async () => {
    const user = userEvent.setup();
    render(<StageExit warning={WARNING} />);

    // 押した要素が消えるとフォーカスが body へ落ち、キーボード操作の位置を見失う。
    const trigger = screen.getByRole("button", { name: "やめる" });
    await user.click(trigger);

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
