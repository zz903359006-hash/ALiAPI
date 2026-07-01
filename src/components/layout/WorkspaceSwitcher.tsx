"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Workspace = { id: string; label: string; icon: string; subtitle?: string };

export default function WorkspaceSwitcher({
  workspaces,
  currentId,
  onSwitch,
  onCreateOrg,
}: {
  workspaces: Workspace[];
  currentId: string;
  onSwitch: (id: string) => void;
  onCreateOrg: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = workspaces.find((w) => w.id === currentId) || workspaces[0];

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-md transition-colors"
        style={{
          height: 36,
          paddingLeft: "var(--spacing-xs)",
          paddingRight: "var(--spacing-xs)",
          gap: 4,
          fontSize: "var(--text-body-sm)",
          fontWeight: 500,
          color: "var(--color-ink)",
          borderRadius: "var(--radius-md)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-card)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>{current.icon}</span>
        <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{current.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: "var(--color-muted)", transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-xxs w-56 z-50"
          style={{
            backgroundColor: "var(--color-canvas)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-hairline)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "var(--spacing-xs)",
          }}
        >
          <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", padding: "6px var(--spacing-sm) var(--spacing-xs)" }}>
            切换工作区
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {workspaces.map((w) => {
              const active = w.id === currentId;
              return (
                <button
                  key={w.id}
                  onClick={() => { onSwitch(w.id); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-sm)",
                    padding: "8px var(--spacing-sm)",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: active ? "var(--color-surface-card)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "var(--color-surface-soft)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{w.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--text-body-sm)", fontWeight: active ? 600 : 500, color: "var(--color-ink)", display: "flex", alignItems: "center", gap: 4 }}>
                      {w.label}
                      {active && (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M13.5 4L6 11.5L2.5 8" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {w.subtitle && <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>{w.subtitle}</div>}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, backgroundColor: "var(--color-hairline-soft)", margin: "4px 0" }} />
          <button
            onClick={() => { onCreateOrg(); setOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              padding: "8px var(--spacing-sm)",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "none",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: "var(--color-ink)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-soft)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            创建新组织
          </button>
        </div>
      )}
    </div>
  );
}
