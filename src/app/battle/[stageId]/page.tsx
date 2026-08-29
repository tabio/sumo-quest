import { allStageIds } from "@/lib/content";
import { BattleScreen } from "./BattleScreen";

// 取組画面。設計書「6.5 取組」。
// 静的エクスポートのため、全ステージ分をここで生成する。

export function generateStaticParams() {
  return allStageIds().map((stageId) => ({ stageId }));
}

export default async function BattlePage({
  params,
}: PageProps<"/battle/[stageId]">) {
  const { stageId } = await params;
  return <BattleScreen stageId={stageId} />;
}
