import type { NextConfig } from "next";
import { resolveBasePath } from "./config/basePath.mjs";

// basePath の導出は config/basePath.mjs に置いている。
// E2Eの配信側（playwright.config.ts）と同じ値を使う必要があるため。
const basePath = resolveBasePath();

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
