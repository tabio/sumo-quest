"use client";

import { DiscoveryToast } from "@/components/game/DiscoveryToast";
import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { finalStage, findStage } from "@/lib/content";
import styles from "./page.module.css";

// リザルト画面。設計書「6.6 リザルト」。
//
// この画面は表示だけを行い、報酬計算も保存も行わない。
// 計算は取組の終了時点で済んでいる（ADR-0004）。
// そのため再読み込みしてもEXPは増えない。

export function ResultScreen({ stageId }: { stageId: string }) {
  const { isReady, state, hasFinishedGame } = useGame();
  // セーブなしでリザルトへ直リンクされた場合はタイトルへ戻す（設計書「16.」）。
  const guard = useRouteGuard();
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

  if (guard.kind === "redirect") {
    return (
      <GameShell title="けっか">
        <PixelWindow heading="記録がありません">
          <p>タイトルへもどります。</p>
          <PixelLink href="/" variant="primary">
            タイトルへ
          </PixelLink>
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

  // 最終試験の結果を見ているときだけエンディングへ誘う。
  // 全クリア後に前のステージを遊び直しても、そこからは出さない。
  const finished =
    battle.passed && battle.stageId === finalStage().id && hasFinishedGame;

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

      {/* この画面は最初から結果が載っているため、読み上げには変化として伝えない。 */}
      <DiscoveryToast
        techniqueIds={battle.newTechniqueIds}
        termIds={battle.newTermIds}
        announce={false}
      />

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
          {/* 最終試験に勝った直後だけ、エンディングを主要な導線にする（P3-4）。 */}
          {finished ? (
            <PixelLink href="/ending" variant="primary">
              エンディングへ
            </PixelLink>
          ) : null}
          <PixelLink href="/map" variant={finished ? "default" : "primary"}>
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
