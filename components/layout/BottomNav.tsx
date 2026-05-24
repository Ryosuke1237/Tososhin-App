"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "dashboard", icon: "🏠", label: "ホーム",      href: "/"         },
  { id: "meal",      icon: "🍽️", label: "食事",        href: "/meal"     },
  { id: "training",  icon: "🥊", label: "トレーニング", href: "/training" },
  { id: "chat",      icon: "💬", label: "相談室",       href: "/chat"     },
  { id: "plan",      icon: "👑", label: "プラン",       href: "/plan"     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: "64px",
      background: "#0a0a0a",
      borderTop: "1px solid #1f1f1f",
      display: "flex",
      alignItems: "stretch",
      zIndex: 100,
    }}>
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              textDecoration: "none",
              color: isActive ? "#cc0000" : "#555",
              borderTop: isActive ? "2px solid #cc0000" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px" }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
