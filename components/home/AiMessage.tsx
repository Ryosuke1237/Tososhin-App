"use client";

export default function AiMessage() {
  return (
    <div
      className="card mx-4 p-5 animate-fade-in-up"
      style={{ animationDelay: "0.2s" }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="animate-flame"
            style={{ fontSize: "16px", display: "inline-block" }}
            role="img"
            aria-label="炎"
          >
            🔥
          </span>
          <span className="label-en">AI COACH</span>
        </div>
        <span style={{ fontSize: "9px", color: "#444", letterSpacing: "0.1em" }}>
          今日 7:00
        </span>
      </div>

      <hr className="red-rule mb-4" />

      {/* 引用符 + メッセージ */}
      <div className="relative pl-5">
        <span
          className="absolute top-0 left-0"
          style={{ fontSize: "30px", fontWeight: 900, color: "#cc0000", lineHeight: 0.85 }}
          aria-hidden
        >
          &ldquo;
        </span>

        <p style={{ fontSize: "15px", fontWeight: 700, color: "#e8e8e8", lineHeight: 1.75 }}>
          昨日も行動した。今日も動け。止まった瞬間、夢は遠ざかる。まず1件だけ電話しろ。
        </p>

        <div className="flex items-center justify-end gap-2 mt-2">
          <span
            style={{ fontSize: "30px", fontWeight: 900, color: "#cc0000", lineHeight: 0.85 }}
            aria-hidden
          >
            &rdquo;
          </span>
          <span
            className="animate-glove"
            style={{ fontSize: "18px", display: "inline-block" }}
            role="img"
            aria-label="グローブ"
          >
            🥊
          </span>
        </div>
      </div>
    </div>
  );
}
