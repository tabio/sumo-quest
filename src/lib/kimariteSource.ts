import type { Kimarite, KimariteCategoryId } from "@/types/game";

// 日本相撲協会のサイトから決まり手の事実データを取り出す（ADR-0011）。
//
// 協会サイトの決まり手ページは、技の一覧を次の2つの公開スクリプトに持っている。
//
// - /js/sekitorikun/CommonKimariteNew.js … 名称・読み・分類番号の表（KimariteTBL）
// - /js/kimarite.js … 協会の技コードから表の位置への対応（kimariteConv）
//
// スクリプトは実行せず、決まった書式を正規表現で読む。
// 取得したものはこちらが管理しない外部のコードであり、評価すると任意の処理を走らせてしまうため。
// 書式が変わって読めなくなった場合は、黙って欠けたデータを出さずに例外で止める。
//
// 解説文は取り込まない。協会の著作物であり、本作は公開サイトとして配信するため。
//
// scripts/scrape-kimarite.mjs が Node から直接読むため、
// パスエイリアス（@/）を伴う実行時の import をこのファイルに持たせない。

/** 取得元。生成データの出典表示にも使う。 */
export const KIMARITE_SOURCE_PAGE_URL = "https://www.sumo.or.jp/Kimarite/show/";
export const KIMARITE_TABLE_URL =
  "https://www.sumo.or.jp/js/sekitorikun/CommonKimariteNew.js";
export const KIMARITE_CODE_URL = "https://www.sumo.or.jp/js/kimarite.js";

/**
 * 取得元の読みの誤りを正す表。キーは技の名称。
 * 協会のページ上ではルビ（RNAME）が正しく表示されており、読み（YOMI）の欄だけが誤っている。
 * 正しても名称と読みが合わない場合は例外で止まるため、表の誤りも検知できる。
 */
export const READING_CORRECTIONS: Readonly<Record<string, string>> = {
  小手投げ: "こてなげ", // 取得元は「げ」
  ちょん掛け: "ちょんがけ", // 取得元は「ちょんがげ」
};

export type RawKimariteRow = {
  /** 表（KimariteTBL）での位置。 */
  index: number;
  name: string;
  reading: string;
  kind: number;
};

const TABLE_ROW_PATTERN =
  /KimariteTBL\[(\d+)\]=\{NAME:"([^"]*)",YOMI:"([^"]*)",RNAME:"(?:[^"\\]|\\.)*",KIND:(\d+),IMG1:"[^"]*",IMG2:"[^"]*"\}/g;

/** 名称・読み・分類番号の表を読む。 */
export function parseKimariteTable(source: string): RawKimariteRow[] {
  const rows = [...source.matchAll(TABLE_ROW_PATTERN)].map((match) => ({
    index: Number(match[1]),
    name: match[2],
    reading: match[3],
    kind: Number(match[4]),
  }));

  // 書式に合わない行が紛れると、その行だけ黙って落ちる。
  // 表の宣言の個数と読めた個数を比べ、取りこぼしを検知する。
  const declared = source.match(/KimariteTBL\[\d+\]=/g)?.length ?? 0;
  if (rows.length === 0 || rows.length !== declared) {
    throw new Error(
      `決まり手の表を読めませんでした（宣言 ${declared} 件／読めた ${rows.length} 件）。取得元の書式が変わった可能性があります。`,
    );
  }
  return rows;
}

/** 協会の技コードから表の位置への対応を読む。値99は欠番を表す。 */
export function parseKimariteCodes(source: string): Map<number, number> {
  const body = source.match(/kimariteConv=\{([^}]*)\}/)?.[1];
  if (body === undefined) {
    throw new Error(
      "技コードの対応表を読めませんでした。取得元の書式が変わった可能性があります。",
    );
  }

  const codeByIndex = new Map<number, number>();
  for (const pair of body.split(",")) {
    const match = pair.trim().match(/^(\d+):(\d+)$/);
    if (match === null) {
      throw new Error(`技コードの対応表に読めない項目があります：${pair}`);
    }
    const code = Number(match[1]);
    const index = Number(match[2]);
    if (index === 99) continue;
    if (codeByIndex.has(index)) {
      throw new Error(
        `表の位置 ${index} に技コードが2つ割り当てられています。`,
      );
    }
    codeByIndex.set(index, code);
  }
  return codeByIndex;
}

// ひらがなからヘボン式への対応。拗音は2文字の組を先に引く。
// prettier-ignore
const DIGRAPHS: Record<string, string> = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho",
  じゃ: "ja", じゅ: "ju", じょ: "jo",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
};

// prettier-ignore
const MONOGRAPHS: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "o", ん: "n",
};

/**
 * ひらがなの読みをIDに使うローマ字にする。
 * 既存の Technique.id（yorikiri、uwatenage など）と同じく、記号を使わないヘボン式とする。
 * 長音は協会の英語表記（sotomuso、omata など）に合わせて1文字に縮める。
 */
export function toRomaji(reading: string): string {
  let result = "";
  let geminate = false;
  for (let i = 0; i < reading.length; i++) {
    if (reading[i] === "っ") {
      geminate = true;
      continue;
    }
    let syllable: string | undefined = DIGRAPHS[reading.slice(i, i + 2)];
    if (syllable !== undefined) {
      i++;
    } else {
      syllable = MONOGRAPHS[reading[i]];
    }
    if (syllable === undefined) {
      throw new Error(`ローマ字にできない文字があります：${reading}`);
    }
    if (geminate) {
      // 促音は次の子音を重ねる。ch の前だけは t を置く（うっちゃり → utchari）。
      result += syllable.startsWith("ch") ? "t" : syllable[0];
      geminate = false;
    }
    result += syllable;
  }
  if (geminate) {
    throw new Error(`促音で終わる読みはローマ字にできません：${reading}`);
  }
  return result.replace(/ou|oo/g, "o").replace(/uu/g, "u");
}

/**
 * 名称に含まれる送り仮名が、読みの同じ位置に現れるかを確かめる。
 * 漢字の部分は1文字以上の任意の読みとみなす。
 * 「小手投げ」に「げ」、「ちょん掛け」に「ちょんがげ」のような取り違えを検知できる。
 */
export function readingMatchesName(name: string, reading: string): boolean {
  if (!/^[ぁ-ゖー・、]+$/.test(reading)) return false;
  const pattern = [...name.matchAll(/[ぁ-ゖー・、]+|[^ぁ-ゖー・、]+/g)]
    .map(([part]) => (/^[ぁ-ゖー・、]/.test(part) ? escapeRegExp(part) : ".+"))
    .join("");
  return new RegExp(`^${pattern}$`).test(reading);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 2つのスクリプトから、決まり手の一覧を組み立てる。
 *
 * categoryIds には types/game.ts の KIMARITE_CATEGORY_IDS を渡す。
 * 協会側の分類番号（KIND）は、この並びの位置として解釈する。
 * 範囲外の番号（禁じ手と用語解説）は決まり手ではないため取り込まない。
 * 並びを引数で受け取るのは、このファイルが型定義を実行時に import できないためである。
 */
export function buildKimarite(
  tableSource: string,
  codeSource: string,
  categoryIds: readonly KimariteCategoryId[],
): Kimarite[] {
  const rows = parseKimariteTable(tableSource).filter(
    (row) => row.kind < categoryIds.length,
  );
  const codeByIndex = parseKimariteCodes(codeSource);

  const kimarite = rows.map((row, position): Kimarite => {
    const reading = READING_CORRECTIONS[row.name] ?? row.reading;
    if (!readingMatchesName(row.name, reading)) {
      throw new Error(
        `「${row.name}」の読み「${reading}」が名称と合いません。READING_CORRECTIONS に正しい読みを足してください。`,
      );
    }
    const kyokaiCode = codeByIndex.get(row.index);
    if (kyokaiCode === undefined) {
      throw new Error(`「${row.name}」に協会の技コードがありません。`);
    }
    return {
      id: toRomaji(reading),
      name: row.name,
      reading,
      categoryId: categoryIds[row.kind],
      order: position + 1,
      kyokaiCode,
    };
  });

  const ids = kimarite.map((item) => item.id);
  const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicated.length > 0) {
    throw new Error(`IDが重複しています：${duplicated.join(", ")}`);
  }
  return kimarite;
}
