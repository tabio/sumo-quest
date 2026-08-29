"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { clearSave, loadSave, writeSave } from "@/lib/storage";
import {
  gameReducer,
  initialGameState,
  type GameAction,
  type GameState,
} from "@/context/gameReducer";

// アプリ全体のゲーム状態。
// 設計書「10. 状態管理」に対応する。
//
// Reducer は純粋関数のまま保ち、localStorage への書き込みはここで行う。
// 初回マウント前には localStorage に触れない（静的エクスポート時の window 未定義を避ける）。

export type GameContextValue = {
  state: GameState;
  dispatch: (action: GameAction) => void;
  /** 保存を削除して初期状態に戻す。利用者が明示的に選んだ場合にのみ呼ぶ。 */
  resetGame: () => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // 直前に保存したセーブ。同じ内容の再書き込みを避けるために持つ。
  const lastSavedRef = useRef<GameState["save"]>(null);

  // 初回マウント後に読み込む。サーバー側では実行されない。
  useEffect(() => {
    const result = loadSave();
    lastSavedRef.current = result.status === "loaded" ? result.data : null;
    dispatch({ type: "LOAD_GAME", result });
  }, []);

  // 進行が変わるたびに同期保存する（設計書「11. 書き込み」）。
  useEffect(() => {
    const { save, status } = state;
    if (status.kind === "loading") return;
    if (!save) return;
    if (save === lastSavedRef.current) return;

    const result = writeSave(save);
    if (result.ok) {
      lastSavedRef.current = save;
      dispatch({ type: "SAVE_SUCCEEDED" });
    } else {
      // 保存に失敗してもプレイは続けさせる（R-6）。
      dispatch({ type: "SAVE_FAILED" });
    }
  }, [state]);

  const resetGame = useCallback(() => {
    clearSave();
    lastSavedRef.current = null;
    dispatch({ type: "RESET_GAME" });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({ state, dispatch, resetGame }),
    [state, resetGame],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
