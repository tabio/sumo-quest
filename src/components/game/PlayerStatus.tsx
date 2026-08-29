"use client";

import { useGame } from "@/hooks/useGame";
import styles from "./PlayerStatus.module.css";

/**
 * 番付とEXPの常時表示。
 * 設計書「6.3 ワールドマップ」の「プレイヤーの番付とEXPを常時表示」に対応する。
 */
export function PlayerStatus() {
  const { state, rank, nextRank, experienceToNextRank } = useGame();
  const save = state.save;
  if (!save || !rank) return null;

  return (
    <div className={styles.status}>
      <p className={styles.item}>
        <span className={styles.label}>しこ名</span>
        <span className={styles.value}>{save.playerName}</span>
      </p>
      <p className={styles.item}>
        <span className={styles.label}>番付</span>
        <span className={styles.value}>{rank.name}</span>
      </p>
      <p className={styles.item}>
        <span className={styles.label}>EXP</span>
        <span className={styles.value}>{save.experience}</span>
      </p>
      {nextRank && experienceToNextRank !== null ? (
        <p className={styles.next}>
          つぎの{nextRank.name}まで あと {experienceToNextRank} EXP
        </p>
      ) : null}
    </div>
  );
}
