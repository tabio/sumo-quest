import { expect, test, type Page } from "@playwright/test";
import { lessons } from "../src/data/lessons";
import { quizzes } from "../src/data/quizzes";
import { stages } from "../src/data/stages";
import { techniques } from "../src/data/techniques";
import { terms } from "../src/data/terms";
import { LESSON_REWARD_EXP, QUIZ_CORRECT_REWARD_EXP } from "../src/lib/game";
import { ranks } from "../src/data/ranks";

// Phase 2 の完了ゲート「STAGE 1〜5が順番に解放され、通しでプレイできる」。
//
// testing.md のE2E 3（全6ステージと横綱到達）は Phase 3〜4 の範囲だが、
// 5ステージ分の解放の連鎖はこのフェーズで成立していなければならない。
// 汎用化した画面が、データを足しただけのステージでも動くことの確認でもある。
//
// goto に渡すパスは baseURL からの相対で書く（playwright.config.ts）。

/** 中身が入っているステージを、解放される順に並べる。 */
const playable = [...stages]
  .sort((a, b) => a.order - b.order)
  .filter((stage) => stage.lessonIds.length > 0 && stage.quizIds.length > 0);

function lessonOf(stageId: string) {
  return lessons.find((lesson) => lesson.stageId === stageId)!;
}

function quizzesOf(stageId: string) {
  return quizzes.filter((quiz) => quiz.stageId === stageId);
}

/** 学習を最後まで読み進める。 */
async function readLesson(page: Page, stageId: string) {
  const messages = lessonOf(stageId).messages;
  for (let i = 0; i < messages.length - 1; i += 1) {
    await page.getByRole("button", { name: "つぎへ" }).click();
  }
  await page.getByRole("button", { name: "よみおわった" }).click();
}

/** すべての問題に正解する。 */
async function answerAllCorrectly(page: Page, stageId: string) {
  const stageQuizzes = quizzesOf(stageId);
  for (const [index, quiz] of stageQuizzes.entries()) {
    await expect(page.getByText(quiz.question)).toBeVisible();

    const correct = quiz.choices.find(
      (choice) => choice.id === quiz.correctChoiceId,
    );
    await page.getByRole("button", { name: correct?.label }).click();
    await expect(page.getByRole("status")).toContainText("せいかい");

    const isLast = index === stageQuizzes.length - 1;
    await page
      .getByRole("button", { name: isLast ? "けっかへ" : "つぎの問題へ" })
      .click();
  }
}

/** マップから1ステージ分を通す。 */
async function clearStage(page: Page, stageId: string, stageName: string) {
  await page.getByRole("link", { name: new RegExp(stageName) }).click();
  await readLesson(page, stageId);
  await page.getByRole("link", { name: "取組へ" }).click();
  await answerAllCorrectly(page, stageId);
  await expect(page.getByRole("status")).toContainText("かちこし");
  await page.getByRole("link", { name: "マップへもどる" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");
}

test.describe("STAGE 1〜5の通しプレイ", () => {
  test("順番に解放され、図鑑と辞典が進行に追いつく", async ({ page }) => {
    test.slow();

    await page.goto("./");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");

    for (const stage of playable) {
      // 順番が来るまで、その地点へは入れない。
      await expect(
        page.getByRole("link", { name: new RegExp(stage.name) }),
      ).toBeVisible();
      await clearStage(page, stage.id, stage.name);
    }

    // 5地点すべてがクリア済みになり、最後の地点が解放される。
    await expect(page.getByText("クリア済み")).toHaveCount(playable.length);
    await expect(page.getByRole("link", { name: /横綱の城/ })).toBeVisible();

    // EXPは、学習・正解・クリアの合計になる。
    const expected = playable.reduce(
      (total, stage) =>
        total +
        LESSON_REWARD_EXP +
        quizzesOf(stage.id).length * QUIZ_CORRECT_REWARD_EXP +
        stage.clearRewardExp,
      0,
    );
    await expect(page.getByText(String(expected))).toBeVisible();

    // 図鑑：学習で6種すべてを覚えている。
    await page.getByRole("link", { name: "わざずかん" }).click();
    await expect(
      page.getByText(`${techniques.length} のうち ${techniques.length}`),
    ).toBeVisible();
    await expect(page.getByText("？？？")).toHaveCount(0);
    await page.getByRole("link", { name: "マップへもどる" }).click();

    // 辞典：STAGE 1〜5 で出会う用語がすべて載る。
    await page.getByRole("link", { name: "すもうじてん" }).click();
    await expect(
      page.getByText(`${terms.length} のことばに出会った`),
    ).toBeVisible();
    await page.getByRole("link", { name: "マップへもどる" }).click();

    // ステータス：番付がEXPどおりに上がっている。
    await page.getByRole("link", { name: "ステータス" }).click();
    const rank = [...ranks]
      .filter((candidate) => !candidate.requiresFinalExam)
      .sort((a, b) => a.requiredExperience - b.requiredExperience)
      .filter((candidate) => candidate.requiredExperience <= expected)
      .at(-1)!;
    await expect(page.getByText(rank.name)).toBeVisible();
    await expect(
      page.getByText(`${stages.length} のうち ${playable.length}`),
    ).toBeVisible();
  });
});
