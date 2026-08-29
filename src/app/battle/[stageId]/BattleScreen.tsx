"use client";

import { useRouter } from "next/navigation";
import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { BattleScene } from "@/components/battle/BattleScene";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import { findStage, quizzesOfStage } from "@/lib/content";
import type { QuizResult } from "@/lib/game";

// 取組画面。
// 全問終えた時点で FINISH_BATTLE を送り、リザルトへ進む。
// 報酬計算をここで一度だけ行うため、リザルト画面は表示に専念できる（ADR-0004）。

export function BattleScreen({ stageId }: { stageId: string }) {
  const router = useRouter();
  const { isReady, hasSave, dispatch, isUnlocked } = useGame();
  const stage = findStage(stageId);

  if (!isReady) {
    return (
      <GameShell title="取組">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  if (!stage) {
    return (
      <GameShell title="取組">
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

  const quizzes = quizzesOfStage(stage);

  if (quizzes.length === 0) {
    return (
      <GameShell title={stage.name}>
        <PixelWindow heading="準備中">
          <p>この場所の取組は、まだ用意できていない。</p>
          <PixelLink href="/map" variant="primary">
            マップへもどる
          </PixelLink>
        </PixelWindow>
      </GameShell>
    );
  }

  function finish(results: QuizResult[]) {
    if (!stage) return;
    dispatch({
      type: "FINISH_BATTLE",
      stage,
      results,
      now: new Date().toISOString(),
    });
    router.push(`/result/${stage.id}`);
  }

  return (
    <GameShell title={`${stage.name} の取組`}>
      <BattleScene quizzes={quizzes} onFinish={finish} />
    </GameShell>
  );
}
