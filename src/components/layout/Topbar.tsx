"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { getRouteTitle } from "@/config/titles";
import NotificationDrawer from "./NotificationDrawer";
import UpgradeOrgModal from "@/components/UpgradeOrgModal";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getRouteTitle(pathname);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [isOrgMode, setIsOrgMode] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState("personal");
  const workspaces = [
    { id: "personal", label: "个人空间", icon: "🧑‍💻" },
    ...(isOrgMode ? [{ id: "银弹科技", label: "银弹科技", icon: "🏢", subtitle: "角色：管理员" }] : []),
  ];
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}
      <header
        className="sticky top-0 z-30 flex items-center shrink-0"
        style={{
          height: 64,
          backgroundColor: "var(--color-canvas)",
          borderBottom: "1px solid var(--color-hairline)",
          paddingLeft: "var(--spacing-lg)",
          paddingRight: "var(--spacing-lg)",
          gap: "var(--spacing-lg)",
        }}
      >
        {/* Left: Page title */}
        <h1
          className="flex-1 min-w-0 truncate"
          style={{
            fontSize: "var(--text-title-lg)",
            fontWeight: 600,
            lineHeight: "var(--text-title-lg--line-height)",
            letterSpacing: "var(--text-title-lg--letter-spacing)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center" style={{ gap: "var(--spacing-sm)" }}>
          {/* Search placeholder */}
          <button
            className="flex items-center rounded-md transition-colors"
            style={{
              height: 36,
              paddingLeft: "var(--spacing-sm)",
              paddingRight: "var(--spacing-sm)",
              gap: "var(--spacing-xs)",
              fontSize: "var(--text-body-sm)",
              fontWeight: 400,
              color: "var(--color-muted)",
              borderRadius: "var(--radius-md)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface-card)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <SearchIcon />
            <span className="hidden lg:inline">搜索</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-muted-soft)",
                backgroundColor: "var(--color-surface-card)",
                padding: "1px 5px",
                borderRadius: "var(--radius-xs)",
                lineHeight: "16px",
                marginLeft: 2,
              }}
            >
              ⌘K
            </span>
          </button>

          {/* Docs button */}
          <button
            onClick={() => window.location.href = "/docs"}
            className="flex items-center rounded-md transition-colors"
            style={{
              height: 36,
              paddingLeft: "var(--spacing-sm)",
              paddingRight: "var(--spacing-sm)",
              gap: "var(--spacing-xs)",
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: "var(--color-muted)",
              borderRadius: "var(--radius-md)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface-card)";
              e.currentTarget.style.color = "var(--color-ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-muted)";
            }}
          >
            <DocsIcon />
            <span className="hidden lg:inline">文档</span>
          </button>

          {/* Workspace Switcher */}
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentId={currentWorkspace}
            onSwitch={(id) => { setCurrentWorkspace(id); setIsOrgMode(id !== "personal"); }}
            onCreateOrg={() => { setToast("升级组织功能开发中"); setTimeout(() => setToast(""), 2500); }}
          />

          {/* Notifications */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            className="relative flex items-center justify-center rounded-full transition-colors"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-full)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface-card)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <BellIcon />
            <span
              className="absolute top-1 right-1 rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: "var(--color-badge-orange)",
                borderRadius: "var(--radius-full)",
              }}
            />
          </button>

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center rounded-md transition-colors"
              style={{
                height: 36,
                paddingLeft: "var(--spacing-xs)",
                paddingRight: "var(--spacing-xs)",
                gap: "var(--spacing-xs)",
                fontSize: "var(--text-nav-link)",
                fontWeight: 500,
                color: "var(--color-ink)",
                borderRadius: "var(--radius-md)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-surface-card)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <UserAvatar />
              <span className="hidden sm:inline">Hi, User</span>
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-xxs w-48 py-xxs z-50"
                style={{
                  backgroundColor: "var(--color-canvas)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <UserMenuItem onClick={() => { router.push("/settings"); setUserMenuOpen(false); }}>个人资料</UserMenuItem>
                <UserMenuItem onClick={() => { router.push("/settings"); setUserMenuOpen(false); }}>设置 & 偏好</UserMenuItem>
                {isOrgMode ? (
                  <>
                    <UserMenuItem onClick={() => { router.push("/settings/security"); setUserMenuOpen(false); }}>安全与审计中心</UserMenuItem>
                    <UserMenuItem onClick={() => { router.push("/growth/team"); setUserMenuOpen(false); }}>团队 & 员工管理</UserMenuItem>
                  </>
                ) : (
                  <UserMenuItem onClick={() => { setUpgradeOpen(true); setUserMenuOpen(false); }}>升级为组织</UserMenuItem>
                )}
                <div style={{ height: 1, backgroundColor: "var(--color-hairline-soft)", margin: "4px 0" }} />
                <UserMenuItem muted onClick={() => setUserMenuOpen(false)}>退出登录</UserMenuItem>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Upgrade Org Modal */}
      <UpgradeOrgModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} onSuccess={() => { setIsOrgMode(true); setCurrentWorkspace("银弹科技"); setToast("升级成功，正在刷新"); setTimeout(() => setToast(""), 2500); }} />
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 2.5a4 4 0 0 0-4 4v4l-1 1v1h14v-1l-1-1v-4a4 4 0 0 0-4-4H6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 13a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 1h7l3 3v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 1v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserAvatar() {
  return (
    <span
      className="flex items-center justify-center shrink-0"
      style={{
        width: 28,
        height: 28,
        borderRadius: "var(--radius-full)",
        backgroundColor: "var(--color-surface-card)",
        fontSize: "var(--text-caption)",
        fontWeight: 500,
        color: "var(--color-ink)",
      }}
    >
      U
    </span>
  );
}

function UserMenuItem({ children, onClick, muted }: { children: React.ReactNode; onClick: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-md py-xs transition-colors"
      style={{
        fontSize: "var(--text-body-sm)",
        fontWeight: 500,
        color: muted ? "var(--color-muted)" : "var(--color-ink)",
        borderRadius: "var(--radius-xs)",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-card)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {children}
    </button>
  );
}
