"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelLink } from "@/components/ui/PixelLink";
import { techniques } from "@/data/techniques";
import { useGame } from "@/hooks/useGame";
import styles from "./page.module.css";

// 技図鑑。設計書「4. URL・画面一覧」／PRD「9. コレクション」。
//
// 未習得の技も件数だけは見せる。
// 「あと何が残っているか」が分かるほうが、稽古に戻る動機になる（P2-9）。
// 名前と説明は伏せ、難易度だけを出す。
//
// セーブがなくても開ける。タイトルからの導線に含まれるため（PRD「12. 主要画面」）。
// 何も習得していない状態として、すべて伏せた一覧を出す。

/** 難易度を記号の数で表す。色に頼らずに強弱を示すため（設計書「15.」）。 */
function difficultyMark(difficulty: number): string {
  return "★".repeat(difficulty) + "☆".repeat(3 - difficulty);
}

export default function TechniquesPage() {
  const { isReady, state, hasSave } = useGame();

  if (!isReady) {
    return (
      <GameShell title="わざずかん">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  const learned = new Set(state.save?.learnedTechniqueIds ?? []);

  return (
    <GameShell title="わざずかん">
      <PixelWindow>
        <p className={styles.count}>
          {techniques.length} のうち {learned.size} をおぼえた
        </p>
      </PixelWindow>

      <PixelWindow heading="決まり手">
        <ul className={styles.list}>
          {techniques.map((technique) => {
            const known = learned.has(technique.id);
            return (
              <li
                key={technique.id}
                className={[styles.entry, known ? "" : styles.unknown]
                  .filter(Boolean)
                  .join(" ")}
              >
                <p className={styles.name}>
                  {known ? technique.name : "？？？"}
                  {known ? (
                    <span className={styles.reading}>{technique.reading}</span>
                  ) : null}
                </p>
                <p className={styles.difficulty}>
                  むずかしさ{" "}
                  <span aria-hidden="true">
                    {difficultyMark(technique.difficulty)}
                  </span>
                  <span className={styles.srOnly}>{technique.difficulty}</span>
                </p>
                <p className={styles.description}>
                  {known ? technique.description : "まだ おぼえていない。"}
                </p>
              </li>
            );
          })}
        </ul>
      </PixelWindow>

      <PixelWindow>
        {/* セーブがない状態ではマップへ入れないため、戻り先を出し分ける。 */}
        {hasSave ? (
          <PixelLink href="/map" variant="primary">
            マップへもどる
          </PixelLink>
        ) : (
          <PixelLink href="/" variant="primary">
            タイトルへもどる
          </PixelLink>
        )}
      </PixelWindow>
    </GameShell>
  );
}
