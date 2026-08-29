import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSave } from "@/test/fixtures";
import { toSaveEnvelope } from "./validation";
import { SAVE_KEY, clearSave, loadSave, writeSave } from "./storage";

// 設計書「11. localStorage設計」の読み書きと、
// R-6（localStorageが使えない環境）での挙動を検証する。

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadSave", () => {
  it("キーがない場合は empty を返す", () => {
    expect(loadSave()).toEqual({ status: "empty" });
  });

  it("保存済みのデータを読み込める", () => {
    const save = createSave({ playerName: "たろう", experience: 40 });
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));

    expect(loadSave()).toEqual({ status: "loaded", data: save });
  });

  it("壊れたデータは corrupted を返し、削除しない", () => {
    window.localStorage.setItem(SAVE_KEY, "{壊れている");

    expect(loadSave()).toEqual({
      status: "corrupted",
      reason: "invalidJson",
    });
    // 復旧の余地を残すため、読み込み失敗では消さない。
    expect(window.localStorage.getItem(SAVE_KEY)).toBe("{壊れている");
  });

  it("読み込みが例外になる環境では unavailable を返す", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("アクセスが拒否された");
    });

    expect(loadSave()).toEqual({ status: "unavailable" });
  });
});

describe("writeSave", () => {
  it("書き込んだ内容をそのまま読み戻せる", () => {
    const save = createSave({ playerName: "はなこ", experience: 90 });

    expect(writeSave(save)).toEqual({ ok: true });
    expect(loadSave()).toEqual({ status: "loaded", data: save });
  });

  it("SaveEnvelope の形で保存する", () => {
    const save = createSave();
    writeSave(save);

    const raw = window.localStorage.getItem(SAVE_KEY);
    expect(JSON.parse(raw ?? "")).toEqual({ version: 1, data: save });
  });

  it("容量超過などで書けなくても例外を投げない", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(writeSave(createSave())).toEqual({
      ok: false,
      reason: "writeFailed",
    });
  });
});

describe("clearSave", () => {
  it("保存を削除する", () => {
    writeSave(createSave());
    expect(clearSave()).toEqual({ ok: true });
    expect(loadSave()).toEqual({ status: "empty" });
  });
});
