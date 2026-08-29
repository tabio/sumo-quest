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
  {
    id: "tachiai",
    name: "立合い",
    reading: "たちあい",
    description:
      "取組の始まりのこと。合図をする人はおらず、両者が呼吸を合わせて同時に立ち上がる。",
  },
  {
    id: "shikiri",
    name: "仕切り",
    reading: "しきり",
    description:
      "立合いの前に、両手を土俵につけて相手と呼吸を合わせること。制限時間の中で何度もくり返す。",
  },
  {
    id: "gunbai",
    name: "軍配",
    reading: "ぐんばい",
    description:
      "行司が持つ、うちわの形をした道具。勝った力士のほうへ向けて、どちらが勝ったかを示す。",
  },
  {
    id: "kinjite",
    name: "禁じ手",
    reading: "きんじて",
    description:
      "使ってはいけない技のこと。にぎりこぶしで殴る、髪をつかむ、急所を突くなどがあたり、使えばその場で負けになる。",
  },
  {
    id: "monoii",
    name: "物言い",
    reading: "ものいい",
    description:
      "行司の判定に疑問があるとき、審判が異議を唱えること。話し合ったうえで、判定を変えたり取り直しにしたりする。",
  },
  {
    id: "tawara",
    name: "俵",
    reading: "たわら",
    description:
      "土俵の円をふちどっている、土をつめた俵。ここより外に出ると負けになる。",
  },
  {
    id: "kimarite",
    name: "決まり手",
    reading: "きまりて",
    description:
      "勝負が決まったときの技の名前。日本相撲協会が定めた82手があり、取組のあとに場内へ知らされる。",
  },
];
