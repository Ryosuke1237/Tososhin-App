"use client";

export default function QuickActions() {
  return (
    <div
      className="mx-4 animate-fade-in-up"
      style={{ animationDelay: "0.25s" }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "#555",
          marginBottom: "12px",
        }}
      >
        QUICK ACTION
      </p>
      <div className="flex gap-2.5">
        {/* 行動を記録する */}
        <button
          className="btn-red flex-1 flex items-center justify-center gap-2 py-4"
        >
          <span style={{ fontSize: "16px" }} role="img" aria-label="グローブ">🥊</span>
          <span style={{ fontSize: "12px", letterSpacing: "0.04em" }}>
            RECORD&nbsp;
            <span style={{ fontWeight: 500 }}>行動記録</span>
          </span>
        </button>

        {/* タスクを追加する */}
        <button
          className="btn-outline-red flex-1 flex items-center justify-center gap-2 py-4"
        >
          <span
            className="animate-flame"
            style={{ fontSize: "16px", display: "inline-block" }}
            role="img"
            aria-label="炎"
          >
            🔥
          </span>
          <span style={{ fontSize: "12px", letterSpacing: "0.04em" }}>
            ADD&nbsp;
            <span style={{ fontWeight: 500 }}>タスク追加</span>
          </span>
        </button>
      </div>
    </div>
  );
}
