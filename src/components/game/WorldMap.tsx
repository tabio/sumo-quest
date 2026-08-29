"use client";

import Link from "next/link";
import { PixelWindow } from "@/components/game/PixelWindow";
import { useGame } from "@/hooks/useGame";
import type { Stage, StageStatus } from "@/types/game";
import styles from "./WorldMap.module.css";

// ワールドマップ。設計書「6.3 ワールドマップ」。
//
// 自由移動は実装せず、地点選択方式とする。
// 状態は色だけでなく記号と文言でも区別する（設計書「15.」）。

type PointState = "current" | "cleared" | "unlocked" | "locked";

const MARKERS: Record<PointState, string> = {
  current: "▶",
  cleared: "✓",
  unlocked: "・",
  locked: "×",
};

const STATE_LABELS: Record<PointState, string> = {
  current: "いまここ",
  cleared: "クリア済み",
  unlocked: "行ける",
  locked: "まだ行けない",
};

function pointState(
  status: StageStatus | undefined,
  isCurrent: boolean,
): PointState {
  if (status === undefined || status === "locked") return "locked";
  if (isCurrent) return "current";
  if (status === "cleared") return "cleared";
  return "unlocked";
}

export function WorldMap({ stages }: { stages: Stage[] }) {
  const { progressOf, currentStage } = useGame();
  const ordered = [...stages].sort((a, b) => a.order - b.order);

  return (
    <PixelWindow heading="ワールドマップ">
      <ul className={styles.list}>
        {ordered.map((stage) => {
          const status = progressOf(stage.id)?.status;
          const state = pointState(status, currentStage?.id === stage.id);
          const className = [styles.point, styles[state]]
            .filter(Boolean)
            .join(" ");

          const body = (
            <>
              <span className={styles.marker} aria-hidden="true">
                {MARKERS[state]}
              </span>
              <span className={styles.body}>
                <span className={styles.name}>{stage.name}</span>
                <span className={styles.state}>
                  {STATE_LABELS[state]}／{stage.theme}
                </span>
              </span>
            </>
          );

          return (
            <li key={stage.id}>
              {state === "locked" ? (
                // 未解放は操作できない状態にする（設計書「6.3」）。
                <div className={className} aria-disabled="true">
                  {body}
                </div>
              ) : (
                <Link
                  className={className}
                  href={`/stage/${stage.id}`}
                  aria-current={state === "current" ? "true" : undefined}
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </PixelWindow>
  );
}
