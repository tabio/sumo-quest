import { allStageIds } from "@/lib/content";
import { StageScreen } from "./StageScreen";

// 学習画面。設計書「6.4 学習」。
// 静的エクスポートのため、全ステージ分をここで生成する（設計書「4. URL・画面一覧」）。

export function generateStaticParams() {
  return allStageIds().map((stageId) => ({ stageId }));
}

export default async function StagePage({
  params,
}: PageProps<"/stage/[stageId]">) {
  const { stageId } = await params;
  return <StageScreen stageId={stageId} />;
}
