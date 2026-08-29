import { afterEach, describe, expect, it, vi } from "vitest";
import { assetPath, imagePath } from "./imagePath";

// R-1（サブパス配信でリンク・画像が壊れる）を早期に潰すためのテスト。
// ローカル（basePath なし）と GitHub Pages（basePath あり）の双方を検証する。

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("imagePath", () => {
  it("basePath がない場合はルート起点で解決する", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    expect(imagePath("characters/oyakata.png")).toBe(
      "/images/characters/oyakata.png",
    );
  });

  it("basePath がある場合は前に付ける", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/sumo-quest");
    expect(imagePath("characters/oyakata.png")).toBe(
      "/sumo-quest/images/characters/oyakata.png",
    );
  });

  it("先頭スラッシュの有無で結果が変わらない", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/sumo-quest");
    expect(imagePath("/characters/oyakata.png")).toBe(
      imagePath("characters/oyakata.png"),
    );
  });

  it("basePath の末尾スラッシュでパスが二重にならない", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/sumo-quest/");
    expect(imagePath("characters/oyakata.png")).toBe(
      "/sumo-quest/images/characters/oyakata.png",
    );
  });

  it("環境変数が未定義でも解決できる", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", undefined);
    expect(imagePath("characters/oyakata.png")).toBe(
      "/images/characters/oyakata.png",
    );
  });
});

describe("assetPath", () => {
  it("images 以外のファイルも解決する", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/sumo-quest");
    expect(assetPath("icons/favicon.png")).toBe(
      "/sumo-quest/icons/favicon.png",
    );
  });
});
