"use client";

import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelLink } from "@/components/ui/PixelLink";
import buttonStyles from "@/components/ui/PixelButton.module.css";
import { kimarite, kimariteSource } from "@/data/kimarite";
import { kimariteCategories } from "@/data/kimariteCategories";
import { useGame } from "@/hooks/useGame";
import styles from "./page.module.css";

// 決まり手一覧（ADR-0012）。
//
// 日本相撲協会が定める決まり手八十二手と非技を、分類ごとに全件載せる。
// わざずかんとちがい、ゲームの進行には連動しない。
// 習得の記録ではなく、いつでも引ける参考資料として置くためである。
//
// 載せるのは名称・読み・分類という事実だけで、解説は協会のページへ案内する（ADR-0011）。
//
// セーブがなくても開ける。タイトルからの導線に含まれるため。

/** 分類ごとの掲載。データは不変なので、描画のたびに組み直さない。 */
const sections = [...kimariteCategories]
  .sort((a, b) => a.order - b.order)
  .map((category) => ({
    category,
    items: kimarite
      .filter((item) => item.categoryId === category.id)
      .sort((a, b) => a.order - b.order),
  }));

const techniqueCount = sections
  .filter(({ category }) => category.isTechnique)
  .reduce((sum, { items }) => sum + items.length, 0);
const nonTechniqueCount = kimarite.length - techniqueCount;

export default function KimaritePage() {
  const { isReady, hasSave } = useGame();

  if (!isReady) {
    return (
      <GameShell title="きまりていちらん">
        <PixelWindow>
          <p>よみこみちゅう...</p>
        </PixelWindow>
      </GameShell>
    );
  }

  return (
    <GameShell title="きまりていちらん">
      <PixelWindow>
        <p className={styles.count}>
          決まり手 {techniqueCount} ＋ 非技 {nonTechniqueCount}
        </p>
      </PixelWindow>

      {sections.map(({ category, items }) => (
        <PixelWindow
          key={category.id}
          heading={`${category.name}（${items.length}）`}
        >
          {category.isTechnique ? null : (
            <p className={styles.note}>
              技によらずに勝負がついたときの結果。決まり手には数えない。
            </p>
          )}
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.entry}>
                <span className={styles.name}>{item.name}</span>
                {/* 「とったり」のように名称がかなだけの技は、同じ文字を二度出さない。 */}
                {item.reading === item.name ? null : (
                  <span className={styles.reading}>{item.reading}</span>
                )}
              </li>
            ))}
          </ul>
        </PixelWindow>
      ))}

      <PixelWindow heading="出典">
        <p className={styles.note}>
          {kimariteSource.name}（{kimariteSource.retrievedAt} 時点）。
          技のくわしい解説は、協会のページで読める。
        </p>
        {/* 外部サイトのため next/link ではなく通常のリンクにし、basePath を付けない。 */}
        <a
          className={buttonStyles.button}
          href={kimariteSource.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          協会のページをひらく（別タブ）
        </a>
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
