"use client";

import { useRouter } from "next/navigation";
import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { StageExit } from "@/components/game/StageExit";
import { BattleScene } from "@/components/battle/BattleScene";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import { GUARD_HEADINGS, GUARD_MESSAGES } from "@/hooks/guardMessages";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { findStage, quizzesOfStage } from "@/lib/content";
import type { QuizResult } from "@/lib/game";

// 取組画面。
// セーブなし・不明なステージ・未解放は useRouteGuard が画面を移す。
// 全問終えた時点で FINISH_BATTLE を送り、リザルトへ進む。
// 報酬計算をここで一度だけ行うため、リザルト画面は表示に専念できる（ADR-0004）。

export function BattleScreen({ stageId }: { stageId: string }) {
  const router = useRouter();
  const { isReady, dispatch } = useGame();
  const stage = findStage(stageId);
  // 不明なステージと未解放ステージへの直リンクはマップへ戻す（設計書「16.」）。
  const guard = useRouteGuard({ stageId, stageExists: stage !== undefined });

  if (!isReady) {
    return (
      <GameShell title="取組">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  if (guard.kind === "redirect") {
    return (
      <GameShell title="取組">
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
      {/* 取組の途中でも抜けられるようにする。
          全問終えるまでリザルトへ移らないため、これが無いと戻る道が無くなる。 */}
      <StageExit warning="とちゅうでやめた取組は記録されず、つぎは1問目からになります。" />
      <BattleScene quizzes={quizzes} onFinish={finish} />
    </GameShell>
  );
}
