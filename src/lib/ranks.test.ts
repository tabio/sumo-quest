import { describe, expect, it } from "vitest";
import { ranks } from "@/data/ranks";
import {
  experienceToNextRank,
  findRank,
  lowestRank,
  nextRank,
  rankFromExperience,
} from "./ranks";

// 設計書「7. ゲーム進行ルール」の番付規則を検証する。
// 境界値はデータから作るため、値を調整してもテストを書き換えずに済む。

const expRanks = ranks
  .filter((rank) => !rank.requiresFinalExam)
  .sort((a, b) => a.order - b.order);

describe("rankFromExperience", () => {
  it("EXP 0 では最下位になる", () => {
    expect(rankFromExperience(0).id).toBe("jonokuchi");
  });

  it("負のEXPでも最下位を下回らない", () => {
    expect(rankFromExperience(-10).id).toBe("jonokuchi");
  });

  it.each(
    expRanks.map((rank) => [rank.name, rank.id, rank.requiredExperience]),
  )("%s はちょうど必要EXPで昇進する", (_name, id, required) => {
    expect(rankFromExperience(required as number).id).toBe(id);
  });

  it.each(
    expRanks
      .slice(1)
      .map((rank, index) => [
        rank.name,
        rank.requiredExperience,
        expRanks[index].id,
      ]),
  )("%s は必要EXPに1足りないと昇進しない", (_name, required, previousId) => {
    expect(rankFromExperience((required as number) - 1).id).toBe(previousId);
  });

  it("EXPだけでは横綱にならない", () => {
    expect(rankFromExperience(100000).id).toBe("ozeki");
  });

  it("最終試験をクリアすると横綱になる", () => {
    expect(rankFromExperience(0, true).id).toBe("yokozuna");
  });
});

describe("nextRank と experienceToNextRank", () => {
  it("開始直後は次の番付までの差分を返す", () => {
    const second = expRanks[1];
    expect(nextRank(0)?.id).toBe(second.id);
    expect(experienceToNextRank(0)).toBe(second.requiredExperience);
  });

  it("昇進直後は次の番付を指す", () => {
    const second = expRanks[1];
    const third = expRanks[2];
    expect(nextRank(second.requiredExperience)?.id).toBe(third.id);
    expect(experienceToNextRank(second.requiredExperience)).toBe(
      third.requiredExperience - second.requiredExperience,
    );
  });

  it("EXPで到達できる最上位では次がない", () => {
    const highest = expRanks[expRanks.length - 1];
    expect(nextRank(highest.requiredExperience)).toBeNull();
    expect(experienceToNextRank(highest.requiredExperience)).toBeNull();
  });
});

describe("findRank", () => {
  it("IDから番付を引ける", () => {
    expect(findRank("juryo").name).toBe("十両");
  });

  it("最下位を取得できる", () => {
    expect(lowestRank().id).toBe("jonokuchi");
  });
});

describe("番付データ", () => {
  it("設計書のとおり10段階ある", () => {
    expect(ranks).toHaveLength(10);
  });

  it("order が重複せず連番である", () => {
    const orders = ranks.map((rank) => rank.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("必要EXPが番付順に増加する", () => {
    const required = expRanks.map((rank) => rank.requiredExperience);
    const sorted = [...required].sort((a, b) => a - b);
    expect(required).toEqual(sorted);
  });

  it("最終試験を要するのは横綱だけ", () => {
    const finalExamRanks = ranks.filter((rank) => rank.requiresFinalExam);
    expect(finalExamRanks.map((rank) => rank.id)).toEqual(["yokozuna"]);
  });
});
