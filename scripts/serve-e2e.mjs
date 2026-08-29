// E2E用に、静的エクスポートした out/ を配信する。
//
// out/ の中身はサイトのルート相当で、basePath はリンクと資産のパスにだけ付く。
// そのため out/ をポート直下で配信すると、basePath 付きのビルド（CI）では
// JSとCSSがすべて404になり、画面が一切描画されない。
//
// 実際の配信と同じく basePath の下に置いてから配信する。
// これにより「GitHub Pagesのサブパス配信」（testing.md のE2E 6）の
// 経路を、1本目のE2Eの時点から通すことになる。

import { spawn } from "node:child_process";
import { access, cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveBasePath } from "../config/basePath.mjs";

const port = process.env.E2E_PORT ?? "4173";
const outDir = fileURLToPath(new URL("../out", import.meta.url));

try {
  await access(outDir);
} catch {
  console.error(
    "out/ がありません。E2Eの前に npm run build を実行してください。",
  );
  process.exit(1);
}

// リポジトリ内に置くと .gitignore や整形対象の除外が増えるため、一時領域に作る。
const root = await mkdtemp(path.join(tmpdir(), "sumo-quest-e2e-"));
await cp(outDir, path.join(root, resolveBasePath()), { recursive: true });

const server = spawn(
  "npx",
  ["serve", root, "--listen", port, "--no-clipboard"],
  { stdio: "inherit" },
);

const stop = () => server.kill();
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

server.on("exit", async (code) => {
  await rm(root, { recursive: true, force: true });
  process.exit(code ?? 0);
});
