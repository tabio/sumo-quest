"use client";

import { useState } from "react";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelLink } from "@/components/ui/PixelLink";
import styles from "./StageExit.module.css";

// ステージの途中で抜けるための導線。
//
// 学習と取組は最後まで進めないと次の画面へ移らないため、
// これを出さないとブラウザの戻る以外に抜ける道がなくなる。
//
// 押し間違いで進行中の稽古や取組を捨てないよう、行き先を選ぶ前に一度確認する。
// 確認では「タイトルへ」と「マップへ」の両方を出す。
// 遊ぶのをやめるならタイトル、別の場所へ行くならマップと、目的が分かれるため。

type StageExitProps = {
  /** ここでやめた場合に失われるものの説明。画面ごとに文言が変わる。 */
  warning: string;
};

export function StageExit({ warning }: StageExitProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={styles.exit}>
      {/* 開閉しても押した要素が消えないようにする。フォーカスが迷子になるため。 */}
      <div className={styles.bar}>
        <PixelButton
          onClick={() => setConfirming((current) => !current)}
          aria-expanded={confirming}
        >
          やめる
        </PixelButton>
      </div>

      {confirming ? (
        <PixelWindow heading="ここでやめますか">
          <p>{warning}</p>
          <p className={styles.notice}>
            これまでの記録（番付、EXP、おぼえたわざとことば）は消えません。
          </p>
          <div className={styles.actions}>
            <PixelLink href="/" variant="primary">
              タイトルへもどる
            </PixelLink>
            <PixelLink href="/map">マップへもどる</PixelLink>
            <PixelButton onClick={() => setConfirming(false)}>
              つづける
            </PixelButton>
          </div>
        </PixelWindow>
      ) : null}
    </div>
  );
}
