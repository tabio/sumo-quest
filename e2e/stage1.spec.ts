import { expect, test, type Page } from "@playwright/test";
import { lessons } from "../src/data/lessons";
import { quizzes } from "../src/data/quizzes";

// E2E 1本目：新規開始 → STAGE 1 クリア。
// testing.md のとおり Phase 1 の完了ゲートに含める。
// Phase 2 の汎用化リファクタで STAGE 1 が壊れたことを即座に検知するため（R-2）。

const SAVE_KEY = "sumo-quest:save";

const stage1Quizzes = quizzes.filter((quiz) => quiz.stageId === "sumo-stable");
const stage1Lesson = lessons.find(
  (lesson) => lesson.stageId === "sumo-stable",
)!;

/** 学習を最後まで読み進める。メッセージ数はコンテンツデータから引く。 */
async function readLesson(page: Page) {
  for (let i = 0; i < stage1Lesson.messages.length - 1; i += 1) {
    await page.getByRole("button", { name: "つぎへ" }).click();
  }
  await page.getByRole("button", { name: "よみおわった" }).click();
}

/** すべての問題に正解する。正解はコンテンツデータから引く。 */
async function answerAllCorrectly(page: Page) {
  for (const [index, quiz] of stage1Quizzes.entries()) {
    await expect(page.getByText(quiz.question)).toBeVisible();

    const correct = quiz.choices.find(
      (choice) => choice.id === quiz.correctChoiceId,
    );
    await page.getByRole("button", { name: correct?.label }).click();
    await expect(page.getByRole("status")).toContainText("せいかい");

    const isLast = index === stage1Quizzes.length - 1;
    await page
      .getByRole("button", { name: isLast ? "けっかへ" : "つぎの問題へ" })
      .click();
  }
}

test.describe("新規開始から STAGE 1 クリアまで", () => {
  test("名前を決めて学習と取組を終え、再読み込みしても続きから再開できる", async ({
    page,
  }) => {
    await page.goto("/");

    // タイトル：セーブがないので「つづきから」は押せない。
    await expect(
      page.getByRole("heading", { level: 1, name: "SUMO QUEST" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "つづきから" }),
    ).toBeDisabled();

    // 名前入力。
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();

    // マップ：STAGE 1 だけが選べる。
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");
    await expect(page.getByText("ちからまる")).toBeVisible();
    await expect(page.getByText("序ノ口")).toBeVisible();

    // 学習。
    await page.getByRole("link", { name: /すもう部屋/ }).click();
    await expect(
      page.getByText(`1 / ${stage1Lesson.messages.length}`),
    ).toBeVisible();
    await readLesson(page);
    await expect(
      page.getByRole("region", { name: "学習おわり" }),
    ).toBeVisible();

    // 取組。
    await page.getByRole("link", { name: "取組へ" }).click();
    await expect(
      page.getByText(`1 問目 / 全 ${stage1Quizzes.length} 問`),
    ).toBeVisible();
    await answerAllCorrectly(page);

    // リザルト：EXPが入り、次のステージが解放される。
    await expect(page.getByRole("status")).toContainText("かちこし");
    await expect(page.getByRole("region", { name: "成績" })).toContainText(
      "5 / 5",
    );
    await expect(
      page.getByRole("region", { name: "あたらしい場所" }),
    ).toContainText("土俵");

    // 番付が上がっている（学習10 + 正解50 + クリア50 = 110 EXP）。
    await expect(page.getByRole("region", { name: "成績" })).toContainText(
      "序ノ口 → 序二段",
    );

    await page.getByRole("link", { name: "マップへもどる" }).click();
    await expect(page.getByText("110")).toBeVisible();

    // 再読み込みしても続きから再開できる。
    await page.reload();
    await expect(page.getByText("ちからまる")).toBeVisible();
    await expect(page.getByText("110")).toBeVisible();
    await expect(page.getByText("クリア済み")).toBeVisible();
  });

  test("同じステージを再プレイしてもEXPが二重に入らない", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();

    await page.getByRole("link", { name: /すもう部屋/ }).click();
    await readLesson(page);
    await page.getByRole("link", { name: "取組へ" }).click();
    await answerAllCorrectly(page);
    await page.getByRole("link", { name: "マップへもどる" }).click();
    await expect(page.getByText("110")).toBeVisible();

    // 2周目。学習も取組もやり直す。
    await page.getByRole("link", { name: /すもう部屋/ }).click();
    await readLesson(page);
    await page.getByRole("link", { name: "取組へ" }).click();
    await answerAllCorrectly(page);
    await page.getByRole("link", { name: "マップへもどる" }).click();

    // EXPは増えていない。
    await expect(page.getByText("110")).toBeVisible();
  });

  test("セーブがない状態でマップへ直接来るとタイトルへ戻される", async ({
    page,
  }) => {
    await page.goto("/map/");
    await expect(
      page.getByRole("heading", { level: 1, name: "SUMO QUEST" }),
    ).toBeVisible();
  });

  test("未解放のステージへ直接来るとマップへ戻される", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");

    await page.goto("/stage/kokugikan/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");
  });

  test("保存が壊れていても消さず、案内を出す", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(
      (key) => window.localStorage.setItem(key, "{壊れている"),
      SAVE_KEY,
    );
    await page.reload();

    await expect(
      page.getByRole("region", { name: "セーブデータを読み込めません" }),
    ).toBeVisible();

    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      SAVE_KEY,
    );
    expect(stored).toBe("{壊れている");
  });
});
