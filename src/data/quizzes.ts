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
  {
    id: "dohyo-quiz-1",
    stageId: "dohyo",
    question: "土俵にえがかれた円の直径は、およそどれくらい？",
    choices: [
      { id: "a", label: "4.55メートル" },
      { id: "b", label: "2メートル" },
      { id: "c", label: "10メートル" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「4.55メートル」。大人が両手を広げた長さの、およそ3人分だ。2メートルでは取組ができないほどせまく、10メートルでは広すぎて土俵を出ることがなくなってしまう。",
    rewardExp: 10,
    termIds: ["dohyo"],
  },
  {
    id: "dohyo-quiz-2",
    stageId: "dohyo",
    question: "負けになるのは、どんなとき？",
    choices: [
      { id: "a", label: "足の裏いがいが土についたとき" },
      { id: "b", label: "相手のまわしをつかんだとき" },
      { id: "c", label: "土俵に塩をまいたとき" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「足の裏いがいが土についたとき」。手や膝がつけば、そこで勝負は終わる。まわしをつかむのは反則ではなく、相手を動かすための基本の動きだ。塩をまくのは土俵を清める作法で、勝ち負けとは関係がない。",
    rewardExp: 10,
    termIds: ["tawara"],
  },
  {
    id: "dohyo-quiz-3",
    stageId: "dohyo",
    question: "二人が呼吸を合わせて同時に立ち上がる、取組の始まりを何という？",
    choices: [
      { id: "a", label: "立合い" },
      { id: "b", label: "仕切り" },
      { id: "c", label: "物言い" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「立合い」。始まりの合図をする人はおらず、二人の呼吸だけで始まる。仕切りはその前に呼吸を合わせる時間、物言いは判定に疑問があるときに審判が異議を唱えることだ。",
    rewardExp: 10,
    termIds: ["tachiai", "shikiri"],
  },
  {
    id: "dohyo-quiz-4",
    stageId: "dohyo",
    question: "行司が持っていて、勝った力士のほうへ向けるものは？",
    choices: [
      { id: "a", label: "軍配" },
      { id: "b", label: "俵" },
      { id: "c", label: "まわし" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「軍配」。うちわの形をした道具で、行司はこれで勝敗を示す。俵は土俵の円をふちどっているもの、まわしは力士が腰に締める帯だ。",
    rewardExp: 10,
    termIds: ["gunbai", "gyoji"],
  },
  {
    id: "dohyo-quiz-5",
    stageId: "dohyo",
    question: "禁じ手にあたるのはどれ？",
    choices: [
      { id: "a", label: "にぎりこぶしで相手をなぐる" },
      { id: "b", label: "相手を土俵の外へ押し出す" },
      { id: "c", label: "相手のまわしをつかんで引く" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「にぎりこぶしで相手をなぐる」。使えばその場で負けになる。土俵の外へ押し出すのは勝ち方そのもので、まわしをつかんで引くのも許された動きだ。",
    rewardExp: 10,
    termIds: ["kinjite"],
  },
  {
    id: "dojo-quiz-1",
    stageId: "dojo",
    question: "勝負が決まったときの技の名前を、まとめて何という？",
    choices: [
      { id: "a", label: "決まり手" },
      { id: "b", label: "禁じ手" },
      { id: "c", label: "物言い" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「決まり手」。全部で82手ある。禁じ手は使ってはいけない反則、物言いは判定に疑問があるときに審判が異議を唱えることだ。",
    rewardExp: 10,
    termIds: ["kimarite"],
  },
  {
    id: "dojo-quiz-2",
    stageId: "dojo",
    question: "決まり手の中で、最もよく出るのはどれ？",
    choices: [
      { id: "a", label: "寄り切り" },
      { id: "b", label: "上手投げ" },
      { id: "c", label: "叩き込み" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「寄り切り」。まわしをつかんで体を寄せ、土俵の外へ出す技だ。上手投げも叩き込みもよく見る技だが、寄り切りほどの数にはならない。",
    rewardExp: 10,
    techniqueId: "yorikiri",
  },
  {
    id: "dojo-quiz-3",
    stageId: "dojo",
    question: "まわしをつかまずに、相手の体を手で押して土俵の外へ出す技は？",
    choices: [
      { id: "a", label: "押し出し" },
      { id: "b", label: "寄り切り" },
      { id: "c", label: "下手投げ" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「押し出し」。寄り切りも相手を外へ出す技だが、こちらはまわしをつかんで体を寄せる。下手投げは相手の腕の内側からまわしをつかんで投げる技だ。",
    rewardExp: 10,
    techniqueId: "oshidashi",
  },
  {
    id: "dojo-quiz-4",
    stageId: "dojo",
    question: "相手の腕の外側からまわしをつかんで投げる技は？",
    choices: [
      { id: "a", label: "上手投げ" },
      { id: "b", label: "下手投げ" },
      { id: "c", label: "突き落とし" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「上手投げ」。腕が外側にあるほうを上手という。内側からつかんで投げるのが下手投げ、横から突いてたおすのが突き落としだ。",
    rewardExp: 10,
    techniqueId: "uwatenage",
  },
  {
    id: "dojo-quiz-5",
    stageId: "dojo",
    question: "前に出てくる相手を上からたたいて、土俵に手をつかせる技は？",
    choices: [
      { id: "a", label: "叩き込み" },
      { id: "b", label: "突き落とし" },
      { id: "c", label: "押し出し" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「叩き込み」。相手の勢いを利用するので、体が小さくても決まることがある。突き落としは横からひねって突く技、押し出しは前へ押して外へ出す技だ。",
    rewardExp: 10,
    techniqueId: "hatakikomi",
  },
  {
    id: "banzuke-shrine-quiz-1",
    stageId: "banzuke-shrine",
    question: "力士の順位を示す表を何という？",
    choices: [
      { id: "a", label: "番付" },
      { id: "b", label: "決まり手" },
      { id: "c", label: "軍配" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「番付」。本場所ごとに作り直される。決まり手は勝負が決まったときの技の名前、軍配は行司が持つ道具だ。",
    rewardExp: 10,
    termIds: ["banzuke"],
  },
  {
    id: "banzuke-shrine-quiz-2",
    stageId: "banzuke-shrine",
    question: "番付でいちばん上の位はどれ？",
    choices: [
      { id: "a", label: "横綱" },
      { id: "b", label: "大関" },
      { id: "c", label: "関脇" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「横綱」。上から横綱、大関、関脇、小結、前頭の順に並ぶ。大関と関脇はどちらも上位だが、横綱の下にあたる。",
    rewardExp: 10,
    termIds: ["yokozuna"],
  },
  {
    id: "banzuke-shrine-quiz-3",
    stageId: "banzuke-shrine",
    question: "十両より上の番付の力士を、まとめて何と呼ぶ？",
    choices: [
      { id: "a", label: "関取" },
      { id: "b", label: "親方" },
      { id: "c", label: "行司" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「関取」。給料が出て、付け人もつく。親方は力士を指導する人、行司は取組をさばく人で、どちらも番付の位の名前ではない。",
    rewardExp: 10,
    termIds: ["sekitori"],
  },
  {
    id: "banzuke-shrine-quiz-4",
    stageId: "banzuke-shrine",
    question: "15日間の本場所で、関取が「勝ち越し」になるのは何勝から？",
    choices: [
      { id: "a", label: "8勝" },
      { id: "b", label: "5勝" },
      { id: "c", label: "12勝" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「8勝」。15日のうち8勝すれば、負けの数より勝ちの数が多くなる。5勝では負け越しで、12勝は勝ち越しだが、境目は8勝だ。",
    rewardExp: 10,
    termIds: ["kachikoshi", "makekoshi"],
  },
  {
    id: "banzuke-shrine-quiz-5",
    stageId: "banzuke-shrine",
    question: "負け越しても番付が下がらないのは、どの位？",
    choices: [
      { id: "a", label: "横綱" },
      { id: "b", label: "大関" },
      { id: "c", label: "関脇" },
    ],
    correctChoiceId: "a",
    explanation:
      "正解は「横綱」。そのかわり、勝てなくなれば引退することになる。大関は負け越してもすぐには落ちないが、次の場所でも負け越すと関脇に下がる。関脇は負け越せばそのまま下がる。",
    rewardExp: 10,
    termIds: ["yokozuna", "makekoshi"],
  },
];
