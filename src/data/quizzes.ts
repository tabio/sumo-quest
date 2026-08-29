import type { Quiz } from "@/types/game";

// 取組パートのマスターデータ。
// 正解は選択肢の番号ではなく correctChoiceId で持つ。
// 誤答解説は、なぜ違うのかまで書く。誤解を残さないため（R-4）。
// 内容の正確性はP4-10で通し校正する。
export const quizzes: Quiz[] = [
  {
    id: "sumo-stable-quiz-1",
    stageId: "sumo-stable",
    question: "力士が取組を行う場所を何という？",
    choices: [
      { id: "dohyo", label: "土俵" },
      { id: "heya", label: "相撲部屋" },
      { id: "mawashi", label: "まわし" },
    ],
    correctChoiceId: "dohyo",
    explanation:
      "正解は「土俵」。土を固めて作ったまるい場所で、まわりを俵で囲んである。相撲部屋は力士が稽古し生活する場所、まわしは腰に締める帯のことだ。",
    rewardExp: 10,
    termIds: ["dohyo"],
  },
  {
    id: "sumo-stable-quiz-2",
    stageId: "sumo-stable",
    question: "力士が腰に締めている、幅の広い帯を何という？",
    choices: [
      { id: "mawashi", label: "まわし" },
      { id: "gunbai", label: "軍配" },
      { id: "tawara", label: "俵" },
    ],
    correctChoiceId: "mawashi",
    explanation:
      "正解は「まわし」。取組ではこれをつかんで相手を動かす。軍配は行司が持つうちわ、俵は土俵のまわりを囲んでいるものだ。",
    rewardExp: 10,
    termIds: ["mawashi"],
  },
  {
    id: "sumo-stable-quiz-3",
    stageId: "sumo-stable",
    question: "取組で負けになるのはどれ？",
    choices: [
      { id: "out", label: "土俵の外に出る" },
      { id: "grab", label: "相手のまわしをつかむ" },
      { id: "long", label: "勝負が10秒を超える" },
    ],
    correctChoiceId: "out",
    explanation:
      "正解は「土俵の外に出る」。足の裏以外が土俵についても負けになる。まわしをつかむのは反則ではなく、むしろ基本の攻め方だ。勝負の長さで負けが決まることはない。",
    rewardExp: 10,
    termIds: ["dohyo"],
  },
  {
    id: "sumo-stable-quiz-4",
    stageId: "sumo-stable",
    question: "取組を進行し、勝った力士に軍配を向ける役目の人は？",
    choices: [
      { id: "gyoji", label: "行司" },
      { id: "oyakata", label: "親方" },
      { id: "rikishi", label: "力士" },
    ],
    correctChoiceId: "gyoji",
    explanation:
      "正解は「行司」。軍配といううちわを勝ったほうへ向ける。親方は相撲部屋で力士を指導する人、力士は相撲を取る人のことだ。",
    rewardExp: 10,
    termIds: ["gyoji"],
  },
  {
    id: "sumo-stable-quiz-5",
    stageId: "sumo-stable",
    question: "相手のまわしをつかみ、体を寄せて土俵の外へ出す技を何という？",
    choices: [
      { id: "yorikiri", label: "寄り切り" },
      { id: "oshidashi", label: "押し出し" },
      { id: "tsukidashi", label: "突き出し" },
    ],
    correctChoiceId: "yorikiri",
    explanation:
      "正解は「寄り切り」。決まり手の中で最もよく出る技だ。押し出しはまわしをつかまずに手で押して出す技で、まわしをつかむかどうかが違う。",
    rewardExp: 10,
    techniqueId: "yorikiri",
  },
];
