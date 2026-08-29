"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { GameShell } from "@/components/game/GameShell";
import { PixelWindow } from "@/components/game/PixelWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelLink } from "@/components/ui/PixelLink";
import { useGame } from "@/hooks/useGame";
import {
  PLAYER_NAME_MAX_LENGTH,
  playerNameErrorMessage,
  validatePlayerName,
  type PlayerNameError,
} from "@/lib/playerName";
import styles from "./page.module.css";

// 名前入力画面。設計書「6.2 名前入力」。
//
// 決定すると初期セーブを作り、マップへ進む。
// 入力規則の判定は lib/playerName.ts が持つ。

export default function NewGamePage() {
  const router = useRouter();
  const { dispatch } = useGame();
  const [name, setName] = useState("");
  const [error, setError] = useState<PlayerNameError | null>(null);
  const inputId = useId();
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validatePlayerName(name);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    dispatch({
      type: "START_NEW_GAME",
      playerName: result.name,
      now: new Date().toISOString(),
    });
    router.push("/map");
  }

  return (
    <GameShell title="なまえを きめる">
      <PixelWindow heading="しこ名">
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.label} htmlFor={inputId}>
            あなたのしこ名は？
          </label>

          <input
            id={inputId}
            className={styles.input}
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            aria-invalid={error !== null}
            aria-describedby={error ? errorId : undefined}
            autoComplete="off"
          />

          <p className={styles.hint}>
            1〜{PLAYER_NAME_MAX_LENGTH}文字。前後の空白は取り除かれます。
          </p>

          {error ? (
            <p id={errorId} className={styles.error} role="alert">
              {playerNameErrorMessage(error)}
            </p>
          ) : null}

          <div className={styles.actions}>
            <PixelButton type="submit" variant="primary">
              けってい
            </PixelButton>
            <PixelLink href="/">やめる</PixelLink>
          </div>
        </form>
      </PixelWindow>
    </GameShell>
  );
}
