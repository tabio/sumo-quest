import type { ReactNode } from "react";
import styles from "./PixelWindow.module.css";

type PixelWindowProps = {
  /** ウィンドウの見出し。省略した場合はただの枠として描画する。 */
  heading?: string;
  children: ReactNode;
};

/**
 * RPG風のメッセージウィンドウ枠。
 * 見出しを渡した場合は section として領域名を持たせ、支援技術から辿れるようにする。
 */
export function PixelWindow({ heading, children }: PixelWindowProps) {
  if (!heading) {
    return <div className={styles.window}>{children}</div>;
  }

  return (
    <section className={styles.window} aria-label={heading}>
      <h2 className={styles.heading}>{heading}</h2>
      {children}
    </section>
  );
}
