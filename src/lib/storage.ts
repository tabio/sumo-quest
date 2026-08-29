import {
  parseSave,
  toSaveEnvelope,
  type SaveErrorReason,
} from "@/lib/validation";
import type { PlayerSave } from "@/types/game";

// localStorage の読み書き。
// 設計書「11. localStorage設計」に対応する。
//
// このモジュールは localStorage に触れる唯一の場所とする。
// 保存先が使えない環境（R-6）でも例外を投げず、結果を戻り値で返す。
// 呼び出し側はプレイを継続させ、未保存であることを画面に出す。

/** 保存キー。 */
export const SAVE_KEY = "sumo-quest:save";

export type LoadResult =
  /** 保存がまだない。新規開始の導線だけを出す。 */
  | { status: "empty" }
  /** 正常に読めた。 */
  | { status: "loaded"; data: PlayerSave }
  /** 保存はあるが読めない。消さずに復旧案内を出す。 */
  | { status: "corrupted"; reason: SaveErrorReason }
  /** localStorage 自体が使えない。 */
  | { status: "unavailable" };

export type SaveResult =
  { ok: true } | { ok: false; reason: "unavailable" | "writeFailed" };

/**
 * localStorage を取得する。
 * SSR時（window未定義）とプライベートモード等での参照失敗の双方で null を返す。
 */
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // storage へのアクセス自体が例外になる設定がある。
    return null;
  }
}

/** セーブデータを読み込む。キー不在・破損・localStorage不可を区別して返す。 */
export function loadSave(): LoadResult {
  const storage = getStorage();
  if (!storage) return { status: "unavailable" };

  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return { status: "unavailable" };
  }

  if (raw === null) return { status: "empty" };

  const result = parseSave(raw);
  if (!result.ok) {
    // 破損していても消さない（設計書「16. エラー・例外設計」）。
    return { status: "corrupted", reason: result.reason };
  }

  return { status: "loaded", data: result.data };
}

/** セーブデータを書き込む。失敗しても例外は投げない。 */
export function writeSave(data: PlayerSave): SaveResult {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: "unavailable" };

  try {
    storage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(data)));
    return { ok: true };
  } catch {
    // 容量超過や書き込み禁止。プレイは継続させる（R-6）。
    return { ok: false, reason: "writeFailed" };
  }
}

/**
 * セーブデータを削除する。
 * 破損時の自動削除には使わない。利用者が明示的に初期化を選んだ場合に限る。
 */
export function clearSave(): SaveResult {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: "unavailable" };

  try {
    storage.removeItem(SAVE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, reason: "writeFailed" };
  }
}
