"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { navItems } from "@/config/nav";

interface CmdItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  type: "page" | "model" | "action";
  action: () => void;
}

const MODELS = [
  { id: "deepseek-v3", label: "DeepSeek V3", desc: "¥0.005 / 1K tokens", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 10" /></svg> },
  { id: "gpt-4o", label: "GPT-4o", desc: "¥0.035 / 1K tokens", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
  { id: "claude-3.5", label: "Claude 3.5 Sonnet", desc: "¥0.042 / 1K tokens", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg> },
  { id: "qwen-max", label: "通义千问 Max", desc: "¥0.028 / 1K tokens", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
  { id: "deepseek-v4", label: "DeepSeek V4 Flash", desc: "¥0.002 / 1K tokens", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
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

  const pageIcon = (key: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
      models: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
      "usage-analytics": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
      "cost-analytics": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h6a2 2 0 0 1 0 4H8" /></svg>,
      "api-keys": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
      "auto-routing": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
      "billing-center": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
      "billing-records": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
      "request-insurance": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
      rankings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z" /><path d="M4 22h16" /><path d="M10 22V8h4v14" /><path d="M10 8h4" /><circle cx="12" cy="5" r="1" /></svg>,
      team: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      invite: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    };
    return icons[key] || <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
  };

  const allItems: CmdItem[] = [
    ...navItems.map((n) => ({
      id: `page-${n.key}`,
      label: n.label,
      icon: pageIcon(n.key),
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
    { id: "action-create-key", label: "创建调用 Key", description: "快速创建新的 Key", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>, type: "action" as const, action: () => { router.push("/keys/create"); onClose(); } },
    { id: "action-recharge", label: "前往充值", description: "为账户充值", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /><line x1="5" y1="15" x2="9" y2="15" /></svg>, type: "action" as const, action: () => { router.push("/billing/credits"); onClose(); } },
    { id: "action-docs", label: "查看文档", description: "开发者文档中心", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>, type: "action" as const, action: () => { router.push("/docs"); onClose(); } },
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
      <div className="fixed inset-0" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} />
      <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: "calc(100vw - 32px)", maxHeight: "60vh", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }} onKeyDown={handleKeyDown} placeholder="搜索模型、页面、功能..." style={{ flex: 1, border: "none", outline: "none", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "none" }} />
          <kbd style={{ fontSize: 11, fontWeight: 500, color: "var(--color-muted)", backgroundColor: "var(--color-surface-card)", padding: "2px 6px", borderRadius: "var(--radius-xs)", lineHeight: "18px", flexShrink: 0 }}>ESC</kbd>
        </div>
        <div ref={listRef} style={{ flex: 1, overflow: "auto", padding: "var(--spacing-xs)" }}>
          {groups.length === 0 ? (
            <div style={{ padding: "var(--spacing-xl)", textAlign: "center", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>未找到匹配结果</div>
          ) : groups.map((group) => (
            <div key={group.key}>
              <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", padding: "var(--spacing-xs) var(--spacing-sm)", marginTop: group.key === "page" ? 0 : "var(--spacing-xs)" }}>{group.label}</div>
              {group.items.map((item, itemIdx) => {
                const globalIdx = groups.slice(0, groups.indexOf(group)).reduce((s, g) => s + g.items.length, 0) + itemIdx;
                const active = globalIdx === selectedIdx;
                return (
                  <div key={item.id} data-index={globalIdx} onClick={item.action} onMouseEnter={() => setSelectedIdx(globalIdx)} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "8px var(--spacing-sm)", borderRadius: "var(--radius-sm)", cursor: "pointer", backgroundColor: active ? "var(--color-surface-card)" : "transparent" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", backgroundColor: active ? "var(--color-surface-soft)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{item.label}</div>
                      {item.description && <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>{item.description}</div>}
                    </div>
                    {item.type === "page" && <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--color-muted)" }}><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding: "var(--spacing-xs) var(--spacing-md)", borderTop: "1px solid var(--color-hairline-soft)", fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "flex", gap: "var(--spacing-md)" }}>
          <span>↑↓ 导航</span><span>Enter 确认</span><span>Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}