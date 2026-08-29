"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import type { StageId } from "@/types/game";

// ルートガード。設計書「16. エラー・例外設計」。
//
// - 不明なstageId：マップへ戻す
// - 未解放ステージへの直リンク：マップへ戻す
// - セーブなしでゲーム画面へ直リンク：タイトルへ戻す
//
// 読み込みが済むまでは判定しない。
// loading の時点で戻すと、セーブがある利用者まで弾いてしまう。

export type GuardTarget =
  { kind: "allowed" } | { kind: "redirect"; to: string; reason: GuardReason };

export type GuardReason = "noSave" | "unknownStage" | "locked";

type GuardOptions = {
  /** ステージを伴う画面で指定する。省略時はセーブの有無だけを見る。 */
  stageId?: string;
  /** ステージが存在するか。呼び出し側がコンテンツを引いて渡す。 */
  stageExists?: boolean;
};

/** 遷移先を決める。副作用を持たないため単体テストできる。 */
export function resolveGuard(
  params: {
    isReady: boolean;
    hasSave: boolean;
    isUnlocked: (stageId: StageId) => boolean;
  },
  options: GuardOptions,
): GuardTarget {
  if (!params.isReady) return { kind: "allowed" };

  if (!params.hasSave) {
    return { kind: "redirect", to: "/", reason: "noSave" };
  }

  if (options.stageId === undefined) return { kind: "allowed" };

  if (options.stageExists === false) {
    return { kind: "redirect", to: "/map", reason: "unknownStage" };
  }

  if (!params.isUnlocked(options.stageId as StageId)) {
    return { kind: "redirect", to: "/map", reason: "locked" };
  }

  return { kind: "allowed" };
}

/**
 * 条件を満たさない場合に画面を移す。
 * 戻り値が redirect のあいだ、呼び出し側は案内を表示しておく。
 */
export function useRouteGuard(options: GuardOptions = {}): GuardTarget {
  const router = useRouter();
  const { isReady, hasSave, isUnlocked } = useGame();

  const target = resolveGuard({ isReady, hasSave, isUnlocked }, options);
  const redirectTo = target.kind === "redirect" ? target.to : null;

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [router, redirectTo]);

  return target;
}
