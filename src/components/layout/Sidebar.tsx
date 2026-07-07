"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups, type NavItem } from "@/config/nav";
import { isEmployee } from "@/lib/role";

const SIDEBAR_WIDTH = 216;
const HEADER_HEIGHT = 60;

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

function menuIcon(key: string): ReactNode {
  const s = 14;
  switch (key) {
    case "analytics-usage":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case "models":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
    case "playground":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case "api-keys":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>;
    case "billing-center":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
    case "admin-members":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "admin-billing":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
    case "admin-settings":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    default:
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>;
  }
}

export default function Sidebar() {
  const pathname = usePathname();

const EMPLOYEE_KEYS = ["api-keys", "analytics-usage", "playground", "models"];

  const isActive = (item: NavItem): boolean => {
    if (item.path && pathname === item.path) return true;
    return false;
  };

  const visibleItems = isEmployee
    ? navGroups.flat().filter((item) => EMPLOYEE_KEYS.includes(item.key))
    : navGroups[0];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col z-40" style={{ width: SIDEBAR_WIDTH, backgroundColor: C.sidebarBg, borderRight: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between shrink-0" style={{ height: HEADER_HEIGHT, backgroundColor: C.headerBg, borderBottom: `1px solid ${C.borderLight}`, paddingLeft: 16, paddingRight: 12 }}>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", color: "#111827", fontFamily: "var(--font-display)" }}>AliAPI</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF", backgroundColor: C.sidebarBg, padding: "2px 8px", borderRadius: "4px", lineHeight: "18px" }}>v2.0</span>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingTop: 10 }}>
        {visibleItems.map((item) => {
          const active = isActive(item);
          return <NavItemLink key={item.key} item={item} active={active} />;
        })}

        {!isEmployee && (
          <>
            <div style={{ height: 1, backgroundColor: C.borderLight, margin: "var(--spacing-sm) var(--spacing-md)" }} />
            {navGroups[1].map((item) => {
              const active = isActive(item);
              return <NavItemLink key={item.key} item={item} active={active} />;
            })}
          </>
        )}
      </nav>
    </aside>
  );
}

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
