"use client";

import { useState } from "react";

const inpS: React.CSSProperties = {
  height: 40,
  paddingLeft: "var(--spacing-sm)",
  paddingRight: "var(--spacing-sm)",
  fontSize: "var(--text-body-sm)",
  color: "var(--color-ink)",
  backgroundColor: "var(--color-canvas)",
  border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const selS: React.CSSProperties = {
  ...inpS,
  fontWeight: 400,
  color: "var(--color-body)",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 32,
};

const labS: React.CSSProperties = {
  display: "block",
  fontSize: "var(--text-body-sm)",
  fontWeight: 500,
  color: "var(--color-ink)",
  marginBottom: "var(--spacing-xs)",
};

export default function UpgradeOrgModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [scale, setScale] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      onSuccess?.();
    }, 1000);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          backgroundColor: "var(--color-canvas)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          padding: "var(--spacing-xl)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-lg)" }}>
          <div>
            <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
              升级为组织团队
            </div>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginTop: 6, lineHeight: 1.6, maxWidth: 380 }}>
              升级后，您将成为组织管理员，可统一邀请员工、管理额度分配与团队账单。账户现有的余额与 Key 将自动迁移至组织名下。
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-full)",
              border: "none",
              background: "none",
              color: "var(--color-muted)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div>
            <label style={labS}>
              组织/团队名称 <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <input
              style={inpS}
              placeholder="输入组织或团队名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={labS}>所属行业</label>
            <select style={selS} value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="" disabled>请选择行业</option>
              <option value="internet">互联网</option>
              <option value="finance">金融</option>
              <option value="manufacturing">制造</option>
              <option value="education">教育</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label style={labS}>团队规模</label>
            <select style={selS} value={scale} onChange={(e) => setScale(e.target.value)}>
              <option value="" disabled>请选择团队规模</option>
              <option value="1-10">1-10 人</option>
              <option value="11-50">11-50 人</option>
              <option value="51-200">51-200 人</option>
              <option value="200+">200 人以上</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-xl)" }}>
          <button
            onClick={onClose}
            style={{
              height: 40,
              paddingLeft: "var(--spacing-lg)",
              paddingRight: "var(--spacing-lg)",
              fontSize: "var(--text-button)",
              fontWeight: 600,
              color: "var(--color-ink)",
              backgroundColor: "var(--color-canvas)",
              border: "1px solid var(--color-hairline)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            style={{
              height: 40,
              paddingLeft: "var(--spacing-lg)",
              paddingRight: "var(--spacing-lg)",
              fontSize: "var(--text-button)",
              fontWeight: 600,
              color: loading ? "var(--color-muted)" : "var(--color-on-primary)",
              backgroundColor: loading ? "var(--color-surface-strong)" : "var(--color-primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: !name.trim() || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading && <Spinner />}
            确认升级并创建组织
          </button>
        </div>
      </div>
    </div>
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
