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

const buttonCss = readFileSync(
  path.join(import.meta.dirname, "../components/ui/PixelButton.module.css"),
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
    ["未解放・未習得の説明", "color-text-muted", "color-surface"],
    ["エンディングの見出し", "color-accent", "color-surface"],
    ["沈んだ面の本文", "color-text", "color-surface-sunken"],
    ["沈んだ面の補助テキスト", "color-text-muted", "color-surface-sunken"],
    ["数値の強調", "color-accent-light", "color-surface"],
    ["数値の強調（沈んだ面）", "color-accent-light", "color-surface-sunken"],
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

  it("ボタンとリンクがタップ領域の最小サイズを守る", () => {
    // P4-2。値だけ決めても使われていなければ意味がないため、適用側も見る。
    expect(buttonCss).toContain("min-height: var(--tap-min-size)");
    expect(buttonCss).toContain("min-width: var(--tap-min-size)");
  });

  it("フォーカスリングが見える", () => {
    // P4-2。キーボードで操作したとき、今どこにいるかが分かる必要がある。
    const focus = css.match(/:focus-visible\s*\{([^}]+)\}/);
    expect(focus).not.toBeNull();
    expect(focus![1]).toContain("outline:");
    expect(focus![1]).not.toContain("outline: none");
  });

  it("アニメーション軽減設定を尊重する", () => {
    // P4-5。動きに弱い利用者のために、動きを止められるようにする。
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    const reduced = css.slice(css.indexOf("prefers-reduced-motion"));
    expect(reduced).toContain("animation-duration: 0.01ms !important");
    expect(reduced).toContain("transition-duration: 0.01ms !important");
  });

  it("角丸がピクセルグリッドを外れない", () => {
    // ADR-0007。16bit風にするため角を2pxだけ落とすが、そこまでとする。
    // 4pxを超えると、レトロRPGではなく現代のWeb UIの見た目になる。
    const radius = parseInt(token("border-radius"), 10);
    expect(radius).toBeGreaterThanOrEqual(0);
    expect(radius).toBeLessThanOrEqual(4);
    expect(radius % 2).toBe(0);
  });

  it("枠線がピクセルグリッドに乗る", () => {
    // ADR-0007。細くしすぎると枠が消え、太くすると8bit風に戻る。
    const width = parseInt(token("border-width"), 10);
    expect(width).toBeGreaterThanOrEqual(2);
    expect(width).toBeLessThanOrEqual(4);
    expect(width % 2).toBe(0);
  });

  it("基調3色がすべて定義されている", () => {
    // ADR-0007。黒（面）・オレンジ（主強調）・緑（副強調）を基調とする。
    for (const name of [
      "color-bg",
      "color-surface",
      "color-accent",
      "color-verdant",
    ]) {
      expect(token(name)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
