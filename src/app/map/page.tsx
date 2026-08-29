"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PlayerStatus } from "@/components/game/PlayerStatus";
import { WorldMap } from "@/components/game/WorldMap";
import { PixelLink } from "@/components/ui/PixelLink";
import { stages } from "@/data/stages";
import { useGame } from "@/hooks/useGame";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import styles from "./page.module.css";

// ワールドマップ画面。設計書「6.3 ワールドマップ」。
// セーブがない状態で来た場合の扱いは P1-13 のルートガードで入れる。

// 図鑑・辞典・ステータスの3画面は Phase 2（P2-9〜P2-11）で作る。
// 画面ができるまでリンクにすると、静的エクスポートには行き先が無く、
// 押した利用者が404で行き止まりになる。
// 未解放の地点（WorldMap）と同じく、操作できない状態で存在だけを示す。
const PREPARING_MENU = ["わざずかん", "すもうじてん", "ステータス"];

export default function MapPage() {
  const { state, isReady } = useGame();
  // セーブがない状態でマップへ直接来た場合はタイトルへ戻す（設計書「16.」）。
  const guard = useRouteGuard();

  if (!isReady) {
    return (
      <GameShell title="マップ">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  if (guard.kind === "redirect") {
    return (
      <GameShell title="マップ">
        <PixelWindow heading="記録がありません">
          <p>タイトルへもどります。</p>
          <PixelLink href="/" variant="primary">
            タイトルへ
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  return (
    <GameShell title="マップ">
      <PixelWindow>
        <PlayerStatus />
        {state.saveFailed ? (
          <p className={styles.notice} role="status">
            進行を保存できませんでした。閉じると記録が失われます。
          </p>
        ) : null}
      </PixelWindow>

      <WorldMap stages={stages} />

      <PixelWindow>
        <ul className={styles.menu}>
          {PREPARING_MENU.map((label) => (
            <li key={label}>
              <span className={styles.menuItem} aria-disabled="true">
                <span>{label}</span>
                <span className={styles.menuState}>準備中</span>
              </span>
            </li>
          ))}
        </ul>
      </PixelWindow>
    </GameShell>
  );
}
