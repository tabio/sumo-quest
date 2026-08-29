import { allStageIds } from "@/lib/content";
import { ResultScreen } from "./ResultScreen";

// リザルト画面。設計書「6.6 リザルト」。
// 静的エクスポートのため、全ステージ分をここで生成する。

export function generateStaticParams() {
  return allStageIds().map((stageId) => ({ stageId }));
}

export default async function ResultPage({
  params,
}: PageProps<"/result/[stageId]">) {
  const { stageId } = await params;
  return <ResultScreen stageId={stageId} />;
}
