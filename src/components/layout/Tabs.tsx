"use client";

import type { ReactNode } from "react";

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div>
      {/* Tab bar — Cal category-tab + nav-pill-group adaptation */}
      <div
        className="flex"
        style={{
          padding: "var(--spacing-xxs)",
          backgroundColor: "var(--color-surface-card)",
          borderRadius: "var(--radius-md)",
          display: "inline-flex",
          gap: 0,
          marginBottom: "var(--spacing-lg)",
        }}
      >
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              style={{
                height: 34,
                paddingLeft: "var(--spacing-md)",
                paddingRight: "var(--spacing-md)",
                fontSize: "var(--text-nav-link)",
                fontWeight: 500,
                lineHeight: "var(--text-nav-link--line-height)",
                color: active ? "var(--color-ink)" : "var(--color-muted)",
                backgroundColor: active
                  ? "var(--color-canvas)"
                  : "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {tabs.find((t) => t.key === activeKey)?.content}
      </div>
    </div>
  );
}
