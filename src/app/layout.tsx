import type { Metadata } from "next";
import { GameProvider } from "@/context/GameProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUMO QUEST",
  description: "相撲をレトロRPG風に学ぶWebコンテンツ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
