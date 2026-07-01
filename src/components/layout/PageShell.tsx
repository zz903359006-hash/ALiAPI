"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getRouteTitle } from "@/config/titles";
import Tabs, { type TabItem } from "./Tabs";

interface PageShellProps {
  children?: ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export default function PageShell({ children, tabs, activeTab, onTabChange }: PageShellProps) {
  const pathname = usePathname();

  return (
    <div>
      {/* PageHeader — title + placeholder button */}
      <div
        className="flex items-center"
        style={{
          marginBottom: "var(--spacing-lg)",
          gap: "var(--spacing-md)",
        }}
      >
        <h1
          className="flex-1 min-w-0"
          style={{
            fontSize: "var(--text-display-md)",
            fontWeight: 600,
            lineHeight: "var(--text-display-md--line-height)",
            letterSpacing: "var(--text-display-md--letter-spacing)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-display)",
          }}
        >
          {getRouteTitle(pathname)}
        </h1>

        <button
          style={{
            height: 40,
            paddingLeft: "var(--spacing-lg)",
            paddingRight: "var(--spacing-lg)",
            fontSize: "var(--text-button)",
            fontWeight: 600,
            lineHeight: "var(--text-button--line-height)",
            color: "var(--color-ink)",
            backgroundColor: "var(--color-canvas)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          主操作
        </button>
      </div>

      {/* FilterBar */}
      <div
        style={{
          height: 48,
          marginBottom: "var(--spacing-lg)",
          backgroundColor: "var(--color-surface-card)",
          borderRadius: "var(--radius-lg)",
          paddingLeft: "var(--spacing-md)",
          paddingRight: "var(--spacing-md)",
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-xs)",
        }}
      >
        <FilterChip label="筛选器 A" />
        <FilterChip label="筛选器 B" />
        <FilterChip label="筛选器 C" />
      </div>

      {/* Tabs (optional) */}
      {tabs && activeTab !== undefined && onTabChange && (
        <Tabs tabs={tabs} activeKey={activeTab} onChange={onTabChange} />
      )}

      {/* Content card */}
      <div
        style={{
          backgroundColor: "var(--color-surface-card)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--spacing-xl)",
          minHeight: 200,
        }}
      >
        {children ?? (
          <p
            style={{
              fontSize: "var(--text-body-md)",
              lineHeight: "var(--text-body-md--line-height)",
              color: "var(--color-body)",
            }}
          >
            TODO: 后续根据 PRD 填充内容。
          </p>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 28,
        paddingLeft: "var(--spacing-sm)",
        paddingRight: "var(--spacing-sm)",
        fontSize: "var(--text-body-sm)",
        fontWeight: 400,
        lineHeight: "var(--text-body-sm--line-height)",
        color: "var(--color-muted)",
        backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {label}
    </span>
  );
}
