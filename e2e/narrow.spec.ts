import { expect, test, type Page } from "@playwright/test";
import { lessons } from "../src/data/lessons";
import { quizzes } from "../src/data/quizzes";

// 基準幅320pxでの表示（P4-4／testing.md のE2E 5）。
//
// 対応端末の下限。ここで横スクロールが出なければ、広い画面でも出ない。
// 画面ごとに見るのは、枠や余白の指定が画面単位で入るためである。

const stage1Lesson = lessons.find(
  (lesson) => lesson.stageId === "sumo-stable",
)!;
const stage1Quizzes = quizzes.filter((quiz) => quiz.stageId === "sumo-stable");

/** 横スクロールが出ていないことを確かめる。 */
async function expectNoHorizontalScroll(page: Page, where: string) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(
    overflow.scrollWidth,
    `${where} で横スクロールが出ている`,
  ).toBeLessThanOrEqual(overflow.clientWidth);
}

/** 操作要素が44×44px以上あることを確かめる（P4-2）。 */
async function expectTappable(page: Page, where: string) {
  const tooSmall = await page.evaluate(() => {
    const targets = document.querySelectorAll("a, button:not(:disabled)");
    return [...targets]
      .map((element) => {
        const box = element.getBoundingClientRect();
        return { text: element.textContent?.trim() ?? "", ...box.toJSON() };
      })
      .filter((box) => box.width > 0 && (box.height < 44 || box.width < 44))
      .map(
        (box) =>
          `${box.text}（${Math.round(box.width)}×${Math.round(box.height)}）`,
      );
  });
  expect(tooSmall, `${where} に小さすぎる操作要素がある`).toEqual([]);
}

async function check(page: Page, where: string) {
  await expectNoHorizontalScroll(page, where);
  await expectTappable(page, where);
}

test.describe("320px幅での表示", () => {
  test("主要な画面が横スクロールなしで収まる", async ({ page }) => {
    test.slow();

    await page.goto("./");
    await expect(
      page.getByRole("heading", { level: 1, name: "SUMO QUEST" }),
    ).toBeVisible();
    await check(page, "タイトル");

    await page.getByRole("link", { name: "はじめから" }).click();
    await check(page, "名前入力");

    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");
    await check(page, "マップ");

    await page.getByRole("link", { name: /すもう部屋/ }).click();
    await check(page, "学習");

    // 途中で抜ける導線は、確認を開いた状態でも収まる必要がある（ADR-0008）。
    await page.getByRole("button", { name: "やめる" }).click();
    await check(page, "中断の確認");
    await page.getByRole("button", { name: "つづける" }).click();

    for (let i = 0; i < stage1Lesson.messages.length - 1; i += 1) {
      await page.getByRole("button", { name: "つぎへ" }).click();
    }
    await page.getByRole("button", { name: "よみおわった" }).click();
    await check(page, "学習おわり");

    await page.getByRole("link", { name: "取組へ" }).click();
    await check(page, "取組");

    for (const [index, quiz] of stage1Quizzes.entries()) {
      const correct = quiz.choices.find(
        (choice) => choice.id === quiz.correctChoiceId,
      );
      await page.getByRole("button", { name: correct?.label }).click();
      if (index === 0) await check(page, "取組の解説");
      await page
        .getByRole("button", {
          name:
            index === stage1Quizzes.length - 1 ? "けっかへ" : "つぎの問題へ",
        })
        .click();
    }
    await check(page, "けっか");

    await page.getByRole("link", { name: "マップへもどる" }).click();
    await page.getByRole("link", { name: "わざずかん" }).click();
    await check(page, "わざずかん");

    await page.getByRole("link", { name: "マップへもどる" }).click();
    await page.getByRole("link", { name: "すもうじてん" }).click();
    await check(page, "すもうじてん");

    await page.getByRole("link", { name: "マップへもどる" }).click();
    await page.getByRole("link", { name: "ステータス" }).click();
    await check(page, "ステータス");
  });
});
