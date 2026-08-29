"use client";

import { useState } from "react";
import { DiscoveryToast } from "@/components/game/DiscoveryToast";
import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { LessonPlayer } from "@/components/learning/LessonPlayer";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import { GUARD_HEADINGS, GUARD_MESSAGES } from "@/hooks/guardMessages";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { findStage, lessonsOfStage } from "@/lib/content";

// ステージの学習画面。
// セーブなし・不明なステージ・未解放は useRouteGuard が画面を移す。
// 中身がまだ無いステージは、進行として正しい状態なので移さず案内に留める。

type Discovery = { techniqueIds: string[]; termIds: string[] };

export function StageScreen({ stageId }: { stageId: string }) {
  const { isReady, state, dispatch } = useGame();
  // 学習で新しく覚えた分だけを通知する（P2-8）。
  // 反映後のセーブと比べると差が消えるため、送る前に求めておく。
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const stage = findStage(stageId);
  // 不明なステージと未解放ステージへの直リンクはマップへ戻す（設計書「16.」）。
  const guard = useRouteGuard({ stageId, stageExists: stage !== undefined });

  if (!isReady) {
    return (
      <GameShell title="がくしゅう">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  if (guard.kind === "redirect") {
    return (
      <GameShell title="がくしゅう">
        <PixelWindow heading={GUARD_HEADINGS[guard.reason]}>
          <p>{GUARD_MESSAGES[guard.reason]}</p>
          <PixelLink href={guard.to} variant="primary">
            {guard.to === "/" ? "タイトルへ" : "マップへもどる"}
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  if (!stage) return null;

  const [lesson] = lessonsOfStage(stage);

  if (!lesson) {
    return (
      <GameShell title={stage.name}>
        <PixelWindow heading="準備中">
          <p>この場所の稽古は、まだ用意できていない。</p>
          <PixelLink href="/map" variant="primary">
            マップへもどる
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  return (
    <GameShell title={stage.name}>
      <LessonPlayer
        lesson={lesson}
        onComplete={() => {
          const save = state.save;
          setDiscovery({
            techniqueIds: (lesson.unlockTechniqueIds ?? []).filter(
              (id) => !save?.learnedTechniqueIds.includes(id),
            ),
            termIds: (lesson.discoverTermIds ?? []).filter(
              (id) => !save?.discoveredTermIds.includes(id),
            ),
          });
          dispatch({
            type: "COMPLETE_LESSON",
            stageId: stage.id,
            lessonId: lesson.id,
            techniqueIds: lesson.unlockTechniqueIds ?? [],
            termIds: lesson.discoverTermIds ?? [],
          });
        }}
        notice={
          discovery ? (
            <DiscoveryToast
              techniqueIds={discovery.techniqueIds}
              termIds={discovery.termIds}
              onClose={() => setDiscovery(null)}
            />
          ) : null
        }
      >
        <PixelLink href={`/battle/${stage.id}`} variant="primary">
          取組へ
        </PixelLink>
      </LessonPlayer>
    </GameShell>
  );
}
