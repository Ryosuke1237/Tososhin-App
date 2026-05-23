"use client";

import { Bell } from "lucide-react";

function getTodayLabel() {
  const now = new Date();
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = weekdays[now.getDay()];
  return `${month}.${String(date).padStart(2, "0")} ${day}`;
}

export default function HeroHeader() {
  return (
    <header className="px-4 pt-12 pb-3">
      {/* 上段：日付 + 通知 */}
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: "11px", color: "#444", letterSpacing: "0.15em", fontWeight: 600 }}>
          {getTodayLabel()}
        </span>
        <button className="relative p-2 -mr-1">
          <Bell size={20} style={{ color: "#777" }} strokeWidth={1.5} />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse-red"
            style={{ background: "#cc0000" }}
          />
        </button>
      </div>

      {/* ロゴ行：🥊 闘争心 🔥 */}
      <div className="flex items-end gap-3">
        {/* グローブ */}
        <span
          className="animate-glove"
          style={{ fontSize: "32px", lineHeight: 1, display: "inline-block" }}
          role="img"
          aria-label="ボクシンググローブ"
        >
          🥊
        </span>

        {/* タイトル */}
        <div>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            闘争心
          </h1>
        </div>

        {/* 炎 */}
        <span
          className="animate-flame animate-flame-glow"
          style={{ fontSize: "28px", lineHeight: 1, display: "inline-block", marginBottom: "2px" }}
          role="img"
          aria-label="炎"
        >
          🔥
        </span>

        {/* サブテキスト */}
        <div className="mb-1 ml-auto">
          <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.25em", color: "#cc0000" }}>
            TOSOSHIN
          </p>
          <p style={{ fontSize: "9px", color: "#444", letterSpacing: "0.1em" }}>
            PROGRAM
          </p>
        </div>
      </div>

      {/* 下の赤いライン */}
      <div
        className="mt-3"
        style={{
          height: "2px",
          background: "linear-gradient(90deg, #cc0000 40%, transparent)",
        }}
      />
    </header>
  );
}
