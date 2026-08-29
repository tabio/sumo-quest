"use client";

import { useState } from "react";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { isCorrectChoice, type QuizResult } from "@/lib/game";
import type { Quiz } from "@/types/game";
import styles from "./BattleScene.module.css";

// 取組パート。設計書「6.5 取組」。
//
// 1問ずつ回答し、回答後に正誤と解説を出す。
// 全問終えたら結果を onFinish で返す。合否の判定と保存は呼び出し側が行う。

type BattleSceneProps = {
  quizzes: Quiz[];
  onFinish: (results: QuizResult[]) => void;
};

export function BattleScene({ quizzes, onFinish }: BattleSceneProps) {
  const [index, setIndex] = useState(0);
  const [answeredChoiceId, setAnsweredChoiceId] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);

  const quiz = quizzes[index];
  const total = quizzes.length;
  const isLast = index === total - 1;
  const correct =
    answeredChoiceId !== null && isCorrectChoice(quiz, answeredChoiceId);

  function answer(choiceId: string) {
    // 回答済みの問題を上書きしない。二重加点を防ぐ。
    if (answeredChoiceId !== null) return;
    setAnsweredChoiceId(choiceId);
    setResults((current) => [
      ...current,
      { quizId: quiz.id, correct: isCorrectChoice(quiz, choiceId) },
    ]);
  }

  function goNext() {
    if (isLast) {
      onFinish(results);
      return;
    }
    setIndex((current) => current + 1);
    setAnsweredChoiceId(null);
  }

  return (
    <div className={styles.scene}>
      <PixelWindow heading="取組">
        <p className={styles.progress}>
          {index + 1} 問目 / 全 {total} 問
        </p>
        <p className={styles.question}>{quiz.question}</p>

        <ul className={styles.choices}>
          {quiz.choices.map((choice) => (
            <li key={choice.id}>
              <PixelButton
                className={styles.choice}
                onClick={() => answer(choice.id)}
                disabled={answeredChoiceId !== null}
                selected={answeredChoiceId === choice.id}
              >
                {choice.label}
              </PixelButton>
            </li>
          ))}
        </ul>
      </PixelWindow>

      {answeredChoiceId !== null ? (
        <PixelWindow>
          <div
            className={[
              styles.feedback,
              correct ? styles.correct : styles.wrong,
            ].join(" ")}
            role="status"
          >
            <p className={styles.verdict}>
              {correct ? "◯ せいかい" : "× まちがい"}
            </p>
          </div>
          <p className={styles.explanation}>{quiz.explanation}</p>

          <div className={styles.actions}>
            <PixelButton variant="primary" onClick={goNext}>
              {isLast ? "けっかへ" : "つぎの問題へ"}
            </PixelButton>
          </div>
        </PixelWindow>
      ) : null}
    </div>
  );
}
