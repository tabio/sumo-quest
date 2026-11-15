import type { KimariteCategory } from "@/types/game";

// 決まり手の分類のマスターデータ。
// 分類名は日本相撲協会「決まり手八十二手」の区分に従う（ADR-0011）。
export const kimariteCategories: KimariteCategory[] = [
  {
    id: "kihon",
    name: "基本技",
    reading: "きほんわざ",
    order: 1,
    isTechnique: true,
  },
  {
    id: "nagete",
    name: "投げ手",
    reading: "なげて",
    order: 2,
    isTechnique: true,
  },
  {
    id: "kakete",
    name: "掛け手",
    reading: "かけて",
    order: 3,
    isTechnique: true,
  },
  {
    id: "sorite",
    name: "反り手",
    reading: "そりて",
    order: 4,
    isTechnique: true,
  },
  {
    id: "hinerite",
    name: "捻り手",
    reading: "ひねりて",
    order: 5,
    isTechnique: true,
  },
  {
    id: "tokushu",
    name: "特殊技",
    reading: "とくしゅわざ",
    order: 6,
    isTechnique: true,
  },
  { id: "higi", name: "非技", reading: "ひぎ", order: 7, isTechnique: false },
];
