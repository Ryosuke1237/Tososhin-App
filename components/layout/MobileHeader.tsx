"use client";
import { mockUser } from "@/lib/mockData";
export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div className="logo-icon" style={{ width:"32px", height:"32px", fontSize:"14px" }}>闘</div>
        <span className="logo-text" style={{ fontSize:"15px" }}>闘争心</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
        <button className="btn-icon" style={{ width:"34px", height:"34px" }}>🔔</button>
        <div className="user-avatar-sm">{mockUser.nameInitial}</div>
      </div>
    </header>
  );
}
