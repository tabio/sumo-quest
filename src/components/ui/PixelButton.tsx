import type { ButtonHTMLAttributes } from "react";
import styles from "./PixelButton.module.css";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 主要な導線に使う。1画面に1つを目安とする。 */
  variant?: "default" | "primary";
  /** 選択中であること。色だけでなく記号でも示す。 */
  selected?: boolean;
};

/**
 * RPG風のボタン。
 * button 要素を使うため、キーボード操作とフォーカスリングは標準の挙動に従う。
 */
export function PixelButton({
  variant = "default",
  selected = false,
  className,
  type = "button",
  ...props
}: PixelButtonProps) {
  const classNames = [
    styles.button,
    variant === "primary" ? styles.primary : "",
    selected ? styles.selected : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      aria-current={selected ? "true" : undefined}
      {...props}
    />
  );
}
