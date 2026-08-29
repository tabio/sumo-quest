import type { Lesson, Npc, Quiz, Stage, Technique, Term } from "@/types/game";

// コンテンツデータの整合検証（P2-12）。
//
// testing.md「コンテンツ確認」のうち、機械で確かめられる項目をここに集約する。
// 文章の正確性と読みやすさは人手での校正（P4-10）に委ねる。
//
// 検証の規則はこのファイルだけを正とする。
// 単体テストとビルド前チェック（scripts/validate-content.mjs）の双方が
// ここを呼ぶため、片方だけ緩んでいる状態を作らない。
//
// データは引数で受け取る。
// ビルド前チェックは Node から直接この関数を呼ぶため、
// パスエイリアス（@/）を伴う実行時の import をこのファイルに持たせない。

export type ContentBundle = {
  stages: Stage[];
  lessons: Lesson[];
  quizzes: Quiz[];
  techniques: Technique[];
  terms: Term[];
  npcs: Npc[];
};

/** 選択肢の個数の上下限。設計書「6.5 取組」。 */
const MIN_CHOICES = 2;
const MAX_CHOICES = 4;

function idSet(items: { id: string }[]): Set<string> {
  return new Set(items.map((item) => item.id));
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const found = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) found.add(value);
    seen.add(value);
  }
  return [...found];
}

function isBlank(value: string): boolean {
  return value.trim() === "";
}

/**
 * データの問題を1件1文で返す。
 * 空配列なら健全。最初の1件で打ち切らず、直せる分をまとめて出す。
 */
export function collectContentProblems(bundle: ContentBundle): string[] {
  const { stages, lessons, quizzes, techniques, terms, npcs } = bundle;
  const problems: string[] = [];

  const stageIds = idSet(stages);
  const lessonIds = idSet(lessons);
  const quizIds = idSet(quizzes);
  const techniqueIds = idSet(techniques);
  const termIds = idSet(terms);
  const npcIds = idSet(npcs);

  const dataSets = [
    { name: "stages", items: stages },
    { name: "lessons", items: lessons },
    { name: "quizzes", items: quizzes },
    { name: "techniques", items: techniques },
    { name: "terms", items: terms },
    { name: "npcs", items: npcs },
  ];

  for (const { name, items } of dataSets) {
    for (const id of duplicates(items.map((item) => item.id))) {
      problems.push(`${name}: IDが重複している（${id}）`);
    }
  }

  // ステージ。
  const orders = stages.map((stage) => stage.order).sort((a, b) => a - b);
  const expectedOrders = stages.map((_, index) => index + 1);
  if (orders.join(",") !== expectedOrders.join(",")) {
    problems.push(
      `stages: order が1からの連番になっていない（${orders.join(", ")}）`,
    );
  }

  // 解放は一本道とする（設計書「7. ゲーム進行ルール」）。
  // 途中が切れると、そこから先へ進めないセーブができあがる。
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  for (const [index, stage] of ordered.entries()) {
    const expected =
      index === ordered.length - 1 ? undefined : ordered[index + 1].id;
    if (stage.unlocks !== expected) {
      problems.push(
        `stage ${stage.id}: 解放先が順番どおりでない（${stage.unlocks ?? "なし"} / 期待は ${expected ?? "なし"}）`,
      );
    }
  }

  for (const stage of stages) {
    if (!npcIds.has(stage.npcId)) {
      problems.push(
        `stage ${stage.id}: 参照するNPCが存在しない（${stage.npcId}）`,
      );
    }

    if (stage.passRate <= 0 || stage.passRate > 1) {
      problems.push(
        `stage ${stage.id}: 合格率が0より大きく1以下でない（${stage.passRate}）`,
      );
    }

    if (stage.unlocks !== undefined && !stageIds.has(stage.unlocks)) {
      problems.push(
        `stage ${stage.id}: 解放先のステージが存在しない（${stage.unlocks}）`,
      );
    }

    for (const lessonId of stage.lessonIds) {
      if (!lessonIds.has(lessonId)) {
        problems.push(
          `stage ${stage.id}: 参照する学習が存在しない（${lessonId}）`,
        );
        continue;
      }
      const lesson = lessons.find((item) => item.id === lessonId);
      if (lesson && lesson.stageId !== stage.id) {
        problems.push(
          `stage ${stage.id}: 学習 ${lessonId} が別のステージ（${lesson.stageId}）に属している`,
        );
      }
    }

    for (const quizId of stage.quizIds) {
      if (!quizIds.has(quizId)) {
        problems.push(
          `stage ${stage.id}: 参照するクイズが存在しない（${quizId}）`,
        );
        continue;
      }
      const quiz = quizzes.find((item) => item.id === quizId);
      if (quiz && quiz.stageId !== stage.id) {
        problems.push(
          `stage ${stage.id}: クイズ ${quizId} が別のステージ（${quiz.stageId}）に属している`,
        );
      }
    }
  }

  // 学習。
  for (const lesson of lessons) {
    if (!stageIds.has(lesson.stageId)) {
      problems.push(
        `lesson ${lesson.id}: 所属するステージが存在しない（${lesson.stageId}）`,
      );
    }

    if (!npcIds.has(lesson.speakerId)) {
      problems.push(
        `lesson ${lesson.id}: 話者が存在しない（${lesson.speakerId}）`,
      );
    }

    if (lesson.messages.length === 0) {
      problems.push(`lesson ${lesson.id}: メッセージが1件もない`);
    }

    if (lesson.messages.some((message) => isBlank(message.text))) {
      problems.push(`lesson ${lesson.id}: 空のメッセージがある`);
    }

    for (const termId of lesson.discoverTermIds ?? []) {
      if (!termIds.has(termId)) {
        problems.push(
          `lesson ${lesson.id}: 参照する用語が存在しない（${termId}）`,
        );
      }
    }

    for (const techniqueId of lesson.unlockTechniqueIds ?? []) {
      if (!techniqueIds.has(techniqueId)) {
        problems.push(
          `lesson ${lesson.id}: 参照する技が存在しない（${techniqueId}）`,
        );
      }
    }
  }

  // クイズ。
  for (const quiz of quizzes) {
    if (!stageIds.has(quiz.stageId)) {
      problems.push(
        `quiz ${quiz.id}: 所属するステージが存在しない（${quiz.stageId}）`,
      );
    }

    const matched = quiz.choices.filter(
      (choice) => choice.id === quiz.correctChoiceId,
    );
    if (matched.length !== 1) {
      problems.push(
        `quiz ${quiz.id}: 正解の選択肢がちょうど一つでない（${matched.length}件）`,
      );
    }

    if (
      quiz.choices.length < MIN_CHOICES ||
      quiz.choices.length > MAX_CHOICES
    ) {
      problems.push(
        `quiz ${quiz.id}: 選択肢が${MIN_CHOICES}〜${MAX_CHOICES}個でない（${quiz.choices.length}個）`,
      );
    }

    for (const id of duplicates(quiz.choices.map((choice) => choice.id))) {
      problems.push(`quiz ${quiz.id}: 選択肢IDが重複している（${id}）`);
    }

    for (const label of duplicates(
      quiz.choices.map((choice) => choice.label),
    )) {
      problems.push(`quiz ${quiz.id}: 選択肢の表示が重複している（${label}）`);
    }

    if (isBlank(quiz.explanation)) {
      // 不正解のまま進ませないため、解説は必須とする（設計書「6.5」）。
      problems.push(`quiz ${quiz.id}: 解説がない`);
    }

    for (const termId of quiz.termIds ?? []) {
      if (!termIds.has(termId)) {
        problems.push(`quiz ${quiz.id}: 参照する用語が存在しない（${termId}）`);
      }
    }

    if (quiz.techniqueId !== undefined && !techniqueIds.has(quiz.techniqueId)) {
      problems.push(
        `quiz ${quiz.id}: 参照する技が存在しない（${quiz.techniqueId}）`,
      );
    }
  }

  // 用語と技。図鑑と辞典が空欄を出さないようにする。
  for (const term of terms) {
    if (
      isBlank(term.name) ||
      isBlank(term.reading) ||
      isBlank(term.description)
    ) {
      problems.push(`term ${term.id}: 名前・読み・説明のいずれかが空`);
    }
  }

  for (const technique of techniques) {
    if (
      isBlank(technique.name) ||
      isBlank(technique.reading) ||
      isBlank(technique.description)
    ) {
      problems.push(
        `technique ${technique.id}: 名前・読み・説明のいずれかが空`,
      );
    }

    // 技図鑑が難易度を出すため、範囲外の値で表示が崩れないようにする（ADR-0006）。
    if (![1, 2, 3].includes(technique.difficulty)) {
      problems.push(
        `technique ${technique.id}: 難易度が1〜3でない（${technique.difficulty}）`,
      );
    }
  }

  return problems;
}
