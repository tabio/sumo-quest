import type { ReactNode } from "react";
import { Arrow, DohyoGround, Rikishi, TurnArrow } from "./parts";
import styles from "./figures.module.css";

// 決まり手の図（ADR-0008）。
//
// 6種はどれも「相手を外へ出す」か「土俵につかせる」かのどちらかで、
// 文章だけでは違いが見えにくい。図では次の3点だけを描き分ける。
//   1. 手をどこに置くか（まわしをつかむ／体を押す）
//   2. 力をどちらへ向けるか（矢印）
//   3. 相手がどうなるか（外へ出る／傾いて土につく）
//
// 攻める側を左（東方）、受ける側を右（西方）に固定する。
// 図ごとに立ち位置が変わると、見比べたときに違いが読み取れない。

/** 決まり手の図に共通の土俵と注記。 */
function Bout({ children, note }: { children: ReactNode; note: string }) {
  return (
    <svg className={styles.canvas} viewBox="0 0 200 124">
      <DohyoGround y={100} left={6} right={194} />
      {children}
      <text className={styles.labelMuted} x={100} y={120} textAnchor="middle">
        {note}
      </text>
    </svg>
  );
}

/** つかんでいる位置を示す印。 */
function Grip({ x, y }: { x: number; y: number }) {
  return <rect className={styles.mawashi} x={x} y={y} width={9} height={9} />;
}

/** 寄り切り。まわしをつかみ、体を寄せて土俵の外へ出す。 */
export function Yorikiri() {
  return (
    <Bout note="まわしをつかみ、寄って出す">
      {/* 受ける側を先に描き、攻める側の腕が手前に来るようにする。 */}
      <Rikishi x={164} y={100} facing={-1} side="west" arm="grip" lean={8} />
      <Rikishi x={120} y={100} facing={1} side="east" arm="grip" lean={-6} />
      <Grip x={148} y={72} />
      <Arrow x={34} y={44} length={44} />
      <text className={styles.labelAccent} x={32} y={32}>
        寄る
      </text>
    </Bout>
  );
}

/** 押し出し。まわしをつかまず、手で押して外へ出す。 */
export function Oshidashi() {
  return (
    <Bout note="まわしをつかまず、押して出す">
      <Rikishi x={164} y={100} facing={-1} side="west" lean={10} />
      <Rikishi x={116} y={100} facing={1} side="east" arm="push" lean={-10} />
      <Arrow x={34} y={44} length={44} />
      <text className={styles.labelAccent} x={32} y={32}>
        押す
      </text>
    </Bout>
  );
}

/** 叩き込み。前に出てくる相手を上からたたき、土俵に手をつかせる。 */
export function Hatakikomi() {
  return (
    <Bout note="前に出る相手を、上からたたく">
      <Rikishi x={140} y={100} facing={-1} side="west" arm="hand" lean={-26} />
      <Rikishi x={86} y={100} facing={1} side="east" arm="slap" />
      <Arrow x={104} y={24} length={28} angle={60} />
    </Bout>
  );
}

/** 突き落とし。横からひねるように突いて倒す。 */
export function Tsukiotoshi() {
  return (
    <Bout note="横から突いて、体をひねり倒す">
      <Rikishi x={150} y={100} facing={-1} side="west" lean={-36} />
      <Rikishi x={86} y={100} facing={1} side="east" arm="grip" />
      <Arrow x={112} y={30} length={30} angle={45} />
    </Bout>
  );
}

/** 上手投げ。相手の腕の外側からまわしをつかんで投げる。 */
export function Uwatenage() {
  return (
    <Bout note="相手の腕の外側からつかんで投げる">
      <Rikishi x={158} y={100} facing={-1} side="west" arm="under" lean={-14} />
      <Rikishi x={112} y={100} facing={1} side="east" arm="over" />
      <Grip x={138} y={57} />
      <TurnArrow x={184} y={48} radius={24} />
      <text className={styles.labelAccent} x={16} y={40}>
        外側から
      </text>
      <path className={styles.line} d="M 68 46 L 116 55" />
    </Bout>
  );
}

/** 下手投げ。相手の腕の内側からまわしをつかんで投げる。 */
export function Shitatenage() {
  return (
    <Bout note="相手の腕の内側からつかんで投げる">
      <Rikishi x={158} y={100} facing={-1} side="west" arm="over" lean={-14} />
      <Rikishi x={112} y={100} facing={1} side="east" arm="under" />
      <Grip x={138} y={70} />
      <TurnArrow x={184} y={48} radius={24} />
      <text className={styles.labelAccent} x={16} y={40}>
        内側から
      </text>
      <path className={styles.line} d="M 68 46 L 116 68" />
    </Bout>
  );
}
