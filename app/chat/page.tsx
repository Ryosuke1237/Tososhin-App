"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "trainer" | "user";
  text: string;
  time: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "trainer",
    text: "お疲れ様です。今日のコンディションはどうですか？\n食事・トレーニング・メンタル、何でも相談してください。",
    time: "10:00",
  },
];

const QUICK_REPLIES = [
  "食事を記録したい",
  "今日の栄養バランスは？",
  "トレーニングのアドバイス",
  "サプリ相談",
  "運動前の食事",
  "モチベーションが上がらない",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isSending) return;

    const now = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

    // ユーザーメッセージ追加
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      time: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    // AIの返答（仮）
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "trainer",
        text: "（AI機能は近日実装予定です）",
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsSending(false);
    }, 800);
  };

  return (
    <div style={{
      height: "calc(100svh - 54px - 64px)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── チャットヘッダー ── */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "var(--dark)",
        flexShrink: 0,
      }}>
        <div className="trainer-avatar" style={{ width: "42px", height: "42px", fontSize: "15px", position: "relative" }}>
          高
          <span className="online-dot" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "14px" }}>高橋 代表</div>
          <div style={{ fontSize: "10px", color: "var(--green)", marginTop: "2px" }}>● オンライン中</div>
        </div>
        <span className="live-badge" style={{ marginLeft: "auto" }}>
          <span className="live-dot" />LIVE
        </span>
      </div>

      {/* ── メッセージエリア ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`msg-row${msg.role === "user" ? " user" : ""}`}>
            {msg.role === "trainer" && (
              <div className="msg-avatar-sm msg-avatar-trainer">高</div>
            )}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div
                className={`msg-bubble${msg.role === "user" ? " user" : ""}`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.text}
              </div>
              <span className="msg-time">{msg.time}</span>
            </div>
            {msg.role === "user" && (
              <div className="msg-avatar-sm msg-avatar-user">R</div>
            )}
          </div>
        ))}

        {/* 入力中インジケーター */}
        {isSending && (
          <div className="msg-row">
            <div className="msg-avatar-sm msg-avatar-trainer">高</div>
            <div className="msg-bubble" style={{ color: "var(--gray)", letterSpacing: "4px" }}>
              ・・・
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── クイックリプライ ── */}
      <div style={{
        padding: "8px 16px",
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        flexShrink: 0,
        borderTop: "1px solid var(--border)",
        background: "rgba(255,255,255,0.01)",
        WebkitOverflowScrolling: "touch" as const,
        scrollbarWidth: "none" as const,
      }}>
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            disabled={isSending}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--gray-l)",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* ── 入力エリア ── */}
      <div style={{
        padding: "10px 16px 14px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        borderTop: "1px solid var(--border)",
        background: "var(--dark)",
        flexShrink: 0,
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="高橋代表に相談する..."
          disabled={isSending}
          style={{
            flex: 1,
            padding: "11px 16px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            color: "var(--white)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isSending}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "none",
            background: !input.trim() || isSending ? "var(--border)" : "var(--red)",
            color: "var(--white)",
            fontSize: "20px",
            cursor: !input.trim() || isSending ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            flexShrink: 0,
            boxShadow: !input.trim() || isSending ? "none" : "0 4px 12px var(--red-glow)",
          }}
        >
          ▶
        </button>
      </div>

    </div>
  );
}
