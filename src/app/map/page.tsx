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
        <div className={styles.menu}>
          <PixelLink href="/techniques">わざずかん</PixelLink>
          <PixelLink href="/dictionary">すもうじてん</PixelLink>
          <PixelLink href="/status">ステータス</PixelLink>
        </div>
      </PixelWindow>
    </GameShell>
  );
}
