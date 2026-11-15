// 日本相撲協会のサイトから決まり手の事実データを取得し、
// src/data/kimarite.ts を生成する（ADR-0011）。
//
// 使い方：
//   npm run scrape:kimarite
//     協会サイトから取得する。
//   npm run scrape:kimarite -- --from <ディレクトリ>
//     保存済みの CommonKimariteNew.js と kimarite.js を読む。ネットワークに出られない環境向け。
//
// 解析と検査の規則は src/lib/kimariteSource.ts を正とする。
// このスクリプトは取得とファイルの書き出しだけを受け持つ。
//
// プロキシ経由で取得する場合は NODE_USE_ENV_PROXY=1 を付けて実行する。

import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { KIMARITE_CATEGORY_IDS } from "../src/types/game.ts";
import {
  KIMARITE_CODE_URL,
  KIMARITE_SOURCE_PAGE_URL,
  KIMARITE_TABLE_URL,
  buildKimarite,
} from "../src/lib/kimariteSource.ts";

const root = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(root, "src/data/kimarite.ts");

async function fetchText(url) {
  const response = await fetch(url);
  // 協会サイトは受け付けない要求を別ページへ転送する。転送先の中身を表として読まないよう止める。
  if (!response.ok || response.redirected) {
    throw new Error(`${url} を取得できませんでした（${response.status}）。`);
  }
  return response.text();
}

async function loadSources() {
  const fromIndex = process.argv.indexOf("--from");
  if (fromIndex !== -1) {
    const dir = process.argv[fromIndex + 1];
    if (!dir) throw new Error("--from にはディレクトリを指定してください。");
    return Promise.all([
      readFile(path.join(dir, path.basename(KIMARITE_TABLE_URL)), "utf8"),
      readFile(path.join(dir, path.basename(KIMARITE_CODE_URL)), "utf8"),
    ]);
  }
  return Promise.all([
    fetchText(KIMARITE_TABLE_URL),
    fetchText(KIMARITE_CODE_URL),
  ]);
}

const [tableSource, codeSource] = await loadSources();
const kimarite = buildKimarite(tableSource, codeSource, KIMARITE_CATEGORY_IDS);
const retrievedAt = new Date().toISOString().slice(0, 10);

const output = `import type { Kimarite } from "@/types/game";

// 決まり手のマスターデータ。
// このファイルは scripts/scrape-kimarite.mjs が生成する。手で編集しない。
// 読みの誤りを正す場合も、src/lib/kimariteSource.ts の READING_CORRECTIONS に足して再生成する。
//
// 収録するのは名称・読み・分類・協会の技コードといった事実のみで、解説文は持たない（ADR-0011）。

/** 出典。図鑑では参考として協会のページへリンクする。 */
export const kimariteSource = ${JSON.stringify({
  name: "日本相撲協会「決まり手八十二手」",
  url: KIMARITE_SOURCE_PAGE_URL,
  retrievedAt,
})};

export const kimarite: Kimarite[] = ${JSON.stringify(kimarite)};
`;

await writeFile(outputPath, output);
// 生成物もリポジトリの整形規則に従わせ、差分を読みやすく保つ。
execFileSync(
  path.join(root, "node_modules/.bin/prettier"),
  ["--write", outputPath],
  { stdio: "ignore" },
);

const techniqueCount = kimarite.filter(
  (item) => item.categoryId !== "higi",
).length;
console.log(
  `決まり手 ${techniqueCount} 件と非技 ${kimarite.length - techniqueCount} 件を ${path.relative(root, outputPath)} に書き出しました。`,
);
