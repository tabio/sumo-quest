import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./PixelButton.module.css";

type PixelLinkProps = ComponentProps<typeof Link> & {
  variant?: "default" | "primary";
};

/**
 * ボタンの見た目を持つ画面遷移リンク。
 * 遷移はボタンではなくリンクで行う。新しいタブで開く等の標準の挙動を保つため。
 * href は末尾スラッシュなしで書く。basePath と trailingSlash は next/link が付ける。
 */
export function PixelLink({
  variant = "default",
  className,
  ...props
}: PixelLinkProps) {
  const classNames = [
    styles.button,
    variant === "primary" ? styles.primary : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <Link className={classNames} {...props} />;
}
