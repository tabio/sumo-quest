import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";
import { npcs } from "./npcs";
import { quizzes } from "./quizzes";
import { ranks } from "./ranks";
import { stages } from "./stages";
import { techniques } from "./techniques";
import { terms } from "./terms";

// 設計書「9. コンテンツデータ」が求める7ファイルの疎通確認。
// 中身が空のうちは緩い検査だが、データ投入後もそのまま効き続ける。
// 内容の妥当性（正解が一つだけあること、参照先IDの存在）は
// src/lib/contentIntegrity.ts が見る（P2-12）。
const dataSets = [
  { name: "stages", items: stages },
  { name: "lessons", items: lessons },
  { name: "quizzes", items: quizzes },
  { name: "techniques", items: techniques },
  { name: "terms", items: terms },
  { name: "npcs", items: npcs },
  { name: "ranks", items: ranks },
] satisfies { name: string; items: { id: string }[] }[];

describe("コンテンツデータ", () => {
  it("7ファイルすべてが配列を公開する", () => {
    expect(dataSets).toHaveLength(7);
    for (const { name, items } of dataSets) {
      expect(Array.isArray(items), `${name} は配列であること`).toBe(true);
    }
  });

  it.each(dataSets)("$name のIDが重複しない", ({ items }) => {
    const ids = items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
