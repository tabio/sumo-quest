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

// マップ下部のメニュー。
// 行き先の無い項目は置かない。静的エクスポートでは404の行き止まりになるため。
const MENU = [
  { label: "わざずかん", href: "/techniques" },
  { label: "すもうじてん", href: "/dictionary" },
  { label: "ステータス", href: "/status" },
] as const;

export default function MapPage() {
  const { isReady } = useGame();
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
      </PixelWindow>

      <WorldMap stages={stages} />

      <PixelWindow>
        <ul className={styles.menu}>
          {MENU.map((item) => (
            <li key={item.label}>
              <PixelLink href={item.href}>{item.label}</PixelLink>
            </li>
          ))}
        </ul>
      </PixelWindow>
    </GameShell>
  );
}
