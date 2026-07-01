"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";

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

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("近 7 天");
  const [hasKeys, setHasKeys] = useState(false);
  const [hasRecentRequests, setHasRecentRequests] = useState(false);
  const [stepsDone, setStepsDone] = useState<Set<number>>(new Set());
  const [showDevToggle, setShowDevToggle] = useState(false);

  const isNewUser = !hasKeys || !hasRecentRequests;

  const completeStep = (i: number) => setStepsDone((p) => { const n = new Set(p); n.add(i); return n; });

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
      {/* Dev toggle — hidden by default, click title 5 times to reveal */}
      {showDevToggle && (
        <div style={{ marginBottom: "var(--spacing-md)", padding: "var(--spacing-sm)", backgroundColor: "#FEF3C7", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "var(--spacing-md)", fontSize: "var(--text-caption)" }}>
          <span style={{ fontWeight: 600 }}>⚙️ 开发调试：引导区状态</span>
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><input type="checkbox" checked={!hasKeys} onChange={() => setHasKeys(!hasKeys)} />无 Key</label>
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><input type="checkbox" checked={!hasRecentRequests} onChange={() => setHasRecentRequests(!hasRecentRequests)} />无调用记录</label>
          <button onClick={() => setShowDevToggle(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", fontSize: "var(--text-caption)" }}>关闭</button>
        </div>
      )}

      {/* Section 1 — Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-xl)", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            onDoubleClick={() => setShowDevToggle(!showDevToggle)}
            style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", cursor: "default" }}
          >
            {getRouteTitle("/dashboard")}
          </h1>
          <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
            选择合适的模型 → 创建调用 Key → 快速接入。关注用量、费用与风险。
          </p>
        </div>
        <div style={{ display: "inline-flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)", flexShrink: 0 }}>
          {TIME_RANGES.map((label) => {
            const active = label === timeRange;
            return (
              <button key={label} onClick={() => setTimeRange(label)} style={{ height: 34, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-nav-link)", fontWeight: 500, color: active ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: active ? "var(--color-canvas)" : "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2 — Guide: expanded or compact */}
      {isNewUser ? (
        /* Expanded onboarding */
        <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)", marginBottom: "var(--spacing-xl)" }}>
          <h2 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-xs)", fontFamily: "var(--font-display)" }}>🚀 快速接入 ALiAPI</h2>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: "0 0 var(--spacing-lg)" }}>三步完成首次模型调用，开始使用。</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
            {[
              { step: 0, icon: "🔍", title: "选择模型", desc: "在模型广场挑选适合的模型", btn: "前往模型广场", href: "/models" },
              { step: 1, icon: "🔑", title: "创建调用 Key", desc: "创建一个带路由与风控的 Key", btn: "创建调用 Key", href: "/keys/create" },
              { step: 2, icon: "💻", title: "复制示例代码", desc: "使用 OpenAI 兼容接口发起第一次调用", btn: "查看快速开始文档", href: "https://docs.aliapi.dev" },
            ].map((item) => {
              const done = stepsDone.has(item.step);
              return (
                <div key={item.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--spacing-lg)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)", opacity: done ? 0.6 : 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, backgroundColor: done ? "var(--color-success)" : "var(--color-surface-card)", color: done ? "#fff" : "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>
                    {done ? "✓" : item.icon}
                  </div>
                  <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-xs)" }}>{item.title}</h3>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: "0 0 var(--spacing-md)" }}>{item.desc}</p>
                  <button
                    onClick={() => { if (!done) { completeStep(item.step); if (item.step === 0) window.location.href = "/models"; else if (item.step === 1) window.location.href = "/keys/create"; else window.open(item.href, "_blank"); } }}
                    style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: done ? "var(--color-muted)" : "var(--color-on-primary)", backgroundColor: done ? "var(--color-surface-card)" : "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: done ? "default" : "pointer", marginTop: "auto" }}
                  >
                    {done ? "已完成" : item.btn}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Compact shortcut bar for returning users */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
          {[
            { icon: "🔑", label: "继续创建 Key", desc: "创建新的调用 Key，支持路由与风控", href: "/keys/create" },
            { icon: "🔍", label: "前往模型广场", desc: "浏览可调用的 AI 模型", href: "/models" },
            { icon: "📖", label: "快速开始文档", desc: "查看接入指南与示例代码", href: "https://docs.aliapi.dev" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => window.open(item.href, item.href.startsWith("http") ? "_blank" : "_self")}
              style={{ backgroundColor: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: "var(--spacing-md)", transition: "box-shadow 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{item.label}</div>
                <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3 — KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
        <MetricCard label="总 Token 用量" value="1.28M" change="+12.3%" changeUp onClick={() => window.location.href = "/analytics/usage"} />
        <MetricCard label="总费用" value="¥ 12,340.50" change="-8.6%" changeUp={false} onClick={() => window.location.href = "/analytics/cost"} />
        <MetricCard label="可用额度" value="¥ 8,560.00" change="近 7 天过期 ¥ 1,200" onClick={() => window.location.href = "/billing"} />
        <MetricCard label="异常请求" value="132" change="熔断 47 / 超限 68" onClick={() => window.location.href = "/observability?tab=logs&status=error"} />
        <MetricCard label="保险补偿" value="¥ 1,230.00" change="本周期已赔付" onClick={() => window.location.href = "/insurance"} />
      </div>

      {/* Section 4 — Trend + Risk (2/3 + 1/3) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--spacing-lg)", alignItems: "start" }}>
        {/* Left: Trend chart */}
        <Card title="用量与费用趋势">
          <div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: 180 }}>
              <defs>
                <linearGradient id="callFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.12} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.12} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((pct) => (
                <line key={pct} x1={0} y1={chartH - (pct / 100) * chartH * 0.85 - 10} x2={chartW} y2={chartH - (pct / 100) * chartH * 0.85 - 10} stroke="var(--color-hairline-soft)" strokeWidth="1" />
              ))}
              <path d={`M0,${chartH} ${callPath} L${chartW},${chartH}Z`} fill="url(#callFill)" />
              <path d={callPath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M0,${chartH} ${costPath} L${chartW},${chartH}Z`} fill="url(#costFill)" />
              <path d={costPath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {TREND_DATA.map((d, i) => (
                <g key={i}>
                  <circle cx={(i / (TREND_DATA.length - 1)) * chartW} cy={chartH - (d.calls / maxCalls) * chartH * 0.85 - 10} r="3" fill="#3B82F6" />
                  <circle cx={(i / (TREND_DATA.length - 1)) * chartW} cy={chartH - (d.cost / maxCost) * chartH * 0.85 - 10} r="3" fill="#10B981" />
                </g>
              ))}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
              {TREND_DATA.map((d, i) => <span key={i}>{d.day}</span>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-md)", fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3B82F6" }} />调用次数</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10B981" }} />费用金额 (¥)</span>
          </div>
        </Card>

        {/* Right: Risk panel */}
        <Card title="风险与提醒">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <RiskCard icon="💰" title="余额即将耗尽" desc="2 个 Key 接近额度上限 · 主账户余额将在 3 天内不足" btnText="去充值" onClick={() => window.location.href = "/billing"} />
            <RiskCard
              icon="⚠️" title="高频错误模型 Top 3"
              desc={
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                  {[{ n: "DeepSeek V3", v: "4.78%", c: "var(--color-error)" }, { n: "通义千问 Max", v: "2.31%", c: "var(--color-warning)" }, { n: "GPT-4o (代码)", v: "1.02%", c: "var(--color-muted)" }].map((m) => (
                    <div key={m.n} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-caption)" }}>
                      <span style={{ color: "var(--color-body)" }}>{m.n}</span>
                      <span style={{ color: m.c, fontWeight: 600 }}>{m.v}</span>
                    </div>
                  ))}
                </div>
              }
              btnText="查看日志" onClick={() => window.location.href = "/observability?tab=logs&status=error"}
            />
            <RiskCard icon="🛡️" title="触发保险最高模型" desc="通义千问 Max — 12 次，¥ 48.00" btnText="查看补偿" onClick={() => window.location.href = "/insurance"} />
          </div>
        </Card>
      </div>
    </div>
  );
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

function RiskCard({ icon, title, desc, btnText, onClick }: { icon: string; title: string; desc: React.ReactNode; btnText: string; onClick: () => void }) {
  return (
    <div style={{ backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
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
