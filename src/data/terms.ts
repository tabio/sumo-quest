import type { Term } from "@/types/game";

// 相撲用語のマスターデータ。
// 用語辞典には発見済みのものだけを表示する。
// 内容の正確性はP4-10で通し校正する（R-4）。
export const terms: Term[] = [
  {
    id: "dohyo",
    name: "土俵",
    reading: "どひょう",
    description:
      "力士が取組を行う、土を固めて作った円形の場所。直径は4.55メートルで、まわりを俵で囲んである。この円から出ると負けになる。",
  },
  {
    id: "rikishi",
    name: "力士",
    reading: "りきし",
    description:
      "相撲を取る人のこと。「お相撲さん」とも呼ばれる。相撲部屋に所属し、親方の指導を受けながら生活する。",
  },
  {
    id: "mawashi",
    name: "まわし",
    reading: "まわし",
    description:
      "力士が腰に締める、幅の広い帯。取組ではこれをつかんで相手を動かす。まわし以外の場所をつかむのは反則になる。",
  },
  {
    id: "torikumi",
    name: "取組",
    reading: "とりくみ",
    description:
      "力士どうしの勝負のこと。行司の合図で始まり、たいてい数秒から数十秒で決着がつく。",
  },
  {
    id: "heya",
    name: "相撲部屋",
    reading: "すもうべや",
    description:
      "力士が親方のもとで稽古し、生活する場所。力士はどこかの部屋に必ず所属する。",
  },
  {
    id: "gyoji",
    name: "行司",
    reading: "ぎょうじ",
    description:
      "取組を進行し、勝った力士を示す役目の人。軍配と呼ばれるうちわを持ち、勝った側へ向ける。",
  },
];
