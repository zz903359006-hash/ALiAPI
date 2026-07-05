"use client";

export default function CreditsPage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-xl)", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
            充值中心
          </h1>
          <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
            为账户充值，解锁全站所有模型调用能力。
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", textAlign: "center" }}>
        <div style={{ marginBottom: "var(--spacing-md)" }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /><line x1="5" y1="15" x2="9" y2="15" /></svg></div>
        <h2 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-xs)", fontFamily: "var(--font-display)" }}>充值功能即将上线</h2>
        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: "0 0 var(--spacing-lg)", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
          我们正在对接支付渠道，充值功能开发中。您可先前往计费中心查看资产详情。
        </p>
        <a href="/billing" style={{ display: "inline-flex", height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", textDecoration: "none", alignItems: "center", justifyContent: "center" }}>
          返回计费中心
        </a>
      </div>
    </div>
  );
}
