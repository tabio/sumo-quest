// basePath の唯一の出所。
//
// GitHub Pages ではリポジトリ配下のサブパスで配信されるため basePath を付ける。
// ローカル開発では空文字とし、http://localhost:3000/ で動くようにする。
// 判定は GitHub Actions が設定する環境変数で行う。
//
// ビルド（next.config.ts）とE2Eの配信（playwright.config.ts、
// scripts/serve-e2e.mjs）が同じ値を使う必要があるため、ここに集約する。
// 二重管理にすると、片方だけ更新されてもテストが通ってしまう。
//
// Nodeがそのまま読めるよう .mjs で置く。TypeScriptに書くと
// scripts/ 配下のスクリプトから読めない。

/** @returns {string} 先頭スラッシュ付きのbasePath。ルート配信なら空文字。 */
export function resolveBasePath() {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

  return isGitHubPages && repositoryName ? `/${repositoryName}` : "";
}
