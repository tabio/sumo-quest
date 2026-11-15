import { describe, expect, it } from "vitest";
import { KIMARITE_CATEGORY_IDS } from "@/types/game";
import { readingMatchesName, toRomaji } from "@/lib/kimariteSource";
import { kimarite, kimariteSource } from "./kimarite";
import { kimariteCategories } from "./kimariteCategories";
import { techniques } from "./techniques";

// 生成された決まり手データの検査（ADR-0011）。
// 生成時にも同じ規則で止まるが、手で書き換えられた場合に備えてここでも確かめる。

const categoryById = new Map(kimariteCategories.map((c) => [c.id, c]));

describe("決まり手の分類", () => {
  it("分類IDの定数と同じ並びで、表示順もその通りである", () => {
    const sorted = [...kimariteCategories].sort((a, b) => a.order - b.order);
    expect(sorted.map((c) => c.id)).toEqual([...KIMARITE_CATEGORY_IDS]);
  });

  it("非技だけが決まり手に数えない分類である", () => {
    expect(
      kimariteCategories.filter((c) => !c.isTechnique).map((c) => c.id),
    ).toEqual(["higi"]);
  });
});

describe("決まり手", () => {
  it("決まり手は八十二手、非技は5つである", () => {
    const techniqueCount = kimarite.filter(
      (item) => categoryById.get(item.categoryId)?.isTechnique,
    ).length;
    expect(techniqueCount).toBe(82);
    expect(kimarite.length - techniqueCount).toBe(5);
  });

  it("ID・技コード・表示順が重複しない", () => {
    for (const key of ["id", "kyokaiCode", "order"] as const) {
      const values = kimarite.map((item) => item[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it("表示順が分類の順に並ぶ", () => {
    const sorted = [...kimarite].sort((a, b) => a.order - b.order);
    const categoryOrders = sorted.map(
      (item) => categoryById.get(item.categoryId)?.order ?? 0,
    );
    expect(categoryOrders).toEqual([...categoryOrders].sort((a, b) => a - b));
  });

  it.each(kimarite)("$name の読みが名称と合い、IDが読みから導ける", (item) => {
    expect(readingMatchesName(item.name, item.reading)).toBe(true);
    expect(item.id).toBe(toRomaji(item.reading));
  });

  it("出典として協会のページを指す", () => {
    expect(kimariteSource.url).toMatch(/^https:\/\/www\.sumo\.or\.jp\//);
  });
});

describe("学習で扱う決まり手との対応", () => {
  // 学習の6手（techniques.ts）は図鑑のデータと同じIDで引けることを保証する。
  // 名称や読みの食い違いは、どちらかの誤りである。
  it.each(techniques)("$name が同じID・名称・読みで収録されている", (t) => {
    expect(kimarite.find((item) => item.id === t.id)).toMatchObject({
      name: t.name,
      reading: t.reading,
    });
  });
});
