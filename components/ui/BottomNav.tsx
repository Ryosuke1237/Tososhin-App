"use client";

import { Home, CheckSquare, PenLine, Calendar, Bot } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "home",     label: "HOME",     icon: Home },
  { id: "tasks",    label: "TASK",     icon: CheckSquare },
  { id: "record",   label: "RECORD",   icon: PenLine },
  { id: "calendar", label: "CALENDAR", icon: Calendar },
  { id: "ai",       label: "AI",       icon: Bot },
];

export default function BottomNav() {
  const [active, setActive] = useState("home");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        {/* 上部のグロー */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(204,0,0,0.5), transparent)",
          }}
        />
        <div
          className="flex items-center justify-around px-1 py-3"
          style={{
            background: "#000000",
            borderTop: "1px solid #111",
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="flex flex-col items-center gap-1 px-2 py-1 relative"
              >
                {/* アクティブ時の上部インジケーター */}
                {isActive && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-0.5"
                    style={{ background: "#cc0000" }}
                  />
                )}

                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  style={{
                    color: isActive ? "#cc0000" : "#444",
                    transition: "color 0.15s",
                  }}
                />
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: isActive ? 800 : 500,
                    letterSpacing: "0.1em",
                    color: isActive ? "#cc0000" : "#444",
                    transition: "color 0.15s",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
