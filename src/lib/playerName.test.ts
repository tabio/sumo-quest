import { describe, expect, it } from "vitest";
import {
  PLAYER_NAME_MAX_LENGTH,
  normalizePlayerName,
  validatePlayerName,
} from "./playerName";

// 設計書「6.2 名前入力」の規則を検証する。

describe("normalizePlayerName", () => {
  it("前後の空白を除去する", () => {
    expect(normalizePlayerName("  たろう  ")).toBe("たろう");
  });

  it("全角空白も除去する", () => {
    expect(normalizePlayerName("　たろう　")).toBe("たろう");
  });

  it("途中の空白は残す", () => {
    expect(normalizePlayerName("たろう じろう")).toBe("たろう じろう");
  });
});

describe("validatePlayerName", () => {
  it("1文字を受け付ける", () => {
    expect(validatePlayerName("あ")).toEqual({ ok: true, name: "あ" });
  });

  it("上限ちょうどを受け付ける", () => {
    const name = "あ".repeat(PLAYER_NAME_MAX_LENGTH);
    expect(validatePlayerName(name)).toEqual({ ok: true, name });
  });

  it("上限を1文字超えると弾く", () => {
    const name = "あ".repeat(PLAYER_NAME_MAX_LENGTH + 1);
    expect(validatePlayerName(name)).toEqual({ ok: false, error: "tooLong" });
  });

  it("空文字を弾く", () => {
    expect(validatePlayerName("")).toEqual({ ok: false, error: "empty" });
  });

  it("空白だけの入力を弾く", () => {
    expect(validatePlayerName("  　 ")).toEqual({ ok: false, error: "empty" });
  });

  it("前後の空白を除いた長さで判定する", () => {
    const name = "あ".repeat(PLAYER_NAME_MAX_LENGTH);
    expect(validatePlayerName(`  ${name}  `)).toEqual({ ok: true, name });
  });

  it("サロゲートペアを1文字として数える", () => {
    // 見た目12文字ぶんの絵文字。UTF-16の長さでは24になる。
    const name = "🐣".repeat(PLAYER_NAME_MAX_LENGTH);
    expect(validatePlayerName(name)).toEqual({ ok: true, name });
    expect(validatePlayerName(`${name}🐣`)).toEqual({
      ok: false,
      error: "tooLong",
    });
  });
});
