import type { Quiz } from "@/types/game";

// 並べ替えのユーティリティ。
//
// 乱数源を引数で受け取る。既定は Math.random だが、
// 渡せば戻り値が入力だけで決まり、テストで並びを固定できる。

/**
 * 配列をランダムに並べ替えた新しい配列を返す（Fisher-Yates）。
 * 元の配列は変更しない。
 */
export function shuffle<T>(
  items: T[],
  random: () => number = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 選択肢の並びをランダムにしたクイズを返す。
 *
 * 正解は correctChoiceId で持つため（設計書「8. データモデル」）、
 * 並べ替えても正誤判定と解説には影響しない。
 */
export function shuffleQuizChoices(
  quiz: Quiz,
  random: () => number = Math.random,
): Quiz {
  return { ...quiz, choices: shuffle(quiz.choices, random) };
}
