"use client";

import { useState } from "react";
import { getTodayQuote } from "@/lib/mockData";
import { Check } from "lucide-react";

export default function TodayMission() {
  const [completed, setCompleted] = useState(false);
  const todayQuote = getTodayQuote();

  return (
    <div
      className={`card-mission mx-4 animate-fade-in-up${completed ? "" : " glow-red-strong"}`}
      style={{
        animationDelay: "0.15s",
        borderLeftColor: completed ? "#1a6b1a" : "#cc0000",
        boxShadow: completed
          ? "-2px 0 15px rgba(26,107,26,0.2)"
          : "-2px 0 24px rgba(204,0,0,0.3)",
      }}
    >
      {/* ━━━ ヘッダー：ラベル ━━━ */}
      <div
        className="flex items-center justify-between px-5 pt-5 pb-3"
      >
        <div className="flex items-center gap-2">
          <span
            className={completed ? "" : "animate-glove"}
            style={{ fontSize: "18px", display: "inline-block" }}
            role="img"
            aria-label="ボクシンググローブ"
          >
            🥊
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#cc0000",
            }}
          >
            TODAY&apos;S QUOTE
          </span>
        </div>
        <span
          className="animate-flame"
          style={{ fontSize: "18px", display: "inline-block" }}
          role="img"
          aria-label="炎"
        >
          🔥
        </span>
      </div>

      <hr className="red-rule mx-5" />

      {/* ━━━ 名言メイン（大きく表示） ━━━ */}
      <div className="px-5 py-6">
        {/* 開き引用符 */}
        <p
          style={{
            fontSize: "52px",
            fontWeight: 900,
            color: "#cc0000",
            lineHeight: 0.7,
            marginBottom: "8px",
            opacity: 0.9,
          }}
          aria-hidden
        >
          "
        </p>

        {/* 名言テキスト（大きく・太く・力強く） */}
        <p
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.65,
            letterSpacing: "0.01em",
            marginBottom: "20px",
          }}
        >
          {todayQuote.quote}
        </p>

        {/* 閉じ引用符 + 著者 */}
        <div className="flex items-end justify-between">
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#888",
              letterSpacing: "0.08em",
            }}
          >
            — {todayQuote.author}
          </p>
          <p
            style={{
              fontSize: "52px",
              fontWeight: 900,
              color: "#cc0000",
              lineHeight: 0.7,
              opacity: 0.9,
            }}
            aria-hidden
          >
            "
          </p>
        </div>
      </div>

      {/* ━━━ 完了ボタン ━━━ */}
      <div className="px-5 pb-5">
        <button
          onClick={() => setCompleted((prev) => !prev)}
          className={`w-full py-3.5 flex items-center justify-center gap-2 ${
            completed ? "btn-outline-red" : "btn-red"
          }`}
          style={completed ? { borderColor: "#333", color: "#555" } : undefined}
        >
          <Check size={16} strokeWidth={3} />
          <span style={{ fontSize: "13px", letterSpacing: "0.08em" }}>
            {completed ? "取り消す" : "今日の名言を受け取った！"}
          </span>
          {!completed && (
            <span style={{ fontSize: "14px", marginLeft: "2px" }} role="img" aria-label="炎">
              🔥
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
