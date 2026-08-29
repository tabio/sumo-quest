import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// デザイントークンの検査。
// 設計書「15. レスポンシブ・アクセシビリティ」の「文字と背景の十分なコントラスト」を、
// 目視ではなく数値で担保する。色を変えた際にここで気づけるようにしている。

const css = readFileSync(
  path.join(import.meta.dirname, "../app/globals.css"),
  "utf8",
);

function token(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`トークン --${name} が見つからない`);
  return match[1].trim();
}

function channelLuminance(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((offset) =>
    parseInt(value.slice(offset, offset + 2), 16),
  );
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.1 の AA。通常の文字は4.5:1、大きい文字とUI部品の境界は3:1。
const TEXT_MINIMUM = 4.5;
const LARGE_TEXT_MINIMUM = 3;

describe("デザイントークン", () => {
  it.each([
    ["本文", "color-text", "color-bg"],
    ["ウィンドウ内の本文", "color-text", "color-surface"],
    ["選択中の項目", "color-text", "color-surface-raised"],
    ["補助テキスト", "color-text-muted", "color-bg"],
    ["ウィンドウ内の補助テキスト", "color-text-muted", "color-surface"],
    ["強調ボタンの文字", "color-accent-text", "color-accent"],
    ["正解表示", "color-success", "color-surface"],
    ["不正解表示", "color-danger", "color-surface"],
  ])("%s のコントラスト比が4.5:1以上", (_label, foreground, background) => {
    expect(contrastRatio(token(foreground), token(background))).toBeGreaterThan(
      TEXT_MINIMUM,
    );
  });

  it("未解放を示す色が背景と区別できる", () => {
    expect(
      contrastRatio(token("color-disabled"), token("color-bg")),
    ).toBeGreaterThan(LARGE_TEXT_MINIMUM);
  });

  it("タップ領域の最小サイズが44px以上", () => {
    expect(parseInt(token("tap-min-size"), 10)).toBeGreaterThanOrEqual(44);
  });

  it("角丸を持たない", () => {
    expect(token("border-radius")).toBe("0");
  });
});
