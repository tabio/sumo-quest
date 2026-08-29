import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import TitlePage from "./page";

// 設計書「6.1 タイトル」を検証する。
// P1-7 の完了条件は「セーブ有無でつづきからの活性が変わる」「上書き確認が出る」。

function renderTitle() {
  return render(
    <GameProvider>
      <TitlePage />
    </GameProvider>,
  );
}

function storeSave(save = createSave()) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("タイトル画面", () => {
  it("タイトルを表示する", async () => {
    renderTitle();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "SUMO QUEST" }),
      ).toBeInTheDocument(),
    );
  });

  it("セーブがない場合はつづきからが押せない", async () => {
    renderTitle();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "つづきから" })).toBeDisabled(),
    );
    // はじめからは名前入力へのリンクになる。
    expect(screen.getByRole("link", { name: "はじめから" })).toHaveAttribute(
      "href",
      "/new-game",
    );
  });

  it("セーブがある場合はつづきからがマップへのリンクになる", async () => {
    storeSave(createSave({ playerName: "はなこ", experience: 40 }));
    renderTitle();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "つづきから" })).toHaveAttribute(
        "href",
        "/map",
      ),
    );
    expect(screen.getByText(/はなこ/)).toBeInTheDocument();
  });

  it("セーブがある状態ではじめからを選ぶと上書き確認が出る", async () => {
    const user = userEvent.setup();
    storeSave();
    renderTitle();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "はじめから" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "はじめから" }));

    expect(
      screen.getByRole("region", { name: "はじめから始めますか" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "消してはじめる" }),
    ).toHaveAttribute("href", "/new-game");
  });

  it("上書き確認はやめると元に戻る", async () => {
    const user = userEvent.setup();
    storeSave();
    renderTitle();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "はじめから" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "はじめから" }));
    await user.click(screen.getByRole("button", { name: "やめる" }));

    expect(
      screen.queryByRole("region", { name: "はじめから始めますか" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "メニュー" }),
    ).toBeInTheDocument();
  });

  it("セーブが壊れている場合は案内を出し、データを消さない", async () => {
    window.localStorage.setItem(SAVE_KEY, "{壊れている");
    renderTitle();

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "セーブデータを読み込めません" }),
      ).toBeInTheDocument(),
    );
    expect(window.localStorage.getItem(SAVE_KEY)).toBe("{壊れている");
    // 続きからは選べない。
    expect(screen.getByRole("button", { name: "つづきから" })).toBeDisabled();
  });

  it("図鑑と辞典への導線がある", async () => {
    renderTitle();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "わざずかん" })).toHaveAttribute(
        "href",
        "/techniques",
      ),
    );
    expect(screen.getByRole("link", { name: "すもうじてん" })).toHaveAttribute(
      "href",
      "/dictionary",
    );
  });
});
