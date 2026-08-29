import { Arrow, DohyoGround, Rikishi } from "./parts";
import styles from "./figures.module.css";

// 相撲部屋・土俵の学習で使う図（ADR-0009）。
// 図はいずれも「文章で説明しにくい位置関係」だけを描き、説明そのものは本文に残す。

/** 土俵のつくり。真上から見た図。 */
export function DohyoLayout() {
  return (
    <svg className={styles.canvas} viewBox="0 0 200 150">
      {/* 土俵の台。 */}
      <rect
        className={styles.clayDeep}
        x={16}
        y={10}
        width={124}
        height={112}
      />
      {/* 円と、そのふちにうめた俵。 */}
      <circle className={styles.ring} cx={78} cy={66} r={45} />
      {/* 徳俵。円の外へ少しずらして置かれた4つの俵。 */}
      <rect className={styles.tawara} x={70} y={14} width={16} height={7} />
      <rect className={styles.tawara} x={70} y={111} width={16} height={7} />
      <rect className={styles.tawara} x={26} y={58} width={7} height={16} />
      <rect className={styles.tawara} x={123} y={58} width={7} height={16} />
      {/* 仕切り線。ここに手をついて向かい合う。 */}
      <rect className={styles.shikiri} x={62} y={56} width={32} height={4} />
      <rect className={styles.shikiri} x={62} y={72} width={32} height={4} />

      {/* 引き出し線つきの見出し。 */}
      <path className={styles.line} d="M 144 40 L 116 34" />
      <text className={styles.labelMuted} x={146} y={44}>
        たわら
      </text>
      <path className={styles.line} d="M 144 92 L 96 76" />
      <text className={styles.labelMuted} x={146} y={96}>
        しきり線
      </text>

      {/* 直径の寸法。 */}
      <path className={styles.line} d="M 33 134 L 123 134" />
      <path className={styles.line} d="M 33 129 L 33 139 M 123 129 L 123 139" />
      <text className={styles.labelAccent} x={78} y={148} textAnchor="middle">
        4.55m
      </text>
    </svg>
  );
}

/** まわしの位置。 */
export function Mawashi() {
  return (
    <svg className={styles.canvas} viewBox="0 24 200 96">
      <rect className={styles.ground} x={14} y={104} width={110} height={6} />
      <Rikishi x={70} y={104} facing={1} side="east" />
      {/* 腰の帯を指す。 */}
      <Arrow x={150} y={84} length={54} angle={180} />
      <text className={styles.label} x={140} y={70}>
        まわし
      </text>
      <text className={styles.labelMuted} x={128} y={106}>
        腰にしめる帯
      </text>
    </svg>
  );
}

/** 負けになる二つの決まり方。 */
export function LoseConditions() {
  return (
    <svg className={styles.canvas} viewBox="0 0 200 134">
      {/* 左：俵をこえて土俵の外に出る。 */}
      <rect className={styles.plate} x={4} y={6} width={90} height={104} />
      <DohyoGround y={92} left={10} right={52} />
      <rect className={styles.ground} x={52} y={104} width={38} height={6} />
      <Rikishi x={68} y={104} facing={1} side="east" lean={6} />
      <Arrow x={16} y={56} length={24} />
      <text className={styles.labelMuted} x={49} y={126} textAnchor="middle">
        土俵の外に出る
      </text>

      {/* 右：足の裏いがいが土につく。 */}
      <rect className={styles.plate} x={106} y={6} width={90} height={104} />
      <DohyoGround y={96} left={112} right={190} />
      <Rikishi x={138} y={96} facing={1} side="west" arm="hand" lean={22} />
      <Arrow x={186} y={34} length={26} angle={125} variant="verdant" />
      <text className={styles.labelMuted} x={151} y={126} textAnchor="middle">
        足の裏いがいがつく
      </text>
    </svg>
  );
}

/** 行司と軍配。 */
export function GyojiGunbai() {
  return (
    <svg className={styles.canvas} viewBox="0 0 200 124">
      <rect className={styles.ground} x={10} y={104} width={180} height={6} />

      {/* 行司。装束は裾が広がった形で表す。 */}
      <polygon className={styles.body} points="30,104 66,104 60,58 40,58" />
      <rect className={styles.body} x={41} y={44} width={14} height={14} />
      {/* 烏帽子。 */}
      <polygon className={styles.mawashi} points="42,44 56,44 54,30 46,30" />
      {/* 軍配を持つ腕。 */}
      <rect className={styles.body} x={55} y={62} width={20} height={6} />
      <rect className={styles.body} x={73} y={60} width={10} height={5} />
      {/* 軍配。 */}
      <polygon className={styles.clay} points="83,44 105,49 105,73 83,78" />

      {/* 軍配は勝った力士のほうへ向ける。 */}
      <Arrow x={110} y={61} length={30} />
      <Rikishi x={168} y={104} facing={-1} side="east" />

      <text className={styles.labelMuted} x={48} y={120} textAnchor="middle">
        行司
      </text>
      <text className={styles.labelMuted} x={94} y={94} textAnchor="middle">
        軍配
      </text>
      <text className={styles.labelAccent} x={168} y={36} textAnchor="middle">
        勝ち
      </text>
    </svg>
  );
}

/** 仕切りから立合いまで。 */
export function Tachiai() {
  return (
    <svg className={styles.canvas} viewBox="0 0 200 134">
      {/* 左：仕切り。両手を土俵につけて呼吸を合わせる。 */}
      <rect className={styles.plate} x={4} y={6} width={84} height={104} />
      <rect className={styles.clay} x={10} y={96} width={72} height={8} />
      <Rikishi x={24} y={96} facing={1} side="east" crouch />
      <Rikishi x={68} y={96} facing={-1} side="west" crouch />
      <text className={styles.labelMuted} x={46} y={126} textAnchor="middle">
        しきり
      </text>

      <Arrow x={90} y={58} length={16} />

      {/* 右：立合い。呼吸が合った瞬間に同時に立つ。 */}
      <rect className={styles.plate} x={112} y={6} width={84} height={104} />
      <rect className={styles.clay} x={118} y={96} width={72} height={8} />
      <Rikishi x={136} y={96} facing={1} side="east" arm="push" lean={6} />
      <Rikishi x={176} y={96} facing={-1} side="west" lean={-6} />
      <text className={styles.labelMuted} x={154} y={126} textAnchor="middle">
        たちあい
      </text>
    </svg>
  );
}

/** 禁止を示す丸に斜線。×で全体を覆うと、下の絵が読めなくなる。 */
function Forbidden({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const offset = Math.round(r * 0.7);
  return (
    <g aria-hidden="true">
      <circle className={styles.forbidden} cx={cx} cy={cy} r={r} />
      <path
        className={styles.forbidden}
        d={`M ${cx - offset} ${cy - offset} L ${cx + offset} ${cy + offset}`}
      />
    </g>
  );
}

/** 禁じ手。 */
export function Kinjite() {
  return (
    <svg className={styles.canvas} viewBox="0 0 200 118">
      {/* にぎりこぶしで殴る。反則をする手はどの絵でも同じ色にする。 */}
      <g>
        <rect className={styles.plate} x={4} y={6} width={60} height={80} />
        <circle className={styles.body} cx={46} cy={42} r={9} />
        <rect className={styles.mawashi} x={18} y={36} width={14} height={13} />
        <Arrow x={32} y={42} length={10} />
        <Forbidden cx={34} cy={44} r={25} />
        <text className={styles.labelMuted} x={34} y={104} textAnchor="middle">
          なぐる
        </text>
      </g>

      {/* 髪をつかむ。 */}
      <g>
        <rect className={styles.plate} x={70} y={6} width={60} height={80} />
        <circle className={styles.body} cx={100} cy={54} r={10} />
        {/* まげ。 */}
        <rect className={styles.body} x={94} y={41} width={12} height={6} />
        {/* つかむ手。 */}
        <rect className={styles.mawashi} x={90} y={28} width={20} height={10} />
        <rect className={styles.mawashi} x={92} y={38} width={4} height={5} />
        <rect className={styles.mawashi} x={98} y={38} width={4} height={5} />
        <rect className={styles.mawashi} x={104} y={38} width={4} height={5} />
        <Forbidden cx={100} cy={44} r={25} />
        <text className={styles.labelMuted} x={100} y={104} textAnchor="middle">
          髪をつかむ
        </text>
      </g>

      {/* 急所を突く。 */}
      <g>
        <rect className={styles.plate} x={136} y={6} width={60} height={80} />
        <circle className={styles.body} cx={156} cy={28} r={8} />
        <rect className={styles.body} x={146} y={38} width={20} height={20} />
        <rect className={styles.body} x={144} y={56} width={24} height={9} />
        <rect className={styles.mawashi} x={170} y={55} width={13} height={7} />
        <Forbidden cx={164} cy={44} r={25} />
        <text className={styles.labelMuted} x={166} y={104} textAnchor="middle">
          急所を突く
        </text>
      </g>
    </svg>
  );
}
