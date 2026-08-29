import type { GuardReason } from "@/hooks/useRouteGuard";

// ルートガードで戻す際の案内文。
// 遷移が完了するまでの短い間だけ表示されるが、
// 遷移が遅れた場合に何も出ないと、利用者は行き先を失う。

export const GUARD_HEADINGS: Record<GuardReason, string> = {
  noSave: "記録がありません",
  unknownStage: "その場所はありません",
  locked: "まだ行けません",
  notFinished: "まだ その先はありません",
};

export const GUARD_MESSAGES: Record<GuardReason, string> = {
  noSave: "タイトルへもどります。",
  unknownStage: "マップへもどります。",
  locked: "ひとつ前のステージをクリアすると進めます。",
  notFinished: "最終試験に勝つと見られます。",
};
