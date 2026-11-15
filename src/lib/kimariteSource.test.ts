import { describe, expect, it } from "vitest";
import { KIMARITE_CATEGORY_IDS } from "@/types/game";
import {
  buildKimarite,
  parseKimariteCodes,
  parseKimariteTable,
  readingMatchesName,
  toRomaji,
} from "./kimariteSource";

// 取得元の書式を模した最小の断片。実物と同じく1行に連結した形で持つ。
function row(
  index: number,
  name: string,
  reading: string,
  kind: number,
): string {
  return `KimariteTBL[${index}]={NAME:"${name}",YOMI:"${reading}",RNAME:"<ruby>${name}<rt>${reading}</rt></ruby>",KIND:${kind},IMG1:"a.gif",IMG2:"b.gif"}`;
}

const table = [
  "var KimariteTBL=new Array;",
  [
    row(0, "寄り切り", "よりきり", 0),
    row(1, "小手投げ", "げ", 1),
    row(2, "勇み足", "いさみあし", 6),
    row(3, "喉をつかむ", "のどをつかむ", 7),
  ].join(","),
  ";$(function(){});",
].join("");

const codes = "var kimariteConv={70:0,34:1,5:2,74:99,87:3};";

describe("parseKimariteTable", () => {
  it("表の各行から名称・読み・分類番号を読む", () => {
    expect(parseKimariteTable(table)[0]).toEqual({
      index: 0,
      name: "寄り切り",
      reading: "よりきり",
      kind: 0,
    });
  });

  it("書式に合わない行があれば黙って落とさず止める", () => {
    const broken = table.replace('KIND:0,IMG1:"a.gif"', "KIND:0");
    expect(() => parseKimariteTable(broken)).toThrow(/宣言 4 件／読めた 3 件/);
  });
});

describe("parseKimariteCodes", () => {
  it("欠番（99）を除いて、表の位置から技コードを引ける", () => {
    const map = parseKimariteCodes(codes);
    expect(map.get(0)).toBe(70);
    expect([...map.values()]).not.toContain(74);
  });

  it("同じ位置に2つのコードがあれば止める", () => {
    expect(() => parseKimariteCodes("kimariteConv={1:0,2:0}")).toThrow();
  });
});

describe("toRomaji", () => {
  it.each([
    ["よりきり", "yorikiri"],
    ["うわてなげ", "uwatenage"],
    ["ちょんがけ", "chongake"],
    ["いっぽんぜおい", "ipponzeoi"],
    ["うっちゃり", "utchari"],
    ["しゅもくぞり", "shumokuzori"],
    ["そとむそう", "sotomuso"],
    ["おおまた", "omata"],
    ["がっしょうひねり", "gasshohineri"],
  ])("%s → %s", (reading, expected) => {
    expect(toRomaji(reading)).toBe(expected);
  });

  it("ひらがな以外を含む読みは止める", () => {
    expect(() => toRomaji("ヨリキリ")).toThrow();
  });
});

describe("readingMatchesName", () => {
  it.each([
    ["寄り切り", "よりきり"],
    ["ちょん掛け", "ちょんがけ"],
    ["つき手", "つきて"],
    ["とったり", "とったり"],
    ["大股", "おおまた"],
  ])("「%s」と「%s」は合う", (name, reading) => {
    expect(readingMatchesName(name, reading)).toBe(true);
  });

  // 取得元に実際にあった誤り。
  it.each([
    ["小手投げ", "げ"],
    ["ちょん掛け", "ちょんがげ"],
  ])("「%s」と「%s」は合わない", (name, reading) => {
    expect(readingMatchesName(name, reading)).toBe(false);
  });
});

describe("buildKimarite", () => {
  const result = buildKimarite(table, codes, KIMARITE_CATEGORY_IDS);

  it("禁じ手など分類の範囲外の行は取り込まない", () => {
    expect(result.map((item) => item.name)).toEqual([
      "寄り切り",
      "小手投げ",
      "勇み足",
    ]);
  });

  it("分類・表示順・技コード・IDを組み立てる", () => {
    expect(result[2]).toEqual({
      id: "isamiashi",
      name: "勇み足",
      reading: "いさみあし",
      categoryId: "higi",
      order: 3,
      kyokaiCode: 5,
    });
  });

  it("取得元の読みの誤りを正す", () => {
    expect(result[1]).toMatchObject({ id: "kotenage", reading: "こてなげ" });
  });

  it("正す表にない誤りは止める", () => {
    const wrong = table.replace('"よりきり"', '"よりきる"');
    expect(() => buildKimarite(wrong, codes, KIMARITE_CATEGORY_IDS)).toThrow(
      /寄り切り/,
    );
  });

  it("技コードのない技があれば止める", () => {
    expect(() =>
      buildKimarite(table, "kimariteConv={70:0}", KIMARITE_CATEGORY_IDS),
    ).toThrow(/技コード/);
  });
});
