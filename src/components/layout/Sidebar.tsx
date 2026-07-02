"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups, type NavItem } from "@/config/nav";

/* === Fixed dimensions === */
const SIDEBAR_WIDTH = 216;
const HEADER_HEIGHT = 60;

/* === Visual tokens === */
const C = {
  sidebarBg: "#F7F7F8",
  headerBg: "#FFFFFF",
  border: "#E4E4E7",
  borderLight: "#E5E7EB",
  itemText: "#4B5563",
  itemIcon: "#9CA3AF",
  itemHoverBg: "#E5E7EB",
  itemHoverText: "#111827",
  itemActiveBg: "#111827",
  itemActiveText: "#FFFFFF",
} as const;

/* ================================================================
   SVG outline icons (14px)
   ================================================================ */
function menuIcon(key: string): ReactNode {
  const s = 14;
  switch (key) {
    case "dashboard":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "models":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "usage-analytics":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "cost-analytics":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "api-keys":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      );
    case "mgmt-keys":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
        </svg>
      );
    case "auto-routing":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 18l2 2 4-4" /><path d="M8 4h12" /><path d="M8 12h12" /><path d="M8 20h4" />
        </svg>
      );
    case "billing-center":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    case "billing-records":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "request-insurance":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "team":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "rankings":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="21" x2="18" y2="21" /><polyline points="6 14 8 10 12 14 16 6 18 10" /><polyline points="6 10 8 6 12 10 16 4 18 8" />
        </svg>
      );
    case "invite":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" />
        </svg>
      );
  }
}

/* ================================================================
   Sidebar — flat items with dividers, no group headers
   ================================================================ */
export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem): boolean => {
    if (item.path && pathname === item.path) return true;
    return false;
  };

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col z-40" style={{ width: SIDEBAR_WIDTH, backgroundColor: C.sidebarBg, borderRight: `1px solid ${C.border}` }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ height: HEADER_HEIGHT, backgroundColor: C.headerBg, borderBottom: `1px solid ${C.borderLight}`, paddingLeft: 16, paddingRight: 12 }}>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", color: "#111827", fontFamily: "var(--font-display)" }}>ALiAPI</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF", backgroundColor: C.sidebarBg, padding: "2px 8px", borderRadius: "4px", lineHeight: "18px" }}>v2.0</span>
      </div>

      {/* Navigation — flat groups with dividers */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingTop: 10 }}>
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.map((item) => {
              const active = isActive(item);
              return <NavItemLink key={item.key} item={item} active={active} />;
            })}
            {/* Divider between groups (not after last) */}
            {gi < navGroups.length - 1 && <div style={{ height: 1, backgroundColor: C.borderLight, margin: "10px 16px" }} />}
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* ================================================================
   NavItemLink
   ================================================================ */
function NavItemLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.path ?? "#"}
      className="flex items-center mx-2 rounded-lg transition-colors"
      style={{
        height: 40, paddingLeft: 24, paddingRight: 12, gap: 10,
        fontSize: 13, fontWeight: 500, lineHeight: "40px",
        color: active ? C.itemActiveText : C.itemText,
        backgroundColor: active ? C.itemActiveBg : "transparent",
        borderRadius: "8px",
      }}
      onMouseEnter={(e) => { if (active) return; e.currentTarget.style.backgroundColor = C.itemHoverBg; e.currentTarget.style.color = C.itemHoverText; }}
      onMouseLeave={(e) => { if (active) return; e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = C.itemText; }}
    >
      <span className="flex items-center justify-center shrink-0" style={{ width: 14, height: 14 }}>{menuIcon(item.key)}</span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
