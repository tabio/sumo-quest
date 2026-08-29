// コンテンツデータの整合検証をビルド前に走らせる（P2-12）。
//
// 参照切れIDや正解の不整合は、画面を開いて初めて気づくと発見が遅れる。
// ステージが増えるほど手動確認は破綻するため、ビルドを失敗させて止める。
// package.json の prebuild から呼ばれるため、npm run build で自動的に走る。
//
// 検証の規則は src/lib/contentIntegrity.ts を正とする。
// このスクリプトはデータを渡して結果を出すだけに留める。
//
// TypeScript のデータファイルを Node から直接読む。
// data/ と contentIntegrity.ts の import は型だけなので、
// Node の型注釈除去だけで実行でき、ビルド用の別立ての仕組みを要さない。

import { collectContentProblems } from "../src/lib/contentIntegrity.ts";
import { lessons } from "../src/data/lessons.ts";
import { npcs } from "../src/data/npcs.ts";
import { quizzes } from "../src/data/quizzes.ts";
import { stages } from "../src/data/stages.ts";
import { techniques } from "../src/data/techniques.ts";
import { terms } from "../src/data/terms.ts";

const problems = collectContentProblems({
  stages,
  lessons,
  quizzes,
  techniques,
  terms,
  npcs,
});

if (problems.length > 0) {
  console.error(`コンテンツデータに ${problems.length} 件の問題があります。`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(
  `コンテンツデータの検証に成功しました（ステージ ${stages.length} / 学習 ${lessons.length} / クイズ ${quizzes.length}）。`,
);
