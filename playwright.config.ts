import { defineConfig, devices } from "@playwright/test";

// E2Eの設定。
// 静的エクスポートした out/ を配信して確認する。
// 開発サーバーではなく本番と同じ出力を対象にするのは、
// 静的エクスポート特有の壊れ方（動的ルートの生成漏れなど）を拾うため。

const PORT = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile",
      // 基準幅320px以上の想定に合わせ、スマートフォン相当で確認する。
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: `npx serve out --listen ${PORT} --no-clipboard`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
