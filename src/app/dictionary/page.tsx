"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import { discoveredTerms } from "@/lib/content";
import styles from "./page.module.css";

// 相撲用語辞典。設計書「4. URL・画面一覧」／PRD「9. コレクション」。
//
// 出会った用語だけを載せる。
// 未発見のものは件数も出さない。技図鑑とちがい、
// 用語は「集める対象」ではなく「出会った記録」だからである。
//
// セーブがなくても開ける。タイトルからの導線に含まれるため（PRD「12. 主要画面」）。

export default function DictionaryPage() {
  const { isReady, state, hasSave } = useGame();

  if (!isReady) {
    return (
      <GameShell title="すもうじてん">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  const found = discoveredTerms(state.save?.discoveredTermIds ?? []);

  return (
    <GameShell title="すもうじてん">
      <PixelWindow>
        <p className={styles.count}>{found.length} のことばに出会った</p>
      </PixelWindow>

      {found.length === 0 ? (
        <PixelWindow heading="まだ何もない">
          <p>稽古に出れば、ことばが集まっていく。</p>
        </PixelWindow>
      ) : (
        <PixelWindow heading="出会ったことば">
          <dl className={styles.list}>
            {found.map((term) => (
              <div key={term.id} className={styles.entry}>
                <dt className={styles.name}>
                  {term.name}
                  <span className={styles.reading}>{term.reading}</span>
                </dt>
                <dd className={styles.description}>{term.description}</dd>
              </div>
            ))}
          </dl>
        </PixelWindow>
      )}

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
