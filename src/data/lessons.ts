import type { Lesson } from "@/types/game";

// 学習パートのマスターデータ。
// 1件が1ステージ分の会話に対応し、messages を1画面ずつ表示する。
// 内容の正確性と読みやすさはP4-10で通し校正する（R-4）。
export const lessons: Lesson[] = [
  {
    id: "sumo-stable-lesson",
    stageId: "sumo-stable",
    speakerId: "oyakata",
    messages: [
      {
        text: "よく来たな。ここは相撲部屋、力士が寝起きし、稽古をする場所だ。",
      },
      { text: "相撲を取る人を「力士」と呼ぶ。お前も今日から見習い力士だ。" },
      {
        text: "力士が勝負をする場所を「土俵」という。土を固めて作った、まるい場所だ。",
        figureId: "dohyo-layout",
      },
      {
        text: "土俵のまわりは俵で囲まれている。この円から出てしまうと、その時点で負けだ。",
      },
      {
        text: "力士が腰に締めている幅の広い帯を「まわし」という。取組では、これをつかんで相手を動かす。",
        figureId: "mawashi",
      },
      {
        text: "ただし、してはいけないこともある。髪をつかむのも、指を折り曲げるのも反則だ。",
      },
      {
        text: "力士どうしの勝負を「取組」と呼ぶ。始まりから決着まで、たいていは数秒から数十秒だ。",
      },
      {
        text: "勝ち負けの決め方は単純だ。土俵の外に出るか、足の裏以外が土俵についたら負けになる。",
        figureId: "lose-conditions",
      },
      {
        text: "つまり、手をついても、膝をついても、そこで勝負は終わりということだ。",
      },
      {
        text: "取組を進めるのが「行司」だ。軍配といううちわを持ち、勝った力士のほうへ向ける。",
        figureId: "gyoji-gunbai",
      },
      {
        text: "まずはここまで覚えておけ。準備ができたら、土俵で腕試しといこう。",
      },
    ],
    rewardExp: 10,
    unlockTechniqueIds: ["yorikiri"],
    discoverTermIds: [
      "dohyo",
      "rikishi",
      "mawashi",
      "torikumi",
      "heya",
      "gyoji",
    ],
  },
  {
    id: "dohyo-lesson",
    stageId: "dohyo",
    speakerId: "oyakata",
    messages: [
      {
        text: "ここが土俵だ。土を固めた台の上に、直径4.55メートルの円がえがいてある。",
        figureId: "dohyo-layout",
      },
      {
        text: "円のふちには俵がうめてある。この俵の外に出れば、そこで勝負は終わりだ。",
      },
      {
        text: "勝ち負けの決まり方は二つだけだ。土俵の外に出るか、足の裏いがいが土についたら負けになる。",
        figureId: "lose-conditions",
      },
      {
        text: "だから、手をついても、膝をついても、そこで負けだ。とても単純な決まりだろう。",
      },
      {
        text: "取組の前には「仕切り」をする。両手を土俵につけ、相手と呼吸を合わせる時間だ。",
      },
      {
        text: "呼吸が合った瞬間に、二人が同時に立ち上がる。これを「立合い」という。",
        figureId: "tachiai",
      },
      {
        text: "始まりの合図をする人はいない。二人の呼吸だけで、取組は始まるのだ。",
      },
      {
        text: "相撲には「禁じ手」がある。にぎりこぶしで殴る、髪をつかむ、急所を突く。これらは反則だ。",
        figureId: "kinjite",
      },
      {
        text: "禁じ手を使えば、その場で負けになる。強さより先に、決まりを守ることが求められる。",
      },
      {
        text: "取組をさばくのが行司だ。勝った力士のほうへ「軍配」を向けて、勝敗を示す。",
        figureId: "gyoji-gunbai",
      },
      {
        text: "その判定に疑問があれば、まわりで見ている審判が「物言い」をつける。",
      },
      {
        text: "話し合っても決まらなければ「取り直し」だ。もう一度、同じ二人で取組をやり直す。",
      },
      {
        text: "上の番付の取組では、力士が土俵に塩をまく。土俵を清めるための、昔から続く作法だ。",
      },
      {
        text: "決まりは以上だ。単純だからこそ、力と技のちがいがはっきり出る。",
      },
    ],
    rewardExp: 10,
    discoverTermIds: [
      "tachiai",
      "shikiri",
      "gunbai",
      "kinjite",
      "monoii",
      "tawara",
    ],
  },
  {
    id: "dojo-lesson",
    stageId: "dojo",
    speakerId: "oyakata",
    messages: [
      {
        text: "ここはわざ道場だ。相撲で勝負が決まったときの技を「決まり手」という。",
      },
      {
        text: "決まり手は全部で82手ある。すべては多すぎるから、よく出る6つを覚えよう。",
      },
      {
        text: "まずは「寄り切り」。相手のまわしをつかみ、体を寄せながら土俵の外へ出す技だ。",
        figureId: "yorikiri",
      },
      { text: "これが最もよく出る決まり手だ。相撲の基本といっていい。" },
      {
        text: "つぎに「押し出し」。まわしをつかまず、相手の体を手で押して外へ出す技だ。",
        figureId: "oshidashi",
      },
      {
        text: "寄り切りと押し出しは、どちらも相手を土俵の外へ出す。まわしをつかむかどうかがちがう。",
      },
      {
        text: "「叩き込み」は、前に出てくる相手の肩や背中を上からたたき、土俵に手をつかせる技だ。",
        figureId: "hatakikomi",
      },
      { text: "相手の勢いを利用するから、体が小さくても決まることがある。" },
      {
        text: "「突き落とし」は、相手の体を横からひねるように突いて、たおす技だ。",
        figureId: "tsukiotoshi",
      },
      { text: "正面から力でぶつからず、体の向きをずらして決める。" },
      {
        text: "残る二つは投げ技だ。「上手投げ」は、相手の腕の外側からまわしをつかんで投げる。",
        figureId: "uwatenage",
      },
      {
        text: "「下手投げ」は、相手の腕の内側からつかんで投げる。外側が上手、内側が下手だ。",
        figureId: "shitatenage",
      },
      {
        text: "決まり手を覚えると、取組を見るのが何倍も楽しくなる。「今のは何だ」と考えられるからだ。",
      },
    ],
    rewardExp: 10,
    unlockTechniqueIds: [
      "yorikiri",
      "oshidashi",
      "hatakikomi",
      "tsukiotoshi",
      "uwatenage",
      "shitatenage",
    ],
    discoverTermIds: ["kimarite"],
  },
  {
    id: "banzuke-shrine-lesson",
    stageId: "banzuke-shrine",
    speakerId: "oyakata",
    messages: [
      { text: "ここはばんづけ神社。力士の順位を示す「番付」をまつっている。" },
      {
        text: "番付は下から、序ノ口、序二段、三段目、幕下、十両と上がっていく。",
      },
      {
        text: "十両の上が「幕内」だ。幕内の中でも、前頭、小結、関脇、大関、横綱と分かれる。",
        figureId: "banzuke-pyramid",
      },
      { text: "横綱が最高位だ。お前が目指すのも、そこだぞ。" },
      {
        text: "十両より上の力士を「関取」と呼ぶ。ここからは給料が出て、付け人もつく。",
      },
      { text: "関取になれるかどうかは、力士にとって大きな境目だ。" },
      {
        text: "番付は本場所ごとに作り直される。勝てば上がり、負ければ下がる。",
      },
      {
        text: "関取は15日間、毎日取組がある。8勝すれば「勝ち越し」、8敗すれば「負け越し」だ。",
        figureId: "hoshitori",
      },
      {
        text: "勝ち越せば番付は上がり、負け越せば下がる。とても単純な決まりだ。",
      },
      { text: "ただし横綱だけは、負け越しても番付が下がらない。" },
      {
        text: "そのかわり、勝てなくなれば引退することになる。退く道しか残されていない位なのだ。",
      },
      {
        text: "大関も少し特別で、負け越してもすぐには落ちない。次の場所で勝ち越せば大関のままだ。",
      },
      {
        text: "番付を上げるとは、毎場所勝ち越し続けるということだ。道は長いぞ。",
      },
    ],
    rewardExp: 10,
    discoverTermIds: [
      "banzuke",
      "sekitori",
      "makuuchi",
      "kachikoshi",
      "makekoshi",
      "yokozuna",
    ],
  },
  {
    id: "kokugikan-lesson",
    stageId: "kokugikan",
    speakerId: "oyakata",
    messages: [
      { text: "ここは国技館の町。相撲の試合がひらかれる場所だ。" },
      { text: "相撲の公式な試合を「本場所」という。1場所は15日間つづく。" },
      {
        text: "本場所は1年に6回ある。1月と5月と9月は東京、3月は大阪、7月は名古屋、11月は福岡だ。",
        figureId: "basho-year",
      },
      { text: "東京の会場が両国国技館。この町の名前も、そこから来ている。" },
      { text: "場所の最初の日を「初日」、最後の日を「千秋楽」と呼ぶ。" },
      {
        text: "1日の流れも決まっている。朝は下の番付の取組から始まる。",
        figureId: "basho-day",
      },
      { text: "昼を過ぎると十両、夕方になると幕内の取組だ。" },
      {
        text: "幕内の取組の前には「土俵入り」がある。化粧まわしを締めた力士が土俵に上がり、顔ぶれを見せる。",
      },
      {
        text: "そのあとが「横綱土俵入り」だ。横綱だけが行う特別な作法で、四股を踏んで見せる。",
      },
      {
        text: "その日の最後の取組を「結びの一番」という。ふつうは横綱が務める。",
      },
      {
        text: "結びの一番が終わると「弓取式」だ。弓を受け取った力士が、それを回して舞う。",
      },
      { text: "これで一日が終わる。15日間、同じ流れがくり返される。" },
      {
        text: "15日でいちばん多く勝った力士が優勝だ。勝ち星が並べば、優勝決定戦で決める。",
      },
    ],
    rewardExp: 10,
    discoverTermIds: [
      "honbasho",
      "senshuraku",
      "dohyoiri",
      "keshomawashi",
      "musubi-no-ichiban",
      "yumitorishiki",
    ],
  },
  {
    id: "yokozuna-castle-lesson",
    stageId: "yokozuna-castle",
    speakerId: "yokozuna",
    messages: [
      { text: "よく来た。この城まで上がってきたか。" },
      { text: "私が横綱だ。ここで待っていた。" },
      { text: "最後の取組は、お前がこれまで学んだことすべてから出す。" },
      {
        text: "土俵のこと、決まり手のこと、番付のこと、本場所のこと。どれも落とせん。",
      },
      { text: "10番のうち8番取れば、お前の勝ちだ。" },
      {
        text: "負けても、何度でも来ればいい。だが、まぐれで勝てる数にはしていない。",
      },
      { text: "支度はいいか。土俵で待つ。" },
    ],
    rewardExp: 10,
  },
];
