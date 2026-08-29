import { expect, test, type Page } from "@playwright/test";
import { lessons } from "../src/data/lessons";
import { quizzes } from "../src/data/quizzes";
import { stages } from "../src/data/stages";
import { LESSON_REWARD_EXP, QUIZ_CORRECT_REWARD_EXP } from "../src/lib/game";

// E2E 1本目：新規開始 → STAGE 1 クリア。
// testing.md のとおり Phase 1 の完了ゲートに含める。
// Phase 2 の汎用化リファクタで STAGE 1 が壊れたことを即座に検知するため（R-2）。
//
// goto に渡すパスは baseURL からの相対で書く。
// baseURL には basePath が含まれるため（playwright.config.ts）、
// 先頭スラッシュで書くと basePath を外れて404になる。

const SAVE_KEY = "sumo-quest:save";

const stage1 = stages.find((stage) => stage.id === "sumo-stable")!;
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

/**
 * 指定した問だけ誤答し、残りは正解する。
 * 誤答の選択肢はコンテンツデータから引くため、選択肢の並びに依存しない。
 */
async function answerWithMistakeAt(page: Page, wrongIndex: number) {
  for (const [index, quiz] of stage1Quizzes.entries()) {
    await expect(page.getByText(quiz.question)).toBeVisible();

    const isWrong = index === wrongIndex;
    const choice = quiz.choices.find((candidate) =>
      isWrong
        ? candidate.id !== quiz.correctChoiceId
        : candidate.id === quiz.correctChoiceId,
    );
    await page.getByRole("button", { name: choice?.label }).click();

    // 正誤がどちらでも、判定と解説の両方が出る。
    await expect(page.getByRole("status")).toContainText(
      isWrong ? "まちがい" : "せいかい",
    );
    await expect(page.getByText(quiz.explanation)).toBeVisible();

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
    await page.goto("./");

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
    await page.goto("./");
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

  // 完了ゲートの「取組で正解・不正解の双方を体験できる」に対応する。
  // 誤答しても進めること、加点が正解した分だけであることを、
  // 配信と同じ静的エクスポートの上で確認する。
  test("誤答しても解説を読んで先へ進め、正解した分だけEXPが入る", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();

    await page.getByRole("link", { name: /すもう部屋/ }).click();
    await readLesson(page);
    await page.getByRole("link", { name: "取組へ" }).click();

    // 1問目だけ誤答する。合格率は 0.6 のため、これでも勝ち越す。
    await answerWithMistakeAt(page, 0);

    const correctCount = stage1Quizzes.length - 1;
    await expect(page.getByRole("status")).toContainText("かちこし");
    await expect(page.getByRole("region", { name: "成績" })).toContainText(
      `${correctCount} / ${stage1Quizzes.length}`,
    );

    // 誤答した1問分は加点されない。数値はコンテンツデータから導く。
    const total =
      LESSON_REWARD_EXP +
      correctCount * QUIZ_CORRECT_REWARD_EXP +
      stage1.clearRewardExp;

    await page.getByRole("link", { name: "マップへもどる" }).click();
    // 同じ数字が「つぎの番付まであとNEXP」にも出るため、EXPの値だけを見る。
    await expect(page.getByText(String(total), { exact: true })).toBeVisible();
  });

  // 学習を通らずに取組へ入る経路。ルートガードは解放済みなら通す。
  // この経路でも、取組で出会った用語が記録されることを確かめる（P2-8）。
  test("学習をとばして取組へ入っても、出会った用語が記録される", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");

    await page.goto("battle/sumo-stable/");
    await answerAllCorrectly(page);

    // クイズが扱う用語は、学習を経ていなくても発見済みになる。
    const learned = page.getByRole("region", { name: "おぼえたこと" });
    await expect(learned).toContainText("土俵");
    await expect(learned).toContainText("まわし");
  });

  // エンディングは最終試験のクリアからのみ到達する（P3-4）。
  test("最終試験の前にエンディングへ直接来るとマップへ戻される", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");

    await page.goto("ending/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");
  });

  // 図鑑と辞典はタイトルからの導線に含まれる（PRD「12. 主要画面」）。
  test("セーブがなくても図鑑と辞典を開ける", async ({ page }) => {
    await page.goto("./");

    await page.getByRole("link", { name: "わざずかん" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "わざずかん",
    );
    await page.getByRole("link", { name: "タイトルへもどる" }).click();

    await page.getByRole("link", { name: "すもうじてん" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "すもうじてん",
    );
    await expect(
      page.getByRole("region", { name: "まだ何もない" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "タイトルへもどる" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "SUMO QUEST" }),
    ).toBeVisible();
  });

  test("セーブがない状態でマップへ直接来るとタイトルへ戻される", async ({
    page,
  }) => {
    await page.goto("map/");
    await expect(
      page.getByRole("heading", { level: 1, name: "SUMO QUEST" }),
    ).toBeVisible();
  });

  test("未解放のステージへ直接来るとマップへ戻される", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("link", { name: "はじめから" }).click();
    await page.getByLabel("あなたのしこ名は？").fill("ちからまる");
    await page.getByRole("button", { name: "けってい" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");

    await page.goto("stage/kokugikan/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("マップ");
  });

  test("保存が壊れていても消さず、案内を出す", async ({ page }) => {
    await page.goto("./");
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
