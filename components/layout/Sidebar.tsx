"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mockData";

const navItems = [
  { id: "dashboard", icon: "🏠", label: "ダッシュボード", badge: null,  href: "/"     },
  { id: "meal",      icon: "🍽️", label: "食事ログ",       badge: null,  href: "/meal" },
  { id: "chat",      icon: "💬", label: "高橋相談室",      badge: "24h", href: "/chat" },
  { id: "plan",      icon: "👑", label: "プラン",          badge: null,  href: "/plan" },
];

export default function Sidebar() {
  const pathname = usePathname();

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
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </Link>
          );
        })}
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
