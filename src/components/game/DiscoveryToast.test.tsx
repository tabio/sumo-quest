import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DiscoveryToast } from "./DiscoveryToast";

// 技の習得と用語の発見の通知（P2-8）。
// 名前の解決はマスターデータに任せるため、実データのIDで確認する。

describe("おぼえたことの通知", () => {
  it("覚えた技と用語を名前で出す", () => {
    render(<DiscoveryToast techniqueIds={["yorikiri"]} termIds={["dohyo"]} />);

    const region = screen.getByRole("region", { name: "おぼえたこと" });
    expect(region).toHaveTextContent("寄り切り");
    expect(region).toHaveTextContent("土俵");
    // 種別を色ではなく文言で示す（設計書「15.」）。
    expect(region).toHaveTextContent("わざ");
    expect(region).toHaveTextContent("ことば");
  });

  it("何も増えていない場合は出さない", () => {
    render(<DiscoveryToast techniqueIds={[]} termIds={[]} />);

    expect(
      screen.queryByRole("region", { name: "おぼえたこと" }),
    ).not.toBeInTheDocument();
  });

  it("閉じる操作が渡された場合だけ、閉じるボタンを出す", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { rerender } = render(
      <DiscoveryToast techniqueIds={["yorikiri"]} termIds={[]} />,
    );
    expect(
      screen.queryByRole("button", { name: "とじる" }),
    ).not.toBeInTheDocument();

    rerender(
      <DiscoveryToast
        techniqueIds={["yorikiri"]}
        termIds={[]}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole("button", { name: "とじる" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("途中で現れる場合は読み上げに変化として伝える", () => {
    render(<DiscoveryToast techniqueIds={["yorikiri"]} termIds={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent("寄り切り");
  });

  it("最初から載っている場合は通知として扱わない", () => {
    render(
      <DiscoveryToast
        techniqueIds={["yorikiri"]}
        termIds={[]}
        announce={false}
      />,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "おぼえたこと" }),
    ).toHaveTextContent("寄り切り");
  });

  it("データに無いIDはIDのまま出し、表示を欠けさせない", () => {
    render(<DiscoveryToast techniqueIds={["unknown"]} termIds={[]} />);

    expect(
      screen.getByRole("region", { name: "おぼえたこと" }),
    ).toHaveTextContent("unknown");
  });
});
