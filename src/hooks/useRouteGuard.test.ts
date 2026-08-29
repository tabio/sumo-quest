import { describe, expect, it } from "vitest";
import { resolveGuard } from "./useRouteGuard";

// 設計書「16. エラー・例外設計」の3経路を検証する。
// 遷移先の決定は副作用を持たない関数に切り出してあるため、ここで直接確かめられる。

const unlockedOnlyStage1 = (stageId: string) => stageId === "sumo-stable";

describe("resolveGuard", () => {
  it("読み込み中は判定しない", () => {
    // ここで戻すと、セーブがある利用者まで弾いてしまう。
    expect(
      resolveGuard(
        { isReady: false, hasSave: false, isUnlocked: unlockedOnlyStage1 },
        {},
      ),
    ).toEqual({ kind: "allowed" });
  });

  it("セーブなしでゲーム画面へ来たらタイトルへ戻す", () => {
    expect(
      resolveGuard(
        { isReady: true, hasSave: false, isUnlocked: unlockedOnlyStage1 },
        {},
      ),
    ).toEqual({ kind: "redirect", to: "/", reason: "noSave" });
  });

  it("不明なステージIDならマップへ戻す", () => {
    expect(
      resolveGuard(
        { isReady: true, hasSave: true, isUnlocked: unlockedOnlyStage1 },
        { stageId: "unknown", stageExists: false },
      ),
    ).toEqual({ kind: "redirect", to: "/map", reason: "unknownStage" });
  });

  it("未解放ステージへの直リンクはマップへ戻す", () => {
    expect(
      resolveGuard(
        { isReady: true, hasSave: true, isUnlocked: unlockedOnlyStage1 },
        { stageId: "dohyo", stageExists: true },
      ),
    ).toEqual({ kind: "redirect", to: "/map", reason: "locked" });
  });

  it("解放済みのステージは通す", () => {
    expect(
      resolveGuard(
        { isReady: true, hasSave: true, isUnlocked: unlockedOnlyStage1 },
        { stageId: "sumo-stable", stageExists: true },
      ),
    ).toEqual({ kind: "allowed" });
  });

  it("ステージを伴わない画面はセーブの有無だけで判定する", () => {
    expect(
      resolveGuard(
        { isReady: true, hasSave: true, isUnlocked: unlockedOnlyStage1 },
        {},
      ),
    ).toEqual({ kind: "allowed" });
  });

  it("セーブなしの判定を、ステージの判定より先に行う", () => {
    // セーブがない時点でタイトルへ戻す。未解放かどうかは問わない。
    expect(
      resolveGuard(
        { isReady: true, hasSave: false, isUnlocked: () => false },
        { stageId: "dohyo", stageExists: true },
      ),
    ).toEqual({ kind: "redirect", to: "/", reason: "noSave" });
  });
});
