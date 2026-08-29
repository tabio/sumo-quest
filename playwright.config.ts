import { defineConfig, devices } from "@playwright/test";
import { resolveBasePath } from "./config/basePath.mjs";

// E2Eの設定。
// 静的エクスポートした out/ を配信して確認する。
// 開発サーバーではなく本番と同じ出力を対象にするのは、
// 静的エクスポート特有の壊れ方（動的ルートの生成漏れなど）を拾うため。

const PORT = 4173;

// 配信もビルドと同じ basePath の下で行う（scripts/serve-e2e.mjs）。
// baseURL に basePath まで含めるため、テスト側の goto は相対パスで書く。
// 末尾のスラッシュは相対解決に必要なので落とさないこと。
const baseURL = `http://127.0.0.1:${PORT}${resolveBasePath()}/`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // CIの実行機はローカルより遅く、1本で十数回の画面遷移を行うテストがある。
  timeout: process.env.CI ? 60_000 : 30_000,
  // CIでは失敗時にレポートを成果物として残す（.github/workflows/ci.yml）。
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile",
      // 基準幅320px以上の想定に合わせ、スマートフォン相当で確認する。
      use: { ...devices["Pixel 5"] },
      testIgnore: /narrow\.spec\.ts/,
    },
    {
      // 基準幅ちょうどでの表示確認（P4-4）。
      // 対応端末の下限であり、ここで崩れなければ広い画面でも崩れない。
      // 全本数を2回流すと時間だけが増えるため、専用の1本に限る。
      name: "narrow",
      use: { ...devices["Pixel 5"], viewport: { width: 320, height: 568 } },
      testMatch: /narrow\.spec\.ts/,
    },
  ],
  webServer: {
    command: "node scripts/serve-e2e.mjs",
    env: { E2E_PORT: String(PORT) },
    // ポートではなくURLで待つ。basePath の下に置けていない場合に、
    // テスト本体ではなく起動時点で気づけるようにする。
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
