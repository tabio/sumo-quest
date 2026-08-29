import { expect, test } from "@playwright/test";
import { lessons } from "../src/data/lessons";
import { quizzes } from "../src/data/quizzes";
import { stages } from "../src/data/stages";
import { LESSON_REWARD_EXP, QUIZ_CORRECT_REWARD_EXP } from "../src/lib/game";

// 不正解から再挑戦（testing.md のE2E 4）。
//
// 負けても進行不能にならないこと、
// 再挑戦で入るEXPが正解した分だけであることを確かめる。
// 間違いに強いペナルティを設けない方針（PRD「8. RPGシステム」）の裏づけになる。

const stage = stages.find((candidate) => candidate.id === "sumo-stable")!;
const stageLesson = lessons.find((lesson) => lesson.stageId === stage.id)!;
const stageQuizzes = quizzes.filter((quiz) => quiz.stageId === stage.id);

test.describe("不正解から再挑戦", () => {
  test("全問まちがえても、やり直して勝ち越せる", async ({ page }) => {
    test.slow();

    await page.goto("./");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();

    await page.getByRole("link", { name: /すもう部屋/ }).click();
    for (let i = 0; i < stageLesson.messages.length - 1; i += 1) {
      await page.getByRole("button", { name: "つぎへ" }).click();
    }
    await page.getByRole("button", { name: "よみおわった" }).click();
    await page.getByRole("link", { name: "取組へ" }).click();

    // 1周目：すべて誤答する。
    for (const [index, quiz] of stageQuizzes.entries()) {
      const wrong = quiz.choices.find(
        (choice) => choice.id !== quiz.correctChoiceId,
      );
      await page.getByRole("button", { name: wrong?.label }).click();
      await expect(page.getByRole("status")).toContainText("まちがい");
      await page
        .getByRole("button", {
          name: index === stageQuizzes.length - 1 ? "けっかへ" : "つぎの問題へ",
        })
        .click();
    }

    // 負け越しても行き止まりにならず、再挑戦の導線が出る。
    await expect(page.getByRole("status")).toContainText("まけこし");
    await expect(page.getByRole("region", { name: "成績" })).toContainText(
      `0 / ${stageQuizzes.length}`,
    );
    await expect(
      page.getByRole("region", { name: "あたらしい場所" }),
    ).toHaveCount(0);

    // 2周目：すべて正解する。
    await page.getByRole("link", { name: "もういちど挑戦する" }).click();
    for (const [index, quiz] of stageQuizzes.entries()) {
      const correct = quiz.choices.find(
        (choice) => choice.id === quiz.correctChoiceId,
      );
      await page.getByRole("button", { name: correct?.label }).click();
      await expect(page.getByRole("status")).toContainText("せいかい");
      await page
        .getByRole("button", {
          name: index === stageQuizzes.length - 1 ? "けっかへ" : "つぎの問題へ",
        })
        .click();
    }

    await expect(page.getByRole("status")).toContainText("かちこし");
    await expect(
      page.getByRole("region", { name: "あたらしい場所" }),
    ).toContainText("土俵");

    // 誤答に罰は無く、EXPは学習と正解とクリアの合計になる。
    const expected =
      LESSON_REWARD_EXP +
      stageQuizzes.length * QUIZ_CORRECT_REWARD_EXP +
      stage.clearRewardExp;
    await page.getByRole("link", { name: "マップへもどる" }).click();
    await expect(
      page.getByText(String(expected), { exact: true }),
    ).toBeVisible();
  });
});
