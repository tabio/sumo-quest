import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { SAVE_KEY } from "@/lib/storage";
import NewGamePage from "./page";

// 設計書「6.2 名前入力」。
// P1-8 の完了条件は「1〜12文字、前後空白除去、空文字不可。決定で初期セーブ生成」。

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function renderPage() {
  return render(
    <GameProvider>
      <NewGamePage />
    </GameProvider>,
  );
}

function savedName(): string | undefined {
  const raw = window.localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw).data.playerName : undefined;
}

beforeEach(() => {
  window.localStorage.clear();
  push.mockClear();
});

describe("名前入力画面", () => {
  it("名前を決めると初期セーブが作られ、マップへ進む", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("あなたのしこ名は？"), "たろう");
    await user.click(screen.getByRole("button", { name: "けってい" }));

    await waitFor(() => expect(savedName()).toBe("たろう"));
    expect(push).toHaveBeenCalledWith("/map");
  });

  it("前後の空白を取り除いて保存する", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("あなたのしこ名は？"), "  たろう  ");
    await user.click(screen.getByRole("button", { name: "けってい" }));

    await waitFor(() => expect(savedName()).toBe("たろう"));
  });

  it("空文字では決定できない", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "けってい" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "なまえを入力してください。",
    );
    expect(push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it("空白だけでは決定できない", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("あなたのしこ名は？"), "   ");
    await user.click(screen.getByRole("button", { name: "けってい" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("13文字以上では決定できない", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByLabelText("あなたのしこ名は？"),
      "あ".repeat(13),
    );
    await user.click(screen.getByRole("button", { name: "けってい" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "なまえは12文字までです。",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("12文字ちょうどは決定できる", async () => {
    const user = userEvent.setup();
    renderPage();

    const name = "あ".repeat(12);
    await user.type(screen.getByLabelText("あなたのしこ名は？"), name);
    await user.click(screen.getByRole("button", { name: "けってい" }));

    await waitFor(() => expect(savedName()).toBe(name));
  });

  it("入力し直すとエラー表示が消える", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "けってい" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.type(screen.getByLabelText("あなたのしこ名は？"), "た");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("エラー時は入力欄に不正であることを伝える", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "けってい" }));

    await waitFor(() =>
      expect(screen.getByLabelText("あなたのしこ名は？")).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
  });

  it("やめるとタイトルへ戻れる", async () => {
    renderPage();
    expect(screen.getByRole("link", { name: "やめる" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
