"use client";

import Image from "next/image";
import { useState } from "react";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { findNpc } from "@/lib/content";
import { imagePath } from "@/lib/imagePath";
import type { Lesson } from "@/types/game";
import styles from "./LessonPlayer.module.css";

// 学習パート。設計書「6.4 学習」。
//
// 1画面1メッセージで進める。
// ページを開いただけでは完了扱いにせず、最後まで進んだ時点で onComplete を呼ぶ。

type LessonPlayerProps = {
  lesson: Lesson;
  /** 最後のメッセージまで進んだときに1度だけ呼ばれる。 */
  onComplete: () => void;
  /** 学習を終えたあとの導線。 */
  children?: React.ReactNode;
};

export function LessonPlayer({
  lesson,
  onComplete,
  children,
}: LessonPlayerProps) {
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const speaker = findNpc(lesson.speakerId);
  const total = lesson.messages.length;
  const isLast = index === total - 1;

  function goNext() {
    if (isLast) {
      if (!completed) {
        setCompleted(true);
        onComplete();
      }
      return;
    }
    setIndex((current) => current + 1);
  }

  return (
    <div className={styles.player}>
      <PixelWindow>
        <div className={styles.talk}>
          {speaker ? (
            <Image
              className={styles.portrait}
              src={imagePath(speaker.portraitPath)}
              alt=""
              width={64}
              height={64}
            />
          ) : null}
          <div className={styles.speech}>
            <p className={styles.speaker}>{speaker?.name ?? "？"}</p>
            {/* 差し替わる本文を読み上げに伝える。 */}
            <p className={styles.message} aria-live="polite">
              {lesson.messages[index]}
            </p>
          </div>
        </div>

        <p className={styles.progress}>
          {index + 1} / {total}
        </p>

        <div className={styles.actions}>
          <PixelButton
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0}
          >
            もどる
          </PixelButton>
          <PixelButton
            variant="primary"
            onClick={goNext}
            disabled={completed && isLast}
          >
            {isLast ? "よみおわった" : "つぎへ"}
          </PixelButton>
        </div>
      </PixelWindow>

      {completed ? (
        <PixelWindow heading="学習おわり">
          {(lesson.discoverTermIds?.length ?? 0) > 0 ||
          (lesson.unlockTechniqueIds?.length ?? 0) > 0 ? (
            <p className={styles.discovered} role="status">
              あたらしい ことばと わざを おぼえた。
            </p>
          ) : null}
          {children}
        </PixelWindow>
      ) : null}
    </div>
  );
}
