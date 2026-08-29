import type { ReactElement } from "react";
import {
  DohyoLayout,
  GyojiGunbai,
  Kinjite,
  LoseConditions,
  Mawashi,
  Tachiai,
} from "./basics";
import { BanzukePyramid, BashoDay, BashoYear, Hoshitori } from "./banzuke";
import {
  Hatakikomi,
  Oshidashi,
  Shitatenage,
  Tsukiotoshi,
  Uwatenage,
  Yorikiri,
} from "./kimarite";
import type { LessonFigureId } from "@/types/game";
import styles from "./figures.module.css";

// 学習に差し込む図の対応表（ADR-0008）。
//
// Record<LessonFigureId, ...> にしてあるため、
// データが参照する図が無ければ型検査で落ちる。実行時の検査は置かない。

type LessonFigure = {
  /** 図の下に出す見出し。図が読めない場合でも、何の図かは文字で分かるようにする。 */
  caption: string;
  /** 読み上げ用の説明。情報を持つ画像には説明を付ける（設計書「15.」）。 */
  description: string;
  Drawing: () => ReactElement;
};

export const LESSON_FIGURES: Record<LessonFigureId, LessonFigure> = {
  "dohyo-layout": {
    caption: "図：土俵を真上から見たところ",
    description:
      "土俵を真上から見た図。四角い台の上に円がえがかれ、円のふちには俵がうめられている。円の中央には二本の仕切り線が引かれ、円の直径は4.55メートル。",
    Drawing: DohyoLayout,
  },
  mawashi: {
    caption: "図：まわしの位置",
    description: "力士を横から見た図。腰に幅の広い帯であるまわしを締めている。",
    Drawing: Mawashi,
  },
  "lose-conditions": {
    caption: "図：負けになる二つの決まり方",
    description:
      "負けになる二つの場合を並べた図。左は力士が俵をこえて土俵の外に出たところ、右は力士が体を傾けて手を土俵についたところ。",
    Drawing: LoseConditions,
  },
  "gyoji-gunbai": {
    caption: "図：行司と軍配",
    description:
      "烏帽子をかぶった行司が軍配を持ち、勝った力士のほうへ向けている図。",
    Drawing: GyojiGunbai,
  },
  tachiai: {
    caption: "図：仕切りから立合いまで",
    description:
      "二場面を並べた図。左は二人の力士が両手を土俵につけて向かい合う仕切り、右は同時に立ち上がってぶつかる立合い。",
    Drawing: Tachiai,
  },
  kinjite: {
    caption: "図：代表的な禁じ手",
    description:
      "禁じ手を三つ並べ、それぞれに×印を重ねた図。にぎりこぶしで殴ること、髪をつかむこと、急所を突くこと。",
    Drawing: Kinjite,
  },
  yorikiri: {
    caption: "図：寄り切り",
    description:
      "左の力士が右の力士のまわしをつかみ、体を寄せながら土俵の外へ出している図。力の向きは土俵の外側。",
    Drawing: Yorikiri,
  },
  oshidashi: {
    caption: "図：押し出し",
    description:
      "左の力士がまわしをつかまず、両手で相手の体を押して土俵の外へ出している図。力の向きは土俵の外側。",
    Drawing: Oshidashi,
  },
  hatakikomi: {
    caption: "図：叩き込み",
    description:
      "左の力士が、前に出てくる相手の肩を上からたたき、相手が前へ傾いて土俵に手をついている図。",
    Drawing: Hatakikomi,
  },
  tsukiotoshi: {
    caption: "図：突き落とし",
    description:
      "左の力士が相手の体を横から突き、相手が体をひねられて横に倒れている図。",
    Drawing: Tsukiotoshi,
  },
  uwatenage: {
    caption: "図：上手投げ",
    description:
      "左の力士が、相手の腕の外側からまわしをつかんで投げている図。つかむ手は相手の腕より上にある。",
    Drawing: Uwatenage,
  },
  shitatenage: {
    caption: "図：下手投げ",
    description:
      "左の力士が、相手の腕の内側からまわしをつかんで投げている図。つかむ手は相手の腕より下にある。",
    Drawing: Shitatenage,
  },
  "banzuke-pyramid": {
    caption: "図：番付の並び",
    description:
      "番付を下から上へ積み上げた図。下から序ノ口、序二段、三段目、幕下、十両、前頭、小結、関脇、大関、横綱。前頭から上が幕内、十両から上が関取。",
    Drawing: BanzukePyramid,
  },
  hoshitori: {
    caption: "図：15日間の勝ち越し",
    description:
      "15日間の取組の結果を丸で並べた図。白い丸が8つで8勝、黒い丸が7つで7敗。8勝すれば勝ち越しとなり、番付が上がる。",
    Drawing: Hoshitori,
  },
  "basho-year": {
    caption: "図：1年の本場所",
    description:
      "1年に6回ある本場所を並べた図。1月と5月と9月は東京、3月は大阪、7月は名古屋、11月は福岡。1場所は15日間。",
    Drawing: BashoYear,
  },
  "basho-day": {
    caption: "図：本場所の1日の流れ",
    description:
      "本場所の1日の流れを上から下へ並べた図。朝は下の番付の取組、昼すぎは十両の取組、夕方は幕内の土俵入りと幕内の取組、終わりは結びの一番と弓取式。",
    Drawing: BashoDay,
  },
};

/** 学習の1画面に差し込む図。 */
export function LessonFigure({ figureId }: { figureId: LessonFigureId }) {
  const figure = LESSON_FIGURES[figureId];
  const { Drawing } = figure;

  return (
    <figure className={styles.figure}>
      {/* 図全体をひとつの画像として扱い、中の細かな図形は読み上げない。 */}
      <div role="img" aria-label={figure.description}>
        <Drawing />
      </div>
      <figcaption className={styles.caption}>{figure.caption}</figcaption>
    </figure>
  );
}
