"use client";

import { useState } from "react";

export default function QuickKeyModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (name: string, key: string) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const key = `sk-${Array.from({ length: 48 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
      setLoading(false);
      onSuccess(name.trim(), key);
    }, 600);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60]" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 400, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "var(--spacing-xl)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
            <span style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>新建快速 Key</span>
            <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>

          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginBottom: "var(--spacing-lg)", lineHeight: 1.6 }}>
            快速 Key 使用默认路由策略（性价比优先），适用于开发和测试。如需精细配置请使用完整创建向导。
          </p>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>Key 名称 <span style={{ color: "var(--color-error)" }}>*</span></span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：开发环境 Key"
              autoFocus
              style={{ height: 40, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)" }}>
            <button onClick={onClose} style={{ height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || loading}
              style={{ height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: loading ? "var(--color-muted)" : "var(--color-on-primary)", backgroundColor: loading ? "var(--color-surface-strong)" : "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              {loading && <Spinner />}
              立即创建
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}
