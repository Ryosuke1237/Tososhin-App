import type { Metadata } from "next";
import "./globals.css";
import Sidebar      from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";

export const metadata: Metadata = {
  title: "闘争心 — CONDITION SYSTEM",
  description: "行動継続・習慣化・覚醒支援プラットフォーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <MobileHeader />
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
