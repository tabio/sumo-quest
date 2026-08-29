import type { ReactNode } from "react";
import { SaveStatusNotice } from "./SaveStatusNotice";
import styles from "./GameShell.module.css";

type GameShellProps = {
  /** 画面名。省略した場合は見出しを描画しない。 */
  title?: string;
  children: ReactNode;
};

/**
 * 全画面共通の外枠。
 * 画面幅の上限と余白をここで一元化し、各ページはレイアウトを持たない。
 *
 * 保存できていないことの通知もここに置く。
 * 画面ごとに書くと出し忘れが生まれるため（P4-7）。
 */
export function GameShell({ title, children }: GameShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.inner}>
        {title ? <h1 className={styles.title}>{title}</h1> : null}
        <SaveStatusNotice />
        {children}
      </div>
    </div>
  );
}
