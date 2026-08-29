import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider } from "@/context/GameProvider";
import { lessons } from "@/data/lessons";
import { SAVE_KEY } from "@/lib/storage";
import { toSaveEnvelope } from "@/lib/validation";
import { createSave } from "@/test/fixtures";
import type { PlayerSave } from "@/types/game";
import { StageScreen } from "./StageScreen";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

// 設計書「6.4 学習」。
// P1-10 の完了条件は「1画面1メッセージ、進捗表示、最後まで進んだ時点で完了」。

const lesson = lessons[0];

function storeSave(save: PlayerSave = createSave()) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(save)));
}

function renderStage(stageId = "sumo-stable") {
  return render(
    <GameProvider>
      <StageScreen stageId={stageId} />
    </GameProvider>,
  );
}

function saved(): PlayerSave | undefined {
  const raw = window.localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw).data : undefined;
}

/** 最後のメッセージまで進める。 */
async function readAll(user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < lesson.messages.length - 1; i += 1) {
    await user.click(screen.getByRole("button", { name: "つぎへ" }));
  }
  await user.click(screen.getByRole("button", { name: "よみおわった" }));
}

beforeEach(() => {
  window.localStorage.clear();
  push.mockClear();
  replace.mockClear();
});

describe("学習画面", () => {
  it("1画面に1メッセージだけ表示する", async () => {
    storeSave();
    renderStage();

    await waitFor(() =>
      expect(screen.getByText(lesson.messages[0])).toBeInTheDocument(),
    );
    expect(screen.queryByText(lesson.messages[1])).not.toBeInTheDocument();
  });

  it("進捗を表示する", async () => {
    const user = userEvent.setup();
    storeSave();
    renderStage();

    await waitFor(() =>
      expect(
        screen.getByText(`1 / ${lesson.messages.length}`),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "つぎへ" }));
    expect(
      screen.getByText(`2 / ${lesson.messages.length}`),
    ).toBeInTheDocument();
  });

  it("最初のメッセージでは戻れない", async () => {
    storeSave();
    renderStage();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "もどる" })).toBeDisabled(),
    );
  });

  it("前のメッセージに戻れる", async () => {
    const user = userEvent.setup();
    storeSave();
    renderStage();

    await waitFor(() =>
      expect(screen.getByText(lesson.messages[0])).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "つぎへ" }));
    await user.click(screen.getByRole("button", { name: "もどる" }));

    expect(screen.getByText(lesson.messages[0])).toBeInTheDocument();
  });

  it("開いただけでは完了にならない", async () => {
    const user = userEvent.setup();
    storeSave();
    renderStage();

    await waitFor(() =>
      expect(screen.getByText(lesson.messages[0])).toBeInTheDocument(),
    );
    // 途中まで進めても完了しない。
    await user.click(screen.getByRole("button", { name: "つぎへ" }));

    expect(saved()?.rewardedLessonIds).toEqual([]);
    expect(saved()?.stageProgress["sumo-stable"].status).toBe("unlocked");
    expect(
      screen.queryByRole("link", { name: "取組へ" }),
    ).not.toBeInTheDocument();
  });

  it("最後まで進むと完了し、EXPと技・用語が入る", async () => {
    const user = userEvent.setup();
    storeSave();
    renderStage();

    await waitFor(() =>
      expect(screen.getByText(lesson.messages[0])).toBeInTheDocument(),
    );
    await readAll(user);

    await waitFor(() =>
      expect(saved()?.stageProgress["sumo-stable"].status).toBe(
        "lessonCompleted",
      ),
    );
    expect(saved()?.experience).toBe(10);
    expect(saved()?.learnedTechniqueIds).toEqual(lesson.unlockTechniqueIds);
    expect(saved()?.discoveredTermIds).toEqual(lesson.discoverTermIds);
    expect(screen.getByRole("link", { name: "取組へ" })).toHaveAttribute(
      "href",
      "/battle/sumo-stable",
    );
  });

  it("読み終えた通知を出す", async () => {
    const user = userEvent.setup();
    storeSave();
    renderStage();

    await waitFor(() =>
      expect(screen.getByText(lesson.messages[0])).toBeInTheDocument(),
    );
    await readAll(user);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "あたらしい ことばと わざを おぼえた。",
    );
  });

  it("知らないステージIDではマップへ戻す", async () => {
    storeSave();
    renderStage("unknown-stage");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/map"));
    expect(
      screen.getByRole("region", { name: "その場所はありません" }),
    ).toBeInTheDocument();
  });

  it("未解放のステージへの直リンクはマップへ戻す", async () => {
    storeSave();
    renderStage("dohyo");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/map"));
    expect(
      screen.getByRole("region", { name: "まだ行けません" }),
    ).toBeInTheDocument();
  });

  it("中身がないステージでは準備中を出す", async () => {
    storeSave(
      createSave({
        stageProgress: {
          ...createSave().stageProgress,
          dohyo: { status: "unlocked", bestScore: 0, attempts: 0 },
        },
      }),
    );
    renderStage("dohyo");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "準備中" }),
      ).toBeInTheDocument(),
    );
  });

  it("セーブがない場合はタイトルへ戻す", async () => {
    renderStage();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(
      screen.getByRole("region", { name: "記録がありません" }),
    ).toBeInTheDocument();
  });
});
