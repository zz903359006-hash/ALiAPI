"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [companyName, setCompanyName] = useState("limAPI（银弹科技）");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [taxId, setTaxId] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", margin: 0 }}>
          设置
        </h1>
      </div>

      {/* Company Info */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>企业信息</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>企业名称</span>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", maxWidth: 400 }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
          </label>
          <div>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", display: "block", marginBottom: "var(--spacing-sm)" }}>企业 Logo</span>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-sm)", cursor: "pointer" }}>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoPreview(URL.createObjectURL(file));
              }} />
              <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                )}
              </div>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>点击上传</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alert Preferences */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>预警偏好</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)" }}>余额低于 20% 时发通知给我</span>
          <div
            onClick={() => setAlertEnabled(!alertEnabled)}
            style={{ width: 40, height: 24, borderRadius: "var(--radius-full)", backgroundColor: alertEnabled ? "var(--color-primary)" : "var(--color-surface-card)", cursor: "pointer", position: "relative", transition: "background-color 0.2s", flexShrink: 0 }}
          >
            <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", position: "absolute", top: 2, left: alertEnabled ? 18 : 2, transition: "left 0.2s" }} />
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>开票资料</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>发票抬头 <span style={{ color: "var(--color-error)" }}>*</span></span>
            <input value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} placeholder="企业名称" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", maxWidth: 400 }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>税号 <span style={{ color: "var(--color-error)" }}>*</span></span>
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="纳税人识别号" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", maxWidth: 400 }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>接收邮箱 <span style={{ color: "var(--color-error)" }}>*</span></span>
            <input value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} placeholder="用于接收电子发票" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", maxWidth: 400 }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>开户行</span>
            <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="选填" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", maxWidth: 400 }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>账号</span>
            <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="选填" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", maxWidth: 400 }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
          </label>
        </div>
      </div>

      {/* Submit */}
      <button style={{ height: 40, padding: "0 var(--spacing-xl)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
        保存修改
      </button>
    </div>
  );
}
