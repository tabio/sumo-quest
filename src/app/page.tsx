import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import styles from "./page.module.css";

// Phase 0 の完了ゲート確認用のダミーページ。
// タイトル画面の実装は P1-2 で行う。
export default function Home() {
  return (
    <GameShell title="SUMO QUEST">
      <PixelWindow heading="ようこそ">
        <p>ここは土俵への入り口だ。</p>
        <p>準備が整うまで、しばらく待たれよ。</p>
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
