import { describe, expect, it } from "vitest";
import { PLAYER_NAME_MAX_LENGTH } from "@/lib/playerName";
import { createSave } from "@/test/fixtures";
import { isPlayerSave, parseSave, toSaveEnvelope } from "./validation";

// 設計書「11. localStorage設計」の読み込み手順と、
// 「16. エラー・例外設計」の「セーブ破損：破棄せず」を検証する。

describe("parseSave", () => {
  it("正しいセーブデータを読み込める", () => {
    const save = createSave({ playerName: "たろう", experience: 120 });
    const result = parseSave(JSON.stringify(toSaveEnvelope(save)));

    expect(result).toEqual({ ok: true, data: save });
  });

  it("JSONとして壊れている場合を検知する", () => {
    expect(parseSave("{壊れている")).toEqual({
      ok: false,
      reason: "invalidJson",
    });
  });

  it("JSONだがオブジェクトでない場合を検知する", () => {
    expect(parseSave('"文字列"')).toEqual({
      ok: false,
      reason: "invalidShape",
    });
  });

  it("解釈できないバージョンを検知する", () => {
    const raw = JSON.stringify({ version: 99, data: createSave() });
    expect(parseSave(raw)).toEqual({
      ok: false,
      reason: "unsupportedVersion",
    });
  });

  it("必須項目が欠けている場合を検知する", () => {
    const save: Record<string, unknown> = { ...createSave() };
    delete save.playerName;
    const raw = JSON.stringify({ version: 1, data: save });

    expect(parseSave(raw)).toEqual({ ok: false, reason: "invalidShape" });
  });

  it("入力の文字列を書き換えない", () => {
    const raw = "{壊れている";
    parseSave(raw);
    expect(raw).toBe("{壊れている");
  });
});

describe("isPlayerSave", () => {
  it("ステージの進行状況が欠けていると不正とみなす", () => {
    const save = createSave();
    const broken = {
      ...save,
      stageProgress: { "sumo-stable": save.stageProgress["sumo-stable"] },
    };

    expect(isPlayerSave(broken)).toBe(false);
  });

  it("知らないステージ状態を不正とみなす", () => {
    const save = createSave();
    const broken = {
      ...save,
      stageProgress: {
        ...save.stageProgress,
        "sumo-stable": { status: "unknown", bestScore: 0, attempts: 0 },
      },
    };

    expect(isPlayerSave(broken)).toBe(false);
  });

  it("上限ちょうどの名前を受け入れる", () => {
    const name = "あ".repeat(PLAYER_NAME_MAX_LENGTH);
    expect(isPlayerSave(createSave({ playerName: name }))).toBe(true);
  });

  it("上限を超える名前を不正とみなす", () => {
    // 入力欄を通らずに localStorage を直接書き換えた場合を想定する。
    const name = "あ".repeat(PLAYER_NAME_MAX_LENGTH + 1);
    expect(isPlayerSave(createSave({ playerName: name }))).toBe(false);
  });

  it("名前の長さはサロゲートペアを1文字として数える", () => {
    // 入力欄が通す絵文字入りの名前を、読み込み側が弾かないこと。
    const name = "🐣".repeat(PLAYER_NAME_MAX_LENGTH);
    expect(isPlayerSave(createSave({ playerName: name }))).toBe(true);
  });

  it("EXPが数値でない場合を不正とみなす", () => {
    expect(isPlayerSave({ ...createSave(), experience: "100" })).toBe(false);
  });

  it("EXPが NaN の場合を不正とみなす", () => {
    expect(isPlayerSave({ ...createSave(), experience: Number.NaN })).toBe(
      false,
    );
  });

  it("知らない番付を不正とみなす", () => {
    expect(isPlayerSave({ ...createSave(), rankId: "rikishi" })).toBe(false);
  });

  it("報酬済みIDが配列でない場合を不正とみなす", () => {
    expect(isPlayerSave({ ...createSave(), rewardedQuizIds: {} })).toBe(false);
  });

  it("クイズ履歴の中身も検証する", () => {
    const broken = {
      ...createSave(),
      quizHistory: [{ stageId: "unknown", score: 1, total: 2, answeredAt: "" }],
    };

    expect(isPlayerSave(broken)).toBe(false);
  });
});
