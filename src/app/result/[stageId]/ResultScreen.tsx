"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelLink } from "@/components/ui/PixelLink";
import { techniques } from "@/data/techniques";
import { terms } from "@/data/terms";
import { useGame } from "@/hooks/useGame";
import { findStage } from "@/lib/content";
import styles from "./page.module.css";

// リザルト画面。設計書「6.6 リザルト」。
//
// この画面は表示だけを行い、報酬計算も保存も行わない。
// 計算は取組の終了時点で済んでいる（ADR-0004）。
// そのため再読み込みしてもEXPは増えない。

function nameOfTechnique(id: string): string {
  return techniques.find((technique) => technique.id === id)?.name ?? id;
}

function nameOfTerm(id: string): string {
  return terms.find((term) => term.id === id)?.name ?? id;
}

export function ResultScreen({ stageId }: { stageId: string }) {
  const { isReady, state } = useGame();
  const battle = state.lastBattle;
  const stage = findStage(stageId);

  if (!isReady) {
    return (
      <GameShell title="けっか">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  // 直接URLを開いた場合や再読み込みした場合は、表示する結果がない。
  if (!battle || battle.stageId !== stageId) {
    return (
      <GameShell title="けっか">
        <PixelWindow heading="表示できる結果がありません">
          <p>取組を終えたあとに、この画面が出ます。</p>
          <div className={styles.actions}>
            <PixelLink href="/map" variant="primary">
              マップへもどる
            </PixelLink>
            {stage ? (
              <PixelLink href={`/battle/${stage.id}`}>
                もういちど取組へ
              </PixelLink>
            ) : null}
          </div>
        </PixelWindow>
      </GameShell>
    );
  }

  return (
    <GameShell title={`${battle.stageName} の けっか`}>
      <PixelWindow>
        <p
          className={[
            styles.verdict,
            battle.passed ? styles.passed : styles.failed,
          ].join(" ")}
          role="status"
        >
          {battle.passed ? "◯ かちこし" : "× まけこし"}
        </p>
      </PixelWindow>

      <PixelWindow heading="成績">
        <div className={styles.rows}>
          <p className={styles.row}>
            <span className={styles.label}>正答数</span>
            <span className={styles.value}>
              {battle.score} / {battle.total}
            </span>
          </p>
          <p className={styles.row}>
            <span className={styles.label}>獲得EXP</span>
            <span className={styles.value}>{battle.gainedExperience}</span>
          </p>
          <p className={styles.row}>
            <span className={styles.label}>番付</span>
            <span className={styles.value}>
              {battle.promoted
                ? `${battle.rankBefore} → ${battle.rankAfter}`
                : battle.rankAfter}
            </span>
          </p>
        </div>

        {battle.promoted ? (
          <p className={styles.promoted}>
            番付が {battle.rankAfter} に上がった。
          </p>
        ) : null}
      </PixelWindow>

      {battle.newTechniqueIds.length > 0 || battle.newTermIds.length > 0 ? (
        <PixelWindow heading="おぼえたこと">
          <ul className={styles.list}>
            {battle.newTechniqueIds.map((id) => (
              <li key={id}>わざ：{nameOfTechnique(id)}</li>
            ))}
            {battle.newTermIds.map((id) => (
              <li key={id}>ことば：{nameOfTerm(id)}</li>
            ))}
          </ul>
        </PixelWindow>
      ) : null}

      {battle.unlockedStageId ? (
        <PixelWindow heading="あたらしい場所">
          <p>
            {findStage(battle.unlockedStageId)?.name ?? battle.unlockedStageId}
            へ 行けるようになった。
          </p>
        </PixelWindow>
      ) : null}

      <PixelWindow>
        <div className={styles.actions}>
          <PixelLink href="/map" variant="primary">
            マップへもどる
          </PixelLink>
          {battle.passed ? null : (
            <PixelLink href={`/battle/${battle.stageId}`}>
              もういちど挑戦する
            </PixelLink>
          )}
        </div>
      </PixelWindow>
    </GameShell>
  );
}
