import type { NextConfig } from "next";

// GitHub Pages ではリポジトリ配下のサブパスで配信されるため、basePath を付ける。
// ローカル開発では空文字とし、http://localhost:3000/ で動くようにする。
// 判定は GitHub Actions が設定する環境変数で行う。
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubPages && repositoryName ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  // ディレクトリ形式（/map/ → /map/index.html）で出力する。
  // 静的ホスティングではサーバー側のリライトが使えないため。
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  // 画像最適化はサーバーを必要とするため無効化する。
  images: { unoptimized: true },

  // basePath をクライアント側からも参照できるようにする。
  // next/image の src には basePath が自動で付かないため、
  // src/lib/imagePath.ts がこの値を使って解決する。
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
