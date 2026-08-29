import type { Technique } from "@/types/game";

// 決まり手のマスターデータ。
// 技図鑑と学習パートは、説明の重複管理を避けるためこのデータを共有する。
// MVPでは代表的な6種類のみ扱う（PRD「14. MVPスコープ」）。
export const techniques: Technique[] = [
  {
    id: "yorikiri",
    name: "寄り切り",
    reading: "よりきり",
    description:
      "相手のまわしをつかみ、体を寄せながら土俵の外へ押し出す技。決まり手の中で最もよく出る。",
  },
  {
    id: "oshidashi",
    name: "押し出し",
    reading: "おしだし",
    description:
      "まわしをつかまず、相手の体を手で押して土俵の外へ出す技。前へ出る力の強い力士が得意とする。",
  },
];
