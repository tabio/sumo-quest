"use client";

import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { findTechnique, findTerm } from "@/lib/content";
import styles from "./DiscoveryToast.module.css";

// 技の習得と用語の発見を知らせる（P2-8）。
//
// 学習の完了と取組の終了の双方から使う。
// 何を覚えたのかを名前で出す。「おぼえた」とだけ言われても、
// 図鑑を開くまで何が増えたのか分からないため。
//
// 時間で自動的に消さない。
// 読み切る前に消えると、覚えた実感が残らないうえ、
// 読み上げの利用者が内容を追えない（設計書「15.」）。

type DiscoveryToastProps = {
  /** 新しく習得した技のID。 */
  techniqueIds: string[];
  /** 新しく発見した用語のID。 */
  termIds: string[];
  /** 閉じる操作。省略すると閉じるボタンを出さない。 */
  onClose?: () => void;
  /**
   * 読み上げに変化として伝えるか。
   * 画面の途中で現れる場合は true、最初から載っている場合は false にする。
   * 静的な内容に role="status" を付けると、画面内の他の通知と紛れる。
   */
  announce?: boolean;
};

export function DiscoveryToast({
  techniqueIds,
  termIds,
  onClose,
  announce = true,
}: DiscoveryToastProps) {
  // 何も増えていない場合は出さない。空の枠だけが残るのを避ける。
  if (techniqueIds.length === 0 && termIds.length === 0) return null;

  return (
    <PixelWindow heading="おぼえたこと">
      <div role={announce ? "status" : undefined}>
        <p className={styles.lead}>あたらしく おぼえた。</p>
        <ul className={styles.list}>
          {techniqueIds.map((id) => (
            <li key={id} className={styles.item}>
              <span className={styles.kind}>わざ</span>
              <span>{findTechnique(id)?.name ?? id}</span>
            </li>
          ))}
          {termIds.map((id) => (
            <li key={id} className={styles.item}>
              <span className={styles.kind}>ことば</span>
              <span>{findTerm(id)?.name ?? id}</span>
            </li>
          ))}
        </ul>
      </div>

      {onClose ? (
        <div className={styles.actions}>
          <PixelButton onClick={onClose}>とじる</PixelButton>
        </div>
      ) : null}
    </PixelWindow>
  );
}
