import Image from "next/image";
import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { imagePath } from "@/lib/imagePath";
import styles from "./page.module.css";

// Phase 0 の完了ゲート確認用のダミーページ。
// タイトル画面の実装は P1-2 で行う。
export default function Home() {
  return (
    <GameShell title="SUMO QUEST">
      <PixelWindow heading="ようこそ">
        <div className={styles.talk}>
          {/* 素材が揃うまでの暫定画像（R-5）。 */}
          <Image
            className={styles.portrait}
            src={imagePath("characters/placeholder.png")}
            alt="親方"
            width={64}
            height={64}
          />
          <div>
            <p>ここは土俵への入り口だ。</p>
            <p>準備が整うまで、しばらく待たれよ。</p>
          </div>
        </div>
      </PixelWindow>

      <PixelWindow>
        <div className={styles.actions}>
          <PixelButton variant="primary">はじめから</PixelButton>
          <PixelButton disabled>つづきから</PixelButton>
          <PixelButton selected>技図鑑</PixelButton>
        </div>
        <p className={styles.note}>
          ボタンは表示確認用のため、まだ動作しない。
        </p>
      </PixelWindow>
    </GameShell>
  );
}
