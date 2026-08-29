import { Arrow } from "./parts";
import styles from "./figures.module.css";

// 番付と本場所の図（ADR-0009）。
// 順序・回数・日数といった、文章では並びが頭に入りにくい情報を図にする。
//
// 色つきの面には文字を載せない。文字は必ず板（plate）の上に置き、
// design-tokens.test.ts が検査している組み合わせの中に収める。

/** 番付の階層。下から上へ積み上げた形で示す。 */
export function BanzukePyramid() {
  // 下位ほど人数が多く、幅を広く取る。値は見た目の比率で、人数の実数ではない。
  const rows = [
    { name: "横綱", width: 44 },
    { name: "大関", width: 52 },
    { name: "関脇", width: 60 },
    { name: "小結", width: 68 },
    { name: "前頭", width: 84 },
    { name: "十両", width: 100 },
    { name: "幕下", width: 112 },
    { name: "三段目", width: 124 },
    { name: "序二段", width: 136 },
    { name: "序ノ口", width: 144 },
  ];
  const centerX = 80;
  const rowHeight = 12;
  const step = 14;
  const top = (index: number) => 6 + index * step;

  return (
    <svg className={styles.canvas} viewBox="0 0 220 164">
      {rows.map((row, index) => (
        <g key={row.name}>
          <rect
            className={index <= 5 ? styles.plateAccent : styles.plate}
            x={centerX - row.width / 2}
            y={top(index)}
            width={row.width}
            height={rowHeight}
          />
          <text
            className={styles.label}
            x={centerX}
            y={top(index) + 10}
            textAnchor="middle"
          >
            {row.name}
          </text>
        </g>
      ))}

      {/* 幕内は前頭から横綱まで。 */}
      <path
        className={styles.line}
        d={`M 152 ${top(0)} L 158 ${top(0)} L 158 ${top(4) + rowHeight} L 152 ${top(4) + rowHeight}`}
      />
      <text className={styles.labelAccent} x={162} y={44}>
        幕内
      </text>

      {/* 関取は十両から上。ここから給料が出る。 */}
      <path
        className={styles.line}
        d={`M 180 ${top(0)} L 186 ${top(0)} L 186 ${top(5) + rowHeight} L 180 ${top(5) + rowHeight}`}
      />
      <text className={styles.labelAccent} x={190} y={52}>
        関取
      </text>

      <text className={styles.labelMuted} x={80} y={160} textAnchor="middle">
        下から上へ番付が上がる
      </text>
    </svg>
  );
}

/** 15日間の勝敗と勝ち越し。 */
export function Hoshitori() {
  const wins = [0, 1, 2, 3, 4, 5, 6, 7];
  const losses = [0, 1, 2, 3, 4, 5, 6];

  return (
    <svg className={styles.canvas} viewBox="0 0 200 124">
      <text className={styles.labelMuted} x={4} y={16}>
        関取は15日間、毎日取組がある
      </text>

      {/* 白星。勝った日。 */}
      <text className={styles.label} x={4} y={44}>
        8勝
      </text>
      {wins.map((index) => (
        <circle
          key={`win-${index}`}
          className={styles.win}
          cx={50 + index * 18}
          cy={40}
          r={6}
        />
      ))}

      {/* 黒星。負けた日。 */}
      <text className={styles.label} x={4} y={80}>
        7敗
      </text>
      {losses.map((index) => (
        <circle
          key={`loss-${index}`}
          className={styles.loss}
          cx={50 + index * 18}
          cy={76}
          r={6}
        />
      ))}

      <Arrow x={184} y={94} length={30} angle={-90} />
      <text className={styles.labelAccent} x={4} y={110}>
        8勝で勝ち越し。番付が上がる
      </text>
    </svg>
  );
}

/** 本場所は1年に6回。 */
export function BashoYear() {
  const basho = [
    { month: "1月", city: "東京" },
    { month: "3月", city: "大阪" },
    { month: "5月", city: "東京" },
    { month: "7月", city: "名古屋" },
    { month: "9月", city: "東京" },
    { month: "11月", city: "福岡" },
  ];

  return (
    <svg className={styles.canvas} viewBox="0 0 200 140">
      {basho.map((item, index) => {
        const x = 4 + (index % 3) * 66;
        const y = 10 + Math.floor(index / 3) * 60;
        return (
          <g key={item.month}>
            <rect className={styles.plate} x={x} y={y} width={60} height={50} />
            <text
              className={styles.labelAccent}
              x={x + 30}
              y={y + 22}
              textAnchor="middle"
            >
              {item.month}
            </text>
            <text
              className={styles.label}
              x={x + 30}
              y={y + 40}
              textAnchor="middle"
            >
              {item.city}
            </text>
          </g>
        );
      })}
      <text className={styles.labelMuted} x={100} y={134} textAnchor="middle">
        1場所は15日間。初日から千秋楽まで
      </text>
    </svg>
  );
}

/** 本場所の1日の流れ。 */
export function BashoDay() {
  const steps = [
    { time: "朝", body: "下の番付の取組" },
    { time: "昼すぎ", body: "十両の取組" },
    { time: "夕方", body: "幕内の土俵入り" },
    { time: "", body: "幕内の取組" },
    { time: "終わり", body: "結びの一番・弓取式" },
  ];

  return (
    <svg className={styles.canvas} viewBox="0 0 200 150">
      {/* 時間の流れ。上から下へ進む。 */}
      <path className={styles.line} d="M 38 14 L 38 104" />
      <Arrow x={38} y={100} length={16} angle={90} />

      {steps.map((step, index) => {
        const y = 8 + index * 28;
        return (
          <g key={step.body}>
            <rect
              className={styles.plate}
              x={46}
              y={y}
              width={150}
              height={22}
            />
            <text className={styles.labelMuted} x={4} y={y + 16}>
              {step.time}
            </text>
            <text className={styles.label} x={54} y={y + 16}>
              {step.body}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
