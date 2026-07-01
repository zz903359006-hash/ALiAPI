"use client";

import { usePathname } from "next/navigation";
import { getBreadcrumbs } from "@/config/breadcrumbs";
import { useEffect, useState } from "react";

export default function Breadcrumb() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const check = () => setNarrow(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [mounted]);

  const items = getBreadcrumbs(pathname);
  if (!mounted || items.length <= 1) return null;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: "var(--text-caption)",
        color: "var(--color-muted)",
        marginBottom: "var(--spacing-md)",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {/* Narrow: back arrow */}
      {narrow && (
        <button
          onClick={() => window.history.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "none",
            color: "var(--color-ink)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10.5 3L5.5 8L10.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Breadcrumb items */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", flex: 1 }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              {i > 0 && (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--color-muted)" }}>
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {isLast ? (
                <span
                  style={{
                    fontWeight: 500,
                    color: "var(--color-body)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href || "#"}
                  style={{
                    color: "var(--color-muted)",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-ink)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
                >
                  {item.label}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
