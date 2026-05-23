"use client";

import { mockUser } from "@/lib/mockData";

export default function RankBadge() {
  const { name, rank, rankProgress, nextRank } = mockUser;

  return (
    <div
      className="card mx-4 p-4 animate-fade-in-up"
      style={{ animationDelay: "0.05s" }}
    >
      <div className="flex items-center justify-between mb-4">
        {/* 挨拶 */}
        <div>
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#555" }}>
            FIGHTER
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="animate-glove"
              style={{ fontSize: "18px", display: "inline-block" }}
              role="img"
              aria-label="グローブ"
            >
              🥊
            </span>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {name}
            </span>
          </div>
        </div>

        {/* ランクバッジ：シールド風 */}
        <div
          style={{
            clipPath: "polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)",
            background: "#cc0000",
            width: "64px",
            height: "72px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "14px" }} role="img" aria-label="グローブ">🥊</span>
          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.75)" }}>
            RANK
          </span>
          <span style={{ fontSize: "11px", fontWeight: 900, color: "#fff", lineHeight: 1.1, textAlign: "center" }}>
            {rank}
          </span>
        </div>
      </div>

      {/* 進捗バー */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span style={{ fontSize: "10px", color: "#555" }}>
            🔥 NEXT → {nextRank}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 900, color: "#cc0000" }}>
            {rankProgress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden" style={{ background: "#1a1a1a", borderRadius: "0" }}>
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${rankProgress}%`,
              background: "#cc0000",
              boxShadow: "2px 0 10px rgba(204,0,0,0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
