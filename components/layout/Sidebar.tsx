"use client";

import { useState } from "react";
import { mockUser } from "@/lib/mockData";

const navItems = [
  { id: "dashboard", icon: "🏠", label: "ダッシュボード", badge: null },
  { id: "meal",      icon: "🍽️", label: "食事ログ",       badge: null },
  { id: "chat",      icon: "💬", label: "高橋相談室",      badge: "24h" },
  { id: "plan",      icon: "👑", label: "プラン",          badge: null },
];

export default function Sidebar() {
  const [active, setActive] = useState("dashboard");
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">闘</div>
        <div>
          <div className="logo-text">闘争心</div>
          <div className="logo-sub">CONDITION SYSTEM</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-link${active === item.id ? " active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card-side">
          <div className="user-avatar">{mockUser.nameInitial}</div>
          <div>
            <div className="user-name-side">{mockUser.name}</div>
            <div className="user-rank-side">🥊 {mockUser.rank}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
