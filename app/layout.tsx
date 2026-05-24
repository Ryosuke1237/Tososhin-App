import type { Metadata } from "next";
import "./globals.css";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav    from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "闘争心 — CONDITION SYSTEM",
  description: "行動継続・習慣化・覚醒支援プラットフォーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <MobileHeader />
        <main className="main-content">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
