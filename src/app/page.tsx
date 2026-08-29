"use client";

import { useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import styles from "./page.module.css";

// タイトル画面。設計書「6.1 タイトル」。
//
// セーブの有無で「つづきから」の活性が変わる。
// 既存データがある状態で「はじめから」を選んだ場合は上書き確認を行う。

export default function TitlePage() {
  const { state, isReady, hasSave, resetGame } = useGame();
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  if (!isReady) {
    return (
      <GameShell>
        <p className={styles.logo}>SUMO QUEST</p>
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  const isCorrupted = state.status.kind === "corrupted";
  const isUnavailable = state.status.kind === "unavailable";

  return (
    <GameShell>
      <h1 className={styles.logo}>SUMO QUEST</h1>
      <p className={styles.subtitle}>見習い力士から横綱を目指す旅</p>

      {isCorrupted ? (
        <PixelWindow heading="セーブデータを読み込めません">
          <p className={styles.warning}>
            保存されている記録が壊れているため、続きから遊べません。
          </p>
          <p className={styles.notice}>
            記録は消していません。はじめから遊ぶと、この記録は上書きされます。
          </p>
        </PixelWindow>
      ) : null}

      {isUnavailable ? (
        <PixelWindow heading="進行を保存できません">
          <p className={styles.warning}>
            このブラウザでは記録を保存できない設定になっています。
          </p>
          <p className={styles.notice}>
            遊ぶことはできますが、閉じると進行が失われます。
          </p>
        </PixelWindow>
      ) : null}

      {confirmingOverwrite ? (
        <PixelWindow heading="はじめから始めますか">
          <p>今の記録は消えて、最初からになります。</p>
          <div className={styles.confirmActions}>
            <PixelLink href="/new-game" variant="primary">
              消してはじめる
            </PixelLink>
            <PixelButton onClick={() => setConfirmingOverwrite(false)}>
              やめる
            </PixelButton>
          </div>
        </PixelWindow>
      ) : (
        <PixelWindow heading="メニュー">
          <div className={styles.menu}>
            {hasSave || isCorrupted ? (
              <PixelButton
                variant="primary"
                onClick={() => setConfirmingOverwrite(true)}
              >
                はじめから
              </PixelButton>
            ) : (
              <PixelLink href="/new-game" variant="primary">
                はじめから
              </PixelLink>
            )}

            {hasSave ? (
              <PixelLink href="/map">つづきから</PixelLink>
            ) : (
              <PixelButton disabled>つづきから</PixelButton>
            )}

            <PixelLink href="/techniques">わざずかん</PixelLink>
            <PixelLink href="/dictionary">すもうじてん</PixelLink>
          </div>

          {hasSave ? (
            <p className={styles.notice}>
              {state.save?.playerName} ／ {state.save?.experience} EXP
            </p>
          ) : null}
        </PixelWindow>
      )}

      {isCorrupted ? (
        <PixelWindow>
          <PixelButton onClick={resetGame}>記録を消して作り直す</PixelButton>
          <p className={styles.notice}>
            消すと元に戻せません。まず「はじめから」を試してください。
          </p>
        </PixelWindow>
      ) : null}
    </GameShell>
  );
}
