"use client";

import { useState, useEffect, useRef } from "react";

type ViewState = "form" | "loading" | "success" | "already-joined";

export default function InvitePage() {
  const [view, setView] = useState<ViewState>("form");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const phone = "139****5678";

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => setCountdown((v) => v - 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [countdown]);

  const handleGetCode = () => {
    setCountdown(60);
    showToast("验证码已发送");
  };

  const handleSubmit = () => {
    if (!code) { showToast("请输入验证码"); return; }
    setView("loading");
    setTimeout(() => setView("success"), 1200);
    setTimeout(() => { window.location.href = "/dashboard"; }, 3000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-surface-soft)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-md)" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      <div style={{ width: 420, maxWidth: "100%", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        {/* Top: Company info */}
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "var(--spacing-md)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "var(--color-on-primary)" }}>
              S
            </div>
            <span style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
              某某科技有限公司
            </span>
          </div>
          <h1 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-xs)" }}>
            {view === "already-joined" ? "您已加入该组织" : "加入 某某科技有限公司"}
          </h1>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", lineHeight: 1.6 }}>
            张三（管理员）邀请您加入 AliAPI 平台团队
          </p>
        </div>

        {/* Body */}
        {view === "success" ? (
          <SuccessView />
        ) : view === "loading" ? (
          <LoadingView />
        ) : view === "already-joined" ? (
          <AlreadyJoinedView />
        ) : (
          <FormView phone={phone} code={code} setCode={setCode} countdown={countdown} handleGetCode={handleGetCode} handleSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}

function FormView({ phone, code, setCode, countdown, handleGetCode, handleSubmit }: {
  phone: string; code: string; setCode: (v: string) => void;
  countdown: number; handleGetCode: () => void; handleSubmit: () => void;
}) {
  return (
    <div>
      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.6, marginBottom: "var(--spacing-lg)", textAlign: "center" }}>
        为了验证您的身份并完成加入，请使用当前手机号登录。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
        {/* Phone (pre-filled, disabled) */}
        <div>
          <div style={{ display: "flex", alignItems: "center", height: 40, width: "100%", backgroundColor: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <div style={{ height: "100%", display: "flex", alignItems: "center", paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", borderRight: "1px solid var(--color-hairline)", backgroundColor: "var(--color-surface-card)", flexShrink: 0 }}>
              +86
            </div>
            <input
              value={phone}
              disabled
              style={{ flex: 1, height: "100%", border: "none", outline: "none", padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", background: "none" }}
            />
          </div>
        </div>

        {/* Verification code */}
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
          onClick={handleSubmit}
          style={{
            height: 44,
            width: "100%",
            fontSize: "var(--text-button)",
            fontWeight: 600,
            color: "var(--color-on-primary)",
            backgroundColor: "var(--color-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            marginTop: "var(--spacing-xs)",
          }}
        >
          登录并确认加入
        </button>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--spacing-xl) 0" }}>
      <Spinner />
      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginTop: "var(--spacing-md)" }}>
        验证身份中...
      </p>
    </div>
  );
}

function SuccessView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--spacing-xl) 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-success)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-xs)" }}>
        已成功加入组织
      </h2>
      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
        正在跳转到控制台...
      </p>
    </div>
  );
}

function AlreadyJoinedView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--spacing-lg) 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--color-success)" strokeWidth="2" />
          <path d="M16 8L10 14L8 12" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-md)" }}>
        您已加入该组织
      </h2>
      <button
        onClick={() => window.location.href = "/dashboard"}
        style={{
          height: 40,
          paddingLeft: "var(--spacing-xl)",
          paddingRight: "var(--spacing-xl)",
          fontSize: "var(--text-button)",
          fontWeight: 600,
          color: "var(--color-on-primary)",
          backgroundColor: "var(--color-primary)",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
        }}
      >
        前往控制台
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}
