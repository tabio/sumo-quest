import type { Technique } from "@/types/game";

// 決まり手のマスターデータ。
// 技図鑑と学習パートは、説明の重複管理を避けるためこのデータを共有する。
// MVPでは代表的な6種類のみ扱う（PRD「7. 学習ステージ」STAGE 3）。
// 難易度は技図鑑の掲載項目であり、値の根拠は ADR-0006 を参照。
export const techniques: Technique[] = [
  {
    id: "yorikiri",
    name: "寄り切り",
    reading: "よりきり",
    description:
      "相手のまわしをつかみ、体を寄せながら土俵の外へ押し出す技。決まり手の中で最もよく出る。",
    difficulty: 1,
  },
  {
    id: "oshidashi",
    name: "押し出し",
    reading: "おしだし",
    description:
      "まわしをつかまず、相手の体を手で押して土俵の外へ出す技。前へ出る力の強い力士が得意とする。",
    difficulty: 1,
  },
  {
    id: "hatakikomi",
    name: "叩き込み",
    reading: "はたきこみ",
    description:
      "前に出てくる相手の肩や背中を上からたたき、土俵に手をつかせる技。相手の勢いを利用するため、力の差があっても決まることがある。",
    difficulty: 2,
  },
  {
    id: "uwatenage",
    name: "上手投げ",
    reading: "うわてなげ",
    description:
      "相手の腕の外側からまわしをつかみ、体をひねって投げる技。腕が外側にあるほうを「上手」という。",
    difficulty: 2,
  },
  {
    id: "shitatenage",
    name: "下手投げ",
    reading: "したてなげ",
    description:
      "相手の腕の内側からまわしをつかんで投げる技。内側にあるほうを「下手」といい、体を低くして組むと取りやすい。",
    difficulty: 3,
  },
  {
    id: "tsukiotoshi",
    name: "突き落とし",
    reading: "つきおとし",
    description:
      "相手の体を横からひねるように突いて、土俵にたおす技。真正面から力で押すのではなく、体の向きをずらして決める。",
    difficulty: 3,
  },
];
