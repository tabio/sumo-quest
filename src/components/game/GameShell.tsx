import type { ReactNode } from "react";
import styles from "./GameShell.module.css";

type GameShellProps = {
  /** 画面名。省略した場合は見出しを描画しない。 */
  title?: string;
  children: ReactNode;
};

/**
 * 全画面共通の外枠。
 * 画面幅の上限と余白をここで一元化し、各ページはレイアウトを持たない。
 */
export function GameShell({ title, children }: GameShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.inner}>
        {title ? <h1 className={styles.title}>{title}</h1> : null}
        {children}
      </div>
    </div>
  );
}
