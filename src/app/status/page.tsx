"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelLink } from "@/components/ui/PixelLink";
import { stages } from "@/data/stages";
import { techniques } from "@/data/techniques";
import { terms } from "@/data/terms";
import { useGame } from "@/hooks/useGame";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import styles from "./page.module.css";

// ステータス画面。設計書「4. URL・画面一覧」。
//
// 名前・番付・EXP・進捗をまとめて見せる（P2-11）。
// 値はすべて導出値であり、この画面で保存を書き換えることはない。

const STAGE_STATUS_LABELS = {
  locked: "まだ行けない",
  unlocked: "行ける",
  lessonCompleted: "稽古ずみ",
  cleared: "クリア",
} as const;

export default function StatusPage() {
  const {
    isReady,
    state,
    rank,
    nextRank,
    experienceToNextRank,
    progressOf,
    accuracyOf,
  } = useGame();
  // セーブがない状態で直接来た場合はタイトルへ戻す（設計書「16.」）。
  const guard = useRouteGuard();

  if (!isReady) {
    return (
      <GameShell title="ステータス">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  if (guard.kind === "redirect") {
    return (
      <GameShell title="ステータス">
        <PixelWindow heading="記録がありません">
          <p>タイトルへもどります。</p>
          <PixelLink href="/" variant="primary">
            タイトルへ
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  const save = state.save;
  if (!save || !rank) return null;

  const ordered = [...stages].sort((a, b) => a.order - b.order);
  const clearedCount = ordered.filter(
    (stage) => progressOf(stage.id)?.status === "cleared",
  ).length;

  return (
    <GameShell title="ステータス">
      <PixelWindow heading="力士">
        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt className={styles.label}>しこ名</dt>
            <dd className={styles.value}>{save.playerName}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>番付</dt>
            <dd className={styles.value}>{rank.name}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>EXP</dt>
            <dd className={styles.value}>{save.experience}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>つぎの番付</dt>
            <dd className={styles.value}>
              {nextRank && experienceToNextRank !== null
                ? `${nextRank.name} まで あと ${experienceToNextRank} EXP`
                : "これより上はない"}
            </dd>
          </div>
        </dl>
      </PixelWindow>

      <PixelWindow heading="あつめたもの">
        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt className={styles.label}>クリア</dt>
            <dd className={styles.value}>
              {ordered.length} のうち {clearedCount}
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>わざ</dt>
            <dd className={styles.value}>
              {techniques.length} のうち {save.learnedTechniqueIds.length}
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>ことば</dt>
            <dd className={styles.value}>
              {terms.length} のうち {save.discoveredTermIds.length}
            </dd>
          </div>
        </dl>
      </PixelWindow>

      <PixelWindow heading="ばしょごとの記録">
        <ul className={styles.stages}>
          {ordered.map((stage) => {
            const progress = progressOf(stage.id);
            const accuracy = accuracyOf(stage.id);
            const status = progress?.status ?? "locked";

            return (
              <li key={stage.id} className={styles.stage}>
                <p className={styles.stageName}>{stage.name}</p>
                <p className={styles.stageState}>
                  {STAGE_STATUS_LABELS[status]}
                  {progress && progress.attempts > 0
                    ? `／${progress.attempts} 回 挑戦／最高 ${progress.bestScore} 問`
                    : "／挑戦はまだ"}
                </p>
                {accuracy !== null ? (
                  <p className={styles.stageState}>
                    直近の正答率 {Math.round(accuracy * 100)}%
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </PixelWindow>

      <PixelWindow>
        <PixelLink href="/map" variant="primary">
          マップへもどる
        </PixelLink>
      </PixelWindow>
    </GameShell>
  );
}
