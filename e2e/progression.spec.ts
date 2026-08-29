import { expect, test, type Page } from "@playwright/test";
import { lessons } from "../src/data/lessons";
import { quizzes } from "../src/data/quizzes";
import { stages } from "../src/data/stages";
import { techniques } from "../src/data/techniques";
import { terms } from "../src/data/terms";
import { LESSON_REWARD_EXP, QUIZ_CORRECT_REWARD_EXP } from "../src/lib/game";
import { ranks } from "../src/data/ranks";

// 全ステージの通しプレイ。
//
// Phase 2 の完了ゲート「STAGE 1〜5が順番に解放され、通しでプレイできる」と、
// Phase 3 の完了ゲート「新規開始から横綱到達まで、通しでプレイできる」を兼ねる。
// 対象はコンテンツが入っているステージすべてで、データから決める。
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

/** 最終試験のリザルトから、エンディングを見てマップへ戻る。 */
async function seeEnding(page: Page) {
  await page.getByRole("link", { name: "エンディングへ" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "エンディング",
  );
  await expect(page.getByRole("status")).toContainText("横綱 になった");
  await page.getByRole("link", { name: "マップへもどる" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");
}

test.describe("全ステージの通しプレイ", () => {
  test("順番に解放され、横綱まで到達できる", async ({ page }) => {
    test.slow();

    await page.goto("./");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");

    for (const [index, stage] of playable.entries()) {
      // 順番が来るまで、その地点へは入れない。
      await expect(
        page.getByRole("link", { name: new RegExp(stage.name) }),
      ).toBeVisible();

      const isFinal = index === playable.length - 1;
      if (isFinal) {
        // 最終試験のリザルトからだけ、エンディングへ進める（P3-4）。
        await page.getByRole("link", { name: new RegExp(stage.name) }).click();
        await readLesson(page, stage.id);
        await page.getByRole("link", { name: "取組へ" }).click();
        await answerAllCorrectly(page, stage.id);
        await expect(page.getByRole("status")).toContainText("かちこし");
        await seeEnding(page);
      } else {
        await clearStage(page, stage.id, stage.name);
      }
    }

    // 中身のある地点がすべてクリア済みになる。
    await expect(page.getByText("クリア済み")).toHaveCount(playable.length);

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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "わざずかん",
    );
    await expect(
      page.getByText(`${techniques.length} のうち ${techniques.length}`),
    ).toBeVisible();
    await expect(page.getByText("？？？")).toHaveCount(0);
    await page.getByRole("link", { name: "マップへもどる" }).click();

    // 辞典：STAGE 1〜5 で出会う用語がすべて載る。
    await page.getByRole("link", { name: "すもうじてん" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "すもうじてん",
    );
    await expect(
      page.getByText(`${terms.length} のことばに出会った`),
    ).toBeVisible();
    await page.getByRole("link", { name: "マップへもどる" }).click();

    // ステータス：最終試験をクリアしたので横綱になっている。
    await page.getByRole("link", { name: "ステータス" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "ステータス",
    );
    const yokozuna = ranks.find((rank) => rank.requiresFinalExam)!;
    await expect(page.getByText(yokozuna.name, { exact: true })).toBeVisible();
    await expect(page.getByText("これより上はない")).toBeVisible();
    // 「6 のうち 6」はわざの行にも出るため、クリアの行に絞る。
    await expect(
      page
        .getByRole("region", { name: "あつめたもの" })
        .locator("div")
        .filter({ hasText: "クリア" }),
    ).toContainText(`${stages.length} のうち ${playable.length}`);
  });
});
