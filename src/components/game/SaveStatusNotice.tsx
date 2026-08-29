"use client";

import { useGame } from "@/hooks/useGame";
import styles from "./SaveStatusNotice.module.css";

// 保存できていないことを、どの画面にいても伝える（P4-7）。
//
// 保存に失敗してもプレイは止めない（R-6）。
// ただし黙って続けると、閉じた時点で進行が失われたことに気づけない。
//
// GameShell に置き、全画面で同じ位置に同じ文言を出す。
// リザルトやマップなど、画面ごとに書き分けると出し忘れが生まれる。
//
// 保存先そのものが使えない場合も、書き込みが失敗して同じ状態になる。
// 遊び始める前の案内はタイトル画面が受け持つ。

export function SaveStatusNotice() {
  const { state } = useGame();
  if (!state.saveFailed) return null;

  return (
    <p className={styles.notice} role="alert">
      進行を保存できませんでした。閉じると記録が失われます。
    </p>
  );
}
