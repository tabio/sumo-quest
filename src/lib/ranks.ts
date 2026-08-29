import { ranks } from "@/data/ranks";
import type { Rank, RankId } from "@/types/game";

// 番付の導出。
// 設計書「7. ゲーム進行ルール」の番付規則を実装する。
//
// 番付は累積EXPから導出し、セーブの rankId は表示を簡単にするための写しとして扱う。
// 不整合があればEXPを正として再計算する（設計書「11. localStorage設計」）。
//
// 数値はすべて src/data/ranks.ts が持つ。ここには書かない（scope.md）。

/** EXPで昇進できる番付を、下位から昇順で得る。 */
function experienceRanks(): Rank[] {
  return ranks
    .filter((rank) => !rank.requiresFinalExam)
    .sort((a, b) => a.order - b.order);
}

/** 最下位の番付。 */
export function lowestRank(): Rank {
  const [first] = experienceRanks();
  return first;
}

/** IDから番付を引く。未知のIDでは最下位を返す。 */
export function findRank(rankId: RankId): Rank {
  return ranks.find((rank) => rank.id === rankId) ?? lowestRank();
}

/**
 * 累積EXPから番付を導出する。
 *
 * 横綱は最終試験のクリアが必須のため、EXPだけでは到達しない。
 *
 * @param experience 累積EXP
 * @param hasClearedFinalExam 最終試験をクリア済みか
 */
export function rankFromExperience(
  experience: number,
  hasClearedFinalExam = false,
): Rank {
  if (hasClearedFinalExam) {
    const yokozuna = ranks.find((rank) => rank.requiresFinalExam);
    if (yokozuna) return yokozuna;
  }

  // 条件を満たす中で最上位を選ぶ。
  return experienceRanks().reduce(
    (current, rank) => (experience >= rank.requiredExperience ? rank : current),
    lowestRank(),
  );
}

/**
 * 次の番付までに必要な残りEXP。
 * 最上位に到達している場合は null を返す。
 */
export function experienceToNextRank(experience: number): number | null {
  const next = experienceRanks().find(
    (rank) => rank.requiredExperience > experience,
  );
  if (!next) return null;
  return next.requiredExperience - experience;
}

/**
 * 次の番付。最上位に到達している場合は null。
 * 横綱は最終試験が条件のため、ここには現れない。
 */
export function nextRank(experience: number): Rank | null {
  return (
    experienceRanks().find((rank) => rank.requiredExperience > experience) ??
    null
  );
}
