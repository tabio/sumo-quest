// 画像パスの解決。
// GitHub Pages ではリポジトリ配下のサブパスで配信されるため、
// public/ 配下のファイルを参照するには basePath を前に付ける必要がある。
//
// next/link と異なり、img や next/image の src には basePath が自動で付かない。
// 解決箇所が画面ごとに散らばると R-1（サブパス配信でリンク・画像が壊れる）を招くため、
// ここに集約する。画像を参照する箇所は必ずこのヘルパーを通す。
//
// basePath の値は next.config.ts が NEXT_PUBLIC_BASE_PATH として渡す。

/** 先頭・末尾のスラッシュを取り除く。 */
function trimSlashes(value: string): string {
  return value.replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * public/ 配下のファイルへのパスを解決する。
 *
 * @param path public/ を起点とした相対パス（例：`images/characters/oyakata.png`）
 */
export function assetPath(path: string): string {
  const basePath = trimSlashes(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  const normalized = trimSlashes(path);
  return basePath ? `/${basePath}/${normalized}` : `/${normalized}`;
}

/**
 * public/images/ 配下の画像パスを解決する。
 *
 * @param path public/images/ を起点とした相対パス（例：`characters/oyakata.png`）
 */
export function imagePath(path: string): string {
  return assetPath(`images/${trimSlashes(path)}`);
}
