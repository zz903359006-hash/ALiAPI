"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { navItems } from "@/config/nav";

interface CmdItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  type: "page" | "model" | "action";
  action: () => void;
}

const MODELS = [
  { id: "deepseek-v3", label: "DeepSeek V3", desc: "¥0.005 / 1K tokens", icon: "🧠" },
  { id: "gpt-4o", label: "GPT-4o", desc: "¥0.035 / 1K tokens", icon: "🤖" },
  { id: "claude-3.5", label: "Claude 3.5 Sonnet", desc: "¥0.042 / 1K tokens", icon: "🎯" },
  { id: "qwen-max", label: "通义千问 Max", desc: "¥0.028 / 1K tokens", icon: "🌐" },
  { id: "deepseek-v4", label: "DeepSeek V4 Flash", desc: "¥0.002 / 1K tokens", icon: "⚡" },
];

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const allItems: CmdItem[] = [
    ...navItems.map((n) => ({
      id: `page-${n.key}`,
      label: n.label,
      icon: n.key === "dashboard" ? "▦" : n.key === "models" ? "▧" : n.key === "usage-analytics" ? "📊" : n.key === "cost-analytics" ? "💰" : n.key === "api-keys" ? "🔑" : n.key === "auto-routing" ? "≡" : n.key === "billing-center" ? "🏧" : n.key === "billing-records" ? "📄" : n.key === "request-insurance" ? "📈" : n.key === "rankings" ? "🏆" : n.key === "team" ? "👥" : n.key === "invite" ? "✉️" : "📄",
      description: n.path,
      type: "page" as const,
      action: () => { router.push(n.path || "/"); onClose(); },
    })),
    ...MODELS.map((m) => ({
      id: `model-${m.id}`,
      label: m.label,
      description: m.desc,
      icon: m.icon,
      type: "model" as const,
      action: () => { router.push(`/models?search=${encodeURIComponent(m.label)}`); onClose(); },
    })),
    { id: "action-create-key", label: "创建调用 Key", description: "快速创建新的 API Key", icon: "➕", type: "action" as const, action: () => { router.push("/keys/create"); onClose(); } },
    { id: "action-recharge", label: "前往充值", description: "为账户充值", icon: "💳", type: "action" as const, action: () => { router.push("/billing/credits"); onClose(); } },
    { id: "action-docs", label: "查看文档", description: "开发者文档中心", icon: "📖", type: "action" as const, action: () => { router.push("/docs"); onClose(); } },
  ];

  const filtered = query.trim()
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems;

  const groups = [
    { key: "page", label: "页面", items: filtered.filter((i) => i.type === "page") },
    { key: "model", label: "模型", items: filtered.filter((i) => i.type === "model") },
    { key: "action", label: "快捷操作", items: filtered.filter((i) => i.type === "action") },
  ].filter((g) => g.items.length > 0);

  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((p) => Math.min(p + 1, totalItems - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((p) => Math.max(p - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      let idx = 0;
      for (const g of groups) {
        if (idx + g.items.length > selectedIdx) {
          g.items[selectedIdx - idx].action();
          return;
        }
        idx += g.items.length;
      }
    }
    if (e.key === "Escape") { onClose(); }
  };

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${selectedIdx}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIdx]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" style={{ display: "flex", justifyContent: "center", paddingTop: "10vh" }} onClick={onClose}>
      <div
        className="fixed inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "60vh",
          backgroundColor: "var(--color-canvas)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="搜索模型、页面、功能..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "none" }}
          />
          <kbd style={{ fontSize: 11, fontWeight: 500, color: "var(--color-muted)", backgroundColor: "var(--color-surface-card)", padding: "2px 6px", borderRadius: "var(--radius-xs)", lineHeight: "18px", flexShrink: 0 }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ flex: 1, overflow: "auto", padding: "var(--spacing-xs)" }}>
          {groups.length === 0 ? (
            <div style={{ padding: "var(--spacing-xl)", textAlign: "center", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
              未找到匹配结果
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", padding: "var(--spacing-xs) var(--spacing-sm)", marginTop: group.key === "page" ? 0 : "var(--spacing-xs)" }}>
                  {group.label}
                </div>
                {group.items.map((item, itemIdx) => {
                  const globalIdx = groups
                    .slice(0, groups.indexOf(group))
                    .reduce((s, g) => s + g.items.length, 0) + itemIdx;
                  const active = globalIdx === selectedIdx;
                  return (
                    <div
                      key={item.id}
                      data-index={globalIdx}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--spacing-sm)",
                        padding: "8px var(--spacing-sm)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        backgroundColor: active ? "var(--color-surface-card)" : "transparent",
                      }}
                    >
                      <span style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", backgroundColor: active ? "var(--color-surface-soft)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                        {item.icon || "📄"}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{item.label}</div>
                        {item.description && <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>{item.description}</div>}
                      </div>
                      {item.type === "page" && (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--color-muted)" }}>
                          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: "var(--spacing-xs) var(--spacing-md)", borderTop: "1px solid var(--color-hairline-soft)", fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "flex", gap: "var(--spacing-md)" }}>
          <span>↑↓ 导航</span>
          <span>Enter 确认</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}
