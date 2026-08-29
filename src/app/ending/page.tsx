"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelLink } from "@/components/ui/PixelLink";
import { techniques } from "@/data/techniques";
import { terms } from "@/data/terms";
import { GUARD_HEADINGS, GUARD_MESSAGES } from "@/hooks/guardMessages";
import { useGame } from "@/hooks/useGame";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import styles from "./page.module.css";

// エンディング。設計書「4. URL・画面一覧」。
//
// 最終試験をクリアした人だけが見られる（P3-4）。
// 直リンクで先に見えてしまうと、最後の取組に向かう意味がなくなる。
//
// 旅の終わりであって、ゲームオーバーではない。
// 図鑑や辞典を埋めに戻れるよう、マップへの導線を残す。

export default function EndingPage() {
  const { isReady, state, rank } = useGame();
  const guard = useRouteGuard({ requireFinalClear: true });

  if (!isReady) {
    return (
      <GameShell title="エンディング">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  if (guard.kind === "redirect") {
    return (
      <GameShell title="エンディング">
        <PixelWindow heading={GUARD_HEADINGS[guard.reason]}>
          <p>{GUARD_MESSAGES[guard.reason]}</p>
          <PixelLink href={guard.to} variant="primary">
            {guard.to === "/" ? "タイトルへ" : "マップへもどる"}
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  const save = state.save;
  if (!save || !rank) return null;

  return (
    <GameShell title="エンディング">
      <PixelWindow>
        <p className={styles.headline} role="status">
          {save.playerName} は {rank.name} になった。
        </p>
      </PixelWindow>

      <PixelWindow heading="旅のおわりに">
        <div className={styles.story}>
          <p>横綱を土俵の外へ出したとき、国技館がどよめいた。</p>
          <p>
            土俵のこと、決まり手のこと、番付のこと、本場所のこと。
            ここまでに覚えたすべてが、あの一番に入っていた。
          </p>
          <p>
            番付は場所ごとに作り直される。
            横綱になっても、稽古の日々が続くことに変わりはない。
          </p>
          <p>相撲の旅は、ここから始まる。</p>
        </div>
      </PixelWindow>

      <PixelWindow heading="旅の記録">
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
            <dt className={styles.label}>おぼえたわざ</dt>
            <dd className={styles.value}>
              {techniques.length} のうち {save.learnedTechniqueIds.length}
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>出会ったことば</dt>
            <dd className={styles.value}>
              {terms.length} のうち {save.discoveredTermIds.length}
            </dd>
          </div>
        </dl>
      </PixelWindow>

      <PixelWindow>
        <div className={styles.actions}>
          <PixelLink href="/map" variant="primary">
            マップへもどる
          </PixelLink>
          <PixelLink href="/dictionary">すもうじてん</PixelLink>
          <PixelLink href="/techniques">わざずかん</PixelLink>
        </div>
      </PixelWindow>
    </GameShell>
  );
}
