"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function LoginPage() {
  const [tab, setTab] = useState<"qrcode" | "phone">("qrcode");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => setCountdown((v) => v - 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [countdown]);

  const handleGetCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) { showToast("请输入正确的手机号"); return; }
    setCountdown(60);
    showToast("验证码已发送");
  };

  const handleLogin = () => {
    if (!phone || !code) { showToast("请填写手机号和验证码"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); window.location.href = "/dashboard"; }, 1000);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Left — Brand panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-surface-dark)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--spacing-xxl)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative element */}
        <div style={{ position: "absolute", top: "-30%", right: "-20%", width: "60%", height: "60%", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "40%", height: "40%", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 400 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: "var(--spacing-lg)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-on-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "var(--color-primary)" }}>
              A
            </div>
            <span style={{ fontSize: 28, fontWeight: 600, color: "var(--color-on-dark)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
              AliAPI
            </span>
          </div>
          <p style={{ fontSize: "var(--text-title-md)", color: "var(--color-on-dark)", lineHeight: 1.6, fontWeight: 400, opacity: 0.85 }}>
            企业级大模型统一网关
          </p>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-dark-soft)", marginTop: "var(--spacing-sm)", lineHeight: 1.6, opacity: 0.65 }}>
            安全、可控、降本增效
          </p>
        </div>
      </div>

      {/* Right — Login card */}
      <div
        style={{
          width: 460,
          flexShrink: 0,
          backgroundColor: "var(--color-canvas)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--spacing-xxl)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Title */}
          <h1 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-lg)", textAlign: "center" }}>
            登录 / 注册
          </h1>

          {/* Tabs */}
          <div style={{ display: "flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-xl)", width: "100%" }}>
            {(["qrcode", "phone"] as const).map((key) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    flex: 1,
                    height: 34,
                    fontSize: "var(--text-nav-link)",
                    fontWeight: 500,
                    color: active ? "var(--color-ink)" : "var(--color-muted)",
                    backgroundColor: active ? "var(--color-canvas)" : "transparent",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {key === "qrcode" ? "扫码登录" : "手机号登录"}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === "qrcode" ? <QrCodeTab /> : <PhoneTab phone={phone} setPhone={setPhone} code={code} setCode={setCode} countdown={countdown} handleGetCode={handleGetCode} handleLogin={handleLogin} loading={loading} />}

          {/* Agreement */}
          <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", textAlign: "center", marginTop: "var(--spacing-xl)", lineHeight: 1.6 }}>
            登录即表示同意
            <a href="#" style={{ color: "var(--color-ink)", textDecoration: "underline", textUnderlineOffset: 2 }}>《用户服务协议》</a>
            与
            <a href="#" style={{ color: "var(--color-ink)", textDecoration: "underline", textUnderlineOffset: 2 }}>《隐私政策》</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function QrCodeTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* QR Code placeholder */}
      <div style={{ position: "relative", width: 200, height: 200, border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-surface-soft)", marginBottom: "var(--spacing-md)" }}>
        {/* Refresh button */}
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "var(--color-canvas)", color: "var(--color-muted)", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M14 8a6 6 0 0 1-11.2 3.2M2 8a6 6 0 0 1 11.2-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 2v4h-4M2 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ textAlign: "center" }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.5 }}>
            <rect x="4" y="4" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="46" y="4" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="4" y="46" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="46" y="46" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="12" y="12" width="14" height="14" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="54" y="12" width="14" height="14" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="12" y="54" width="14" height="14" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="54" y="54" width="14" height="14" rx="2" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        <span key={refreshKey} />
      </div>

      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", textAlign: "center", marginBottom: "var(--spacing-md)" }}>
        请使用 微信 或 支付宝 扫描二维码登录
      </p>

      <button
        style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}
        onClick={() => window.location.href = "https://docs.AliAPI.dev"}
      >
        App 端扫码遇到问题？
      </button>
    </div>
  );
}

function PhoneTab({ phone, setPhone, code, setCode, countdown, handleGetCode, handleLogin, loading }: {
  phone: string; setPhone: (v: string) => void; code: string; setCode: (v: string) => void;
  countdown: number; handleGetCode: () => void; handleLogin: () => void; loading: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      {/* Phone input */}
      <div>
        <div style={{ display: "flex", alignItems: "center", height: 40, width: "100%", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ height: "100%", display: "flex", alignItems: "center", paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", borderRight: "1px solid var(--color-hairline)", backgroundColor: "var(--color-surface-soft)", flexShrink: 0 }}>
            +86
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            style={{ flex: 1, height: "100%", border: "none", outline: "none", padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", background: "none" }}
          />
        </div>
      </div>

      {/* Verification code input */}
      <div>
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="请输入验证码"
            style={{ flex: 1, height: 40, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" }}
          />
          <button
            onClick={handleGetCode}
            disabled={countdown > 0}
            style={{
              height: 40,
              paddingLeft: "var(--spacing-md)",
              paddingRight: "var(--spacing-md)",
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: countdown > 0 ? "var(--color-muted)" : "var(--color-ink)",
              backgroundColor: countdown > 0 ? "var(--color-surface-card)" : "var(--color-canvas)",
              border: "1px solid var(--color-hairline)",
              borderRadius: "var(--radius-md)",
              cursor: countdown > 0 ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {countdown > 0 ? `${countdown}s` : "获取验证码"}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          height: 44,
          width: "100%",
          fontSize: "var(--text-button)",
          fontWeight: 600,
          color: loading ? "var(--color-muted)" : "var(--color-on-primary)",
          backgroundColor: loading ? "var(--color-surface-strong)" : "var(--color-primary)",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "var(--spacing-xs)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {loading && <Spinner />}
        登录 / 注册
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}
