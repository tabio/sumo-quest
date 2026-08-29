"use client";

import { useGame } from "@/hooks/useGame";
import styles from "./PlayerStatus.module.css";

/**
 * 番付とEXPの常時表示。
 * 設計書「6.3 ワールドマップ」の「プレイヤーの番付とEXPを常時表示」に対応する。
 */
export function PlayerStatus() {
  const { state, rank, nextRank, experienceToNextRank, isTopRank } = useGame();
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
      <p className={styles.next}>
        {nextRank && experienceToNextRank !== null
          ? `つぎの${nextRank.name}まで あと ${experienceToNextRank} EXP`
          : // EXPで上がれる番付が尽きても、横綱だけは最終試験で決まる。
            isTopRank
            ? "これより上はない"
            : "横綱は 最終試験に かてば なれる"}
      </p>
    </div>
  );
}
