// プレイヤー名の検証。
// 設計書「6.2 名前入力」の規則を実装する。ただし文字数上限は ADR-0008 が正とする。
//
// 画面から切り離しておくことで、境界値を単体テストで確かめられる。

export const PLAYER_NAME_MIN_LENGTH = 1;
// 上限は ADR-0008 で12から10に変更した。
// 入力欄と保存検証の双方がこの値を参照する。二重管理にすると片方だけ動かせてしまう。
export const PLAYER_NAME_MAX_LENGTH = 10;

export type PlayerNameError = "empty" | "tooLong";

export type PlayerNameResult =
  { ok: true; name: string } | { ok: false; error: PlayerNameError };

/** 前後の空白を除去する。全角空白も対象にする。 */
export function normalizePlayerName(input: string): string {
  return input.replace(/^[\s　]+|[\s　]+$/g, "");
}

/** 名前を検証する。戻り値の name は正規化済み。 */
export function validatePlayerName(input: string): PlayerNameResult {
  const name = normalizePlayerName(input);

  if (name.length < PLAYER_NAME_MIN_LENGTH) {
    return { ok: false, error: "empty" };
  }
  // サロゲートペアを1文字として数える。絵文字を含む名前で長さがずれないようにする。
  if ([...name].length > PLAYER_NAME_MAX_LENGTH) {
    return { ok: false, error: "tooLong" };
  }

  return { ok: true, name };
}

/** 入力欄に出すエラー文言。 */
export function playerNameErrorMessage(error: PlayerNameError): string {
  switch (error) {
    case "empty":
      return "なまえを入力してください。";
    case "tooLong":
      return `なまえは${PLAYER_NAME_MAX_LENGTH}文字までです。`;
  }
}
