import {
  RANK_IDS,
  STAGE_IDS,
  type PlayerSave,
  type RankId,
  type StageId,
  type StageProgress,
  type StageStatus,
} from "@/types/game";

// セーブデータの検証。
// 設計書「11. localStorage設計」の読み込み手順のうち、2〜3（JSON解析とバージョン・必須項目の検証）を担う。
//
// 重要な方針として、検証に失敗してもデータを消さない。
// 破損とみなして削除すると、復旧の余地なく進行が失われる。
// 呼び出し側は失敗理由を受け取り、タイトルで復旧案内を出す（設計書「16. エラー・例外設計」）。

/** 現行スキーマのバージョン。 */
export const SAVE_VERSION = 1;

/** localStorage に入れる外側の入れ物。 */
export type SaveEnvelope = {
  version: typeof SAVE_VERSION;
  data: PlayerSave;
};

/** 検証に失敗した理由。画面に出す案内の出し分けに使う。 */
export type SaveErrorReason =
  /** JSONとして解析できない。 */
  | "invalidJson"
  /** 将来のバージョンなど、このコードが解釈できない。 */
  | "unsupportedVersion"
  /** 必須項目の欠落や型の不一致。 */
  | "invalidShape";

export type ParseResult =
  { ok: true; data: PlayerSave } | { ok: false; reason: SaveErrorReason };

const STAGE_STATUSES: readonly StageStatus[] = [
  "locked",
  "unlocked",
  "lessonCompleted",
  "cleared",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

/** 有限の数値であること。NaN と Infinity は不正として扱う。 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStageProgress(value: unknown): value is StageProgress {
  if (!isRecord(value)) return false;
  if (!STAGE_STATUSES.includes(value.status as StageStatus)) return false;
  if (!isFiniteNumber(value.bestScore)) return false;
  if (!isFiniteNumber(value.attempts)) return false;
  if (value.clearedAt !== undefined && typeof value.clearedAt !== "string") {
    return false;
  }
  return true;
}

function isStageProgressMap(
  value: unknown,
): value is Record<StageId, StageProgress> {
  if (!isRecord(value)) return false;
  // 既知のステージがすべて揃っていること。欠けていると画面側で undefined を踏む。
  return STAGE_IDS.every((stageId) => isStageProgress(value[stageId]));
}

function isQuizHistory(value: unknown): value is PlayerSave["quizHistory"] {
  if (!Array.isArray(value)) return false;
  return value.every((attempt) => {
    if (!isRecord(attempt)) return false;
    if (!STAGE_IDS.includes(attempt.stageId as StageId)) return false;
    if (!isFiniteNumber(attempt.score)) return false;
    if (!isFiniteNumber(attempt.total)) return false;
    return typeof attempt.answeredAt === "string";
  });
}

/** PlayerSave として必要な項目がすべて揃っているか。 */
export function isPlayerSave(value: unknown): value is PlayerSave {
  if (!isRecord(value)) return false;
  if (value.version !== SAVE_VERSION) return false;
  if (typeof value.playerName !== "string") return false;
  if (!isFiniteNumber(value.experience)) return false;
  if (!RANK_IDS.includes(value.rankId as RankId)) return false;
  if (!isStageProgressMap(value.stageProgress)) return false;
  if (!isStringArray(value.learnedTechniqueIds)) return false;
  if (!isStringArray(value.discoveredTermIds)) return false;
  if (!isStringArray(value.rewardedLessonIds)) return false;
  if (!isStringArray(value.rewardedQuizIds)) return false;
  if (!isQuizHistory(value.quizHistory)) return false;
  if (typeof value.createdAt !== "string") return false;
  if (typeof value.updatedAt !== "string") return false;
  return true;
}

/**
 * localStorage から読んだ文字列を検証して PlayerSave にする。
 * 失敗しても入力は変更しない。呼び出し側で削除しないこと。
 */
export function parseSave(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "invalidJson" };
  }

  if (!isRecord(parsed)) {
    return { ok: false, reason: "invalidShape" };
  }

  // 将来のバージョンはここで migration 関数に渡す（設計書「11.」）。
  if (parsed.version !== SAVE_VERSION) {
    return { ok: false, reason: "unsupportedVersion" };
  }

  if (!isPlayerSave(parsed.data)) {
    return { ok: false, reason: "invalidShape" };
  }

  return { ok: true, data: parsed.data };
}

/** PlayerSave を保存用の入れ物に包む。 */
export function toSaveEnvelope(data: PlayerSave): SaveEnvelope {
  return { version: SAVE_VERSION, data };
}
