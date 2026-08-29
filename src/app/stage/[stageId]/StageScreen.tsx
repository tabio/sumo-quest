"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { LessonPlayer } from "@/components/learning/LessonPlayer";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import { findStage, lessonsOfStage } from "@/lib/content";

// ステージの学習画面。
// セーブなし・未解放・準備中の扱いは、ここでは案内の表示に留める。
// 遷移を伴うルートガードは P1-13 で入れる。

export function StageScreen({ stageId }: { stageId: string }) {
  const { isReady, hasSave, dispatch, isUnlocked } = useGame();
  const stage = findStage(stageId);

  if (!isReady) {
    return (
      <GameShell title="がくしゅう">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  if (!stage) {
    return (
      <GameShell title="がくしゅう">
        <PixelWindow heading="ステージが見つかりません">
          <p>この場所は存在しません。</p>
          <PixelLink href="/map" variant="primary">
            マップへもどる
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  if (!hasSave) {
    return (
      <GameShell title={stage.name}>
        <PixelWindow heading="記録がありません">
          <p>タイトルから、はじめから遊んでください。</p>
          <PixelLink href="/" variant="primary">
            タイトルへ
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  if (!isUnlocked(stage.id)) {
    return (
      <GameShell title={stage.name}>
        <PixelWindow heading="まだ行けません">
          <p>ひとつ前のステージをクリアすると進めます。</p>
          <PixelLink href="/map" variant="primary">
            マップへもどる
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

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
        onComplete={() =>
          dispatch({
            type: "COMPLETE_LESSON",
            stageId: stage.id,
            lessonId: lesson.id,
            techniqueIds: lesson.unlockTechniqueIds ?? [],
            termIds: lesson.discoverTermIds ?? [],
          })
        }
      >
        <PixelLink href={`/battle/${stage.id}`} variant="primary">
          取組へ
        </PixelLink>
      </LessonPlayer>
    </GameShell>
  );
}
