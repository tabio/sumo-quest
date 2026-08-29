import styles from "./figures.module.css";

// 図を組み立てる部品（ADR-0008）。
//
// 力士や矢印は複数の図で使い回すため、ここに1つずつ置く。
// どの図も同じ座標系で描く。y が下向きに増えるSVGの向きに合わせ、
// 力士は「足元」を原点として上方向へ組み上げる。

/** 力士の体格。すべての図で同じ大きさに揃える。 */
export const RIKISHI_HEIGHT = 61;

export type RikishiArm =
  /** 腕を体の横に下ろす。 */
  | "none"
  /** 相手のまわしをつかむ。胸の高さでまっすぐ前へ。 */
  | "grip"
  /** 相手の胸を両手で押す。 */
  | "push"
  /** 相手の腕の外側から差す（上手）。 */
  | "over"
  /** 相手の腕の内側から差す（下手）。 */
  | "under"
  /** 相手の背中を上からたたく。 */
  | "slap"
  /** 手を土俵につく。 */
  | "hand";

type RikishiProps = {
  /** 足元の中心。 */
  x: number;
  /** 接地面。 */
  y: number;
  /** 向き。1で右、-1で左を向く。 */
  facing?: 1 | -1;
  /** 東方か西方か。色を分けるが、向きと位置でも区別できるようにしてある。 */
  side?: "east" | "west";
  arm?: RikishiArm;
  /** 仕切りの姿勢。両手を土俵につけて構える。 */
  crouch?: boolean;
  /**
   * 体の傾き（度）。正の値で時計回り（画面の右へ倒れる）。
   * 向きに関わらず画面上の回り方で指定する。図を見ながら決めるため、
   * 体の前後で指定するより取り違えが起きにくい。
   */
  lean?: number;
};

/**
 * 力士のドット絵。
 * 細部は描かず、頭・胴・まわし・脚・腕の5要素だけで形を作る。
 */
export function Rikishi({
  x,
  y,
  facing = 1,
  side = "east",
  arm = "none",
  crouch = false,
  lean = 0,
}: RikishiProps) {
  const body = side === "east" ? styles.body : styles.bodyAlt;
  const mawashi = side === "east" ? styles.mawashi : styles.mawashiAlt;

  return (
    <g
      transform={`translate(${x} ${y}) scale(${facing} 1) rotate(${-lean})`}
      aria-hidden="true"
    >
      {crouch ? (
        <>
          {/* 腰を落として構える。頭は肩の上に置き、腕だけを前へ下ろす。 */}
          <rect className={body} x={-13} y={-14} width={9} height={14} />
          <rect className={body} x={2} y={-14} width={9} height={14} />
          <rect className={mawashi} x={-14} y={-26} width={25} height={12} />
          <rect className={body} x={-9} y={-40} width={20} height={15} />
          <rect className={body} x={-2} y={-52} width={12} height={12} />
          <rect className={body} x={-9} y={-51} width={7} height={4} />
          {/* 手を土俵につける。 */}
          <polygon className={body} points="8,-38 15,-40 22,-2 15,0" />
        </>
      ) : (
        <>
          <rect className={body} x={-10} y={-16} width={7} height={16} />
          <rect className={body} x={3} y={-16} width={7} height={16} />
          <rect className={mawashi} x={-11} y={-25} width={22} height={9} />
          <rect className={body} x={-10} y={-43} width={20} height={18} />
          <rect className={body} x={-13} y={-45} width={26} height={7} />
          <rect className={body} x={-6} y={-57} width={12} height={12} />
          {/* まげ。後ろへ出す。 */}
          <rect className={body} x={-12} y={-56} width={7} height={4} />
          <rect className={body} x={-9} y={-61} width={11} height={4} />
          <RikishiArms arm={arm} className={body} />
        </>
      )}
    </g>
  );
}

function RikishiArms({
  arm,
  className,
}: {
  arm: RikishiArm;
  className: string;
}) {
  switch (arm) {
    case "grip":
      return <rect className={className} x={8} y={-31} width={24} height={6} />;
    case "push":
      return (
        <>
          <rect className={className} x={8} y={-43} width={24} height={5} />
          <rect className={className} x={8} y={-34} width={24} height={5} />
        </>
      );
    case "over":
      return <rect className={className} x={8} y={-46} width={26} height={6} />;
    case "under":
      return <rect className={className} x={8} y={-33} width={26} height={6} />;
    case "slap":
      return (
        <polygon className={className} points="8,-46 20,-46 30,-24 24,-20" />
      );
    case "hand":
      return <polygon className={className} points="8,-42 16,-44 30,-2 24,0" />;
    case "none":
    default:
      return <rect className={className} x={8} y={-43} width={6} height={18} />;
  }
}

type ArrowProps = {
  /** 矢の根元。 */
  x: number;
  y: number;
  length: number;
  /** 向き（度）。0で右、90で下、-90で上。 */
  angle?: number;
  variant?: "accent" | "verdant";
};

/** 動きを示す矢印。太さは全図で揃える。 */
export function Arrow({
  x,
  y,
  length,
  angle = 0,
  variant = "accent",
}: ArrowProps) {
  const className = variant === "accent" ? styles.arrow : styles.arrowVerdant;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} aria-hidden="true">
      <rect className={className} x={0} y={-4} width={length - 10} height={8} />
      <polygon
        className={className}
        points={`${length - 12},-11 ${length},0 ${length - 12},11`}
      />
    </g>
  );
}

/** 回り込む動きを示す弧の矢印。投げ技で使う。 */
export function TurnArrow({
  x,
  y,
  radius,
  facing = 1,
  variant = "accent",
}: {
  x: number;
  y: number;
  radius: number;
  facing?: 1 | -1;
  variant?: "accent" | "verdant";
}) {
  const className = variant === "accent" ? styles.arrow : styles.arrowVerdant;
  return (
    <g transform={`translate(${x} ${y}) scale(${facing} 1)`} aria-hidden="true">
      <path
        className={className}
        d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 0 ${-radius} L 0 ${-radius + 8} A ${radius - 8} ${radius - 8} 0 0 0 ${-radius + 8} 0 Z`}
      />
      <polygon
        className={className}
        points={`${-radius - 8},-2 ${-radius + 8},-2 ${-radius},12`}
      />
    </g>
  );
}

/** 土俵の断面。俵を両端に置いた地面。 */
export function DohyoGround({
  y,
  left,
  right,
}: {
  y: number;
  left: number;
  right: number;
}) {
  return (
    <g aria-hidden="true">
      <rect
        className={styles.clay}
        x={left}
        y={y}
        width={right - left}
        height={10}
      />
      <rect
        className={styles.tawara}
        x={left}
        y={y - 5}
        width={12}
        height={6}
      />
      <rect
        className={styles.tawara}
        x={right - 12}
        y={y - 5}
        width={12}
        height={6}
      />
    </g>
  );
}
