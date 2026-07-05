"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";
import UpgradeOrgModal from "@/components/UpgradeOrgModal";
import CreateKeyModal from "@/components/CreateKeyModal";

type AccountMode = "personal" | "org-admin" | "employee";

const TIME_RANGES = ["今天", "近 7 天", "本月", "近 30 天"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

const TREND_DATA = [
  { day: "06-20", calls: 3200, cost: 380 },
  { day: "06-21", calls: 3800, cost: 420 },
  { day: "06-22", calls: 3500, cost: 390 },
  { day: "06-23", calls: 4500, cost: 510 },
  { day: "06-24", calls: 4200, cost: 480 },
  { day: "06-25", calls: 5600, cost: 620 },
  { day: "06-26", calls: 5200, cost: 580 },
];

const TEAM_TOP5 = [
  { name: "AI 客服项目组", usage: "3,850,000 Tokens" },
  { name: "内容生成平台", usage: "2,120,000 Tokens" },
  { name: "数据分析团队", usage: "1,670,000 Tokens" },
  { name: "智能搜索小组", usage: "890,000 Tokens" },
  { name: "图像生成项目", usage: "430,000 Tokens" },
];

export default function DashboardPage() {
  const [accountMode, setAccountMode] = useState<AccountMode>("personal");
  const [timeRange, setTimeRange] = useState<TimeRange>("近 7 天");
  const [hasKeys, setHasKeys] = useState(false);
  const [hasRecentRequests, setHasRecentRequests] = useState(false);
  const [showDevToggle, setShowDevToggle] = useState(false);
  const [toast, setToast] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

 const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const maxCalls = Math.max(...TREND_DATA.map((d) => d.calls));
  const maxCost = Math.max(...TREND_DATA.map((d) => d.cost));
  const chartW = 100, chartH = 140;

  const callPath = TREND_DATA.map((d, i) => {
    const x = (i / (TREND_DATA.length - 1)) * chartW;
    const y = chartH - (d.calls / maxCalls) * chartH * 0.85 - 10;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  const costPath = TREND_DATA.map((d, i) => {
    const x = (i / (TREND_DATA.length - 1)) * chartW;
    const y = chartH - (d.cost / maxCost) * chartH * 0.85 - 10;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Dev toggle — hidden by default, double-click title to reveal */}
      {showDevToggle && (
        <div style={{ marginBottom: "var(--spacing-md)", padding: "var(--spacing-sm)", backgroundColor: "#FEF3C7", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "var(--spacing-md)", fontSize: "var(--text-caption)", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> 开发调试</span>
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontWeight: 500 }}>身份：</span>
            <select value={accountMode} onChange={(e) => setAccountMode(e.target.value as AccountMode)} style={{ fontSize: "var(--text-caption)", padding: "2px 4px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-hairline)" }}>
              <option value="personal">个人账户</option>
              <option value="org-admin">组织管理员</option>
              <option value="employee">员工</option>
            </select>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><input type="checkbox" checked={!hasKeys} onChange={() => setHasKeys(!hasKeys)} />无 Key</label>
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><input type="checkbox" checked={!hasRecentRequests} onChange={() => setHasRecentRequests(!hasRecentRequests)} />无调用记录</label>
          <button onClick={() => setShowDevToggle(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", fontSize: "var(--text-caption)" }}>关闭</button>
        </div>
      )}

      {/* ====== ONBOARDING: No keys yet ====== */}
      {!hasKeys ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 220px)" }}>
          <div style={{ width: 480, maxWidth: "100%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--spacing-lg)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", margin: "0 0 var(--spacing-sm)", fontFamily: "var(--font-display)" }}>Welcome to ALiAPI Workspace</h1>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: "0 0 var(--spacing-xl)", lineHeight: 1.7, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              在这里管理您的 API Keys、路由策略和账单。要开始通过统一网关调用大模型，请先创建您的第一个 API Key。
            </p>
            <button onClick={() => setCreateKeyOpen(true)} style={{ height: 48, padding: "0 var(--spacing-xl)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
              创建首个 API Key
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ====== Guidance banner (shown after first key creation) ====== */}
          {showGuidance && (
            <div style={{ marginBottom: "var(--spacing-lg)", padding: "var(--spacing-md) var(--spacing-lg)", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🎉</span>
              <span style={{ flex: 1, fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.6 }}>
                准备好进行首次调用了吗？发起测试请求后，您可以前往 <ALink href="/observability">请求日志</ALink> 查看耗时与成本。若需用于生产环境，请前往 <ALink href="/billing">计费中心</ALink> 充值。
              </span>
              <button onClick={() => setShowGuidance(false)} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4L12 12M12 4L4 12" /></svg>
              </button>
            </div>
          )}

          {/* Section 1 — Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-xl)", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 onDoubleClick={() => setShowDevToggle(!showDevToggle)} className="select-none" style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", cursor: "default" }}>{getRouteTitle("/dashboard")}</h1>
              <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
                {accountMode === "employee" ? "查看个人用量与可用额度，关注异常请求。" : "充值 → 创建 Key → 开始调用。关注用量、费用与风险。"}
              </p>
            </div>
            <div style={{ display: "inline-flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)", flexShrink: 0 }}>
              {TIME_RANGES.map((label) => {
                const active = label === timeRange;
                return <button key={label} onClick={() => setTimeRange(label)} style={{ height: 34, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-nav-link)", fontWeight: 500, color: active ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: active ? "var(--color-canvas)" : "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>{label}</button>;
              })}
            </div>
          </div>

          {/* Section 2 — Shortcut bar */}
          {accountMode !== "employee" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
              {[
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, label: "前往充值", desc: "为账户充值，解锁全站模型调用", href: "/billing/credits" },
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>, label: "继续创建 Key", desc: "创建新的调用 Key，支持路由与风控", href: "/keys/create" },
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>, label: "快速开始文档", desc: "查看接入指南与示例代码", href: "https://docs.aliapi.dev" },
              ].map((item, i) => (
                <div key={i} onClick={() => window.open(item.href, item.href.startsWith("http") ? "_blank" : "_self")} style={{ backgroundColor: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: "var(--spacing-md)", transition: "box-shadow 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  <div><div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{item.label}</div><div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>{item.desc}</div></div>
                </div>
              ))}
            </div>
          )}

          {/* Section 3 — KPI Cards */}
          {accountMode === "org-admin" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
              <MetricCard label="组织总用量" value="18.4M" change="+15.2%" changeUp onClick={() => window.location.href = "/analytics/usage"} />
              <MetricCard label="总费用" value="¥ 89,230.00" change="+8.6%" changeUp={false} onClick={() => window.location.href = "/analytics/cost"} />
              <MetricCard label="组织可用余额" value="¥ 45,200.00" change="含待分配 ¥ 12,000" onClick={() => window.location.href = "/billing"} />
              <MetricCard label="异常请求" value="487" change="熔断 156 / 超限 281" onClick={() => window.location.href = "/observability?tab=logs&status=error"} />
              <MetricCard label="保险补偿" value="¥ 5,430.00" change="本周期已赔付" onClick={() => window.location.href = "/insurance"} />
            </div>
          ) : accountMode === "employee" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
              <MetricCard label="可用额度" value="¥ 2,000.00" change="由组织分配" onClick={() => window.location.href = "/billing"} />
              <MetricCard label="本月个人用量" value="384,200" change="Token" onClick={() => window.location.href = "/analytics/usage"} />
              <MetricCard label="个人异常请求" value="23" change="熔断 8 / 超限 12" onClick={() => window.location.href = "/observability?tab=logs&status=error"} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
              <MetricCard label="总 Token 用量" value="1.28M" change="+12.3%" changeUp onClick={() => window.location.href = "/analytics/usage"} />
              <MetricCard label="总费用" value="¥ 12,340.50" change="-8.6%" changeUp={false} onClick={() => window.location.href = "/analytics/cost"} />
              <MetricCard label="可用额度" value="¥ 8,560.00" change="近 7 天过期 ¥ 1,200" onClick={() => window.location.href = "/billing"} />
              <MetricCard label="异常请求" value="132" change="熔断 47 / 超限 68" onClick={() => window.location.href = "/observability?tab=logs&status=error"} />
              <MetricCard label="保险补偿" value="¥ 1,230.00" change="本周期已赔付" onClick={() => window.location.href = "/insurance"} />
            </div>
          )}

          {/* Section 3.5 — Upgrade prompt */}
          {accountMode === "personal" && (
            <div style={{ backgroundColor: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-lg)" }}>
              <div><h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-xxs)", fontFamily: "var(--font-display)" }}>企业团队协作更高效</h3><p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: 0 }}>升级为组织，统一管理员工额度与账单，享受企业级风控与路由配置。</p></div>
              <button onClick={() => setUpgradeOpen(true)} style={{ height: 36, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>升级为组织</button>
            </div>
          )}

          {/* Section 4 — Trend + Risk */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--spacing-lg)", alignItems: "start" }}>
            <Card title="用量与费用趋势">
              <div>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: 180 }}>
                  <defs><linearGradient id="callFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.12} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient><linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.12} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                  {[0, 25, 50, 75, 100].map((pct) => (<line key={pct} x1={0} y1={chartH - (pct / 100) * chartH * 0.85 - 10} x2={chartW} y2={chartH - (pct / 100) * chartH * 0.85 - 10} stroke="var(--color-hairline-soft)" strokeWidth="1" />))}
                  <path d={`M0,${chartH} ${callPath} L${chartW},${chartH}Z`} fill="url(#callFill)" /><path d={callPath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={`M0,${chartH} ${costPath} L${chartW},${chartH}Z`} fill="url(#costFill)" /><path d={costPath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {TREND_DATA.map((d, i) => (<g key={i}><circle cx={(i / (TREND_DATA.length - 1)) * chartW} cy={chartH - (d.calls / maxCalls) * chartH * 0.85 - 10} r="3" fill="#3B82F6" /><circle cx={(i / (TREND_DATA.length - 1)) * chartW} cy={chartH - (d.cost / maxCost) * chartH * 0.85 - 10} r="3" fill="#10B981" /></g>))}
                </svg>
              </div>
              <div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-md)", fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3B82F6" }} />调用次数</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10B981" }} />费用金额 (¥)</span>
              </div>
            </Card>
            <Card title="风险与提醒">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                {accountMode === "employee" ? (
                  <RiskCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} title="额度不足预警" desc="您当前可用额度较低（¥ 200.00），请联系管理员申请增加额度。" btnText="联系管理员" onClick={() => window.location.href = "/growth/team"} />
                ) : (
                  <RiskCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>} title="余额即将耗尽" desc="2 个 Key 接近额度上限 · 主账户余额将在 3 天内不足" btnText="去充值" onClick={() => window.location.href = "/billing"} />
                )}
                <RiskCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} title="高频错误模型 Top 3" desc={<div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>{[{ n: "DeepSeek V3", v: "4.78%", c: "var(--color-error)" }, { n: "通义千问 Max", v: "2.31%", c: "var(--color-warning)" }, { n: "GPT-4o (代码)", v: "1.02%", c: "var(--color-muted)" }].map((m) => (<div key={m.n} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-caption)" }}><span style={{ color: "var(--color-body)" }}>{m.n}</span><span style={{ color: m.c, fontWeight: 600 }}>{m.v}</span></div>))}</div>} btnText="查看日志" onClick={() => window.location.href = "/observability?tab=logs&status=error"} />
                {accountMode !== "employee" && <RiskCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>} title="触发保险最高模型" desc="通义千问 Max — 12 次，¥ 48.00" btnText="查看补偿" onClick={() => window.location.href = "/insurance"} />}
              </div>
            </Card>
          </div>

          {/* Section 5 — Team usage top 5 */}
          {accountMode === "org-admin" && (
            <div style={{ marginTop: "var(--spacing-xl)" }}>
              <Card title="团队用量 Top 5">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {TEAM_TOP5.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-sm) 0", borderBottom: i < TEAM_TOP5.length - 1 ? "1px solid var(--color-hairline-soft)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: i < 3 ? ["#F59E0B", "#9CA3AF", "#D97706"][i] : "var(--color-surface-soft)", color: i < 3 ? "#fff" : "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-caption)", fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-muted)" }}>{item.usage}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "var(--spacing-md)", textAlign: "right" }}><a href="/growth/team" style={{ fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-primary)", textDecoration: "none", cursor: "pointer" }}>前往团队管理 →</a></div>
              </Card>
            </div>
          )}
        </>
      )}

      <CreateKeyModal open={createKeyOpen} onClose={() => setCreateKeyOpen(false)} onSuccess={(name, key) => { setHasKeys(true); setCreateKeyOpen(false); setShowGuidance(true); showToast(`${name} 已创建`); }} />
      <UpgradeOrgModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} onSuccess={() => showToast("升级成功，正在刷新")} />
    </div>
  );
}

function ALink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }} onClick={(e) => { e.preventDefault(); window.location.href = href; }}>{children}</a>;
}

function MetricCard({ label, value, change, changeUp, onClick }: { label: string; value: string; change?: string; changeUp?: boolean; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ backgroundColor: "var(--color-canvas)", border: `1px solid ${hover ? "var(--color-primary)" : "var(--color-hairline)"}`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 104, cursor: onClick ? "pointer" : "default", transition: "all 0.15s", position: "relative" }}
    >
      <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>{label}</span>
      <span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-xxs)" }}>{value}</span>
      {change && (
        <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: changeUp === undefined ? "var(--color-muted)" : changeUp ? "var(--color-success)" : "var(--color-error)" }}>
          {changeUp !== undefined && <span style={{ marginRight: 2 }}>{changeUp ? "↑" : "↓"}</span>}
          {change}
        </span>
      )}
      {hover && onClick && (
        <span style={{ position: "absolute", bottom: 8, right: 10, fontSize: 12, color: "var(--color-muted)", opacity: 0.5 }}>→</span>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span>
      </div>
      <div style={{ padding: "var(--spacing-lg)" }}>{children}</div>
    </div>
  );
}

function RiskCard({ icon, title, desc, btnText, onClick }: { icon: React.ReactNode; title: string; desc: React.ReactNode; btnText: string; onClick: () => void }) {
  return (
    <div style={{ backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)" }}>
        <span style={{ width: 22, height: 22, flexShrink: 0, color: "var(--color-ink)" }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span>
            <button onClick={onClick} style={{ height: 30, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{btnText}</button>
          </div>
          {typeof desc === "string" ? (
            <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", lineHeight: 1.5 }}>{desc}</span>
          ) : desc}
        </div>
      </div>
    </div>
  );
}
