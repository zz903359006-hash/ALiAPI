"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";

const RULES_TEXT = `一、邀请机制
每个账户均拥有唯一邀请码和邀请链接，可分享给新用户注册。

二、奖励规则
- 被邀请人完成首次充值后，邀请人获得首充金额 10% 的奖励额度。
- 被邀请人每次消耗调用，邀请人获得消耗金额 5% 的返佣奖励。
- 双方在首次充值时各获得 ¥50 额外奖励。

三、有效期
- 所有邀请奖励额度有效期为 90 天，自发放之日起计算。
- 逾期未使用的奖励额度将自动失效。

四、限制
- 邀请人与被邀请人不能为同一实体。
- 恶意刷量行为将被取消奖励资格。`;

const MOCK_USERS = [
  { name: "zhang@example.com", regDate: "2026-06-20", status: "已激活", recharge: "¥ 500.00", reward: "¥ 50.00" },
  { name: "liu@example.com", regDate: "2026-06-15", status: "已激活", recharge: "¥ 1,000.00", reward: "¥ 100.00" },
  { name: "chen@example.com", regDate: "2026-06-10", status: "已激活", recharge: "¥ 750.00", reward: "¥ 75.00" },
  { name: "wang@example.com", regDate: "2026-06-18", status: "仅注册", recharge: "¥ 0.00", reward: "¥ 0.00" },
  { name: "yang@example.com", regDate: "2026-06-08", status: "仅注册", recharge: "¥ 0.00", reward: "¥ 0.00" },
];

const MOCK_REWARDS = [
  { time: "2026-06-22 10:30", user: "zhang@example.com", type: "首充奖励", amount: "¥ 50.00", tokens: "5,000", expire: "2026-09-20", status: "未过期" },
  { time: "2026-06-16 14:20", user: "liu@example.com", type: "首充奖励", amount: "¥ 100.00", tokens: "10,000", expire: "2026-09-14", status: "未过期" },
  { time: "2026-06-12 09:15", user: "chen@example.com", type: "首充奖励", amount: "¥ 75.00", tokens: "7,500", expire: "2026-09-10", status: "未过期" },
  { time: "2026-06-25 16:00", user: "zhang@example.com", type: "消费返佣", amount: "¥ 12.00", tokens: "1,200", expire: "2026-09-23", status: "未过期" },
  { time: "2026-06-20 11:00", user: "liu@example.com", type: "消费返佣", amount: "¥ 18.00", tokens: "1,800", expire: "2026-09-18", status: "未过期" },
  { time: "2026-04-15 08:00", user: "zhao@example.com", type: "首充奖励", amount: "¥ 50.00", tokens: "5,000", expire: "2026-07-14", status: "已过期" },
];

export default function InvitePage() {
  const [tab, setTab] = useState("users");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    showToast(`${label}已复制`);
  };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Rules modal */}
      {rulesOpen && (
        <div className="fixed inset-0 z-50" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div style={{ width: 480, maxHeight: "80vh", overflow: "auto", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-md)" }}>
              <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>邀请规则</h3>
               <button onClick={() => setRulesOpen(false)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4L12 12M12 4L4 12" /></svg></button>
            </div>
            <pre style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.7, fontFamily: "inherit", whiteSpace: "pre-wrap", margin: 0 }}>{RULES_TEXT}</pre>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-xl)", flexWrap: "wrap", gap: "var(--spacing-sm)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
            {getRouteTitle("/growth/invite")}
          </h1>
          <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
            分享邀请码或链接，邀请新用户注册并获取奖励额度。
          </p>
        </div>
        <button onClick={() => setRulesOpen(true)} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-brand-accent)", backgroundColor: "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
          查看邀请规则
        </button>
      </div>

      {/* Invite tool card — left-right split */}
      <div style={{ backgroundColor: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)", marginBottom: "var(--spacing-xl)", display: "flex", gap: "var(--spacing-xl)", alignItems: "flex-start" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div>
            <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>专属邀请码</div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, height: 40, display: "flex", alignItems: "center", paddingLeft: "var(--spacing-sm)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRight: "none", borderRadius: "var(--radius-md) 0 0 var(--radius-md)", fontSize: "var(--text-body-sm)", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--color-ink)", letterSpacing: "2px" }}>ABCD1234</div>
              <button onClick={() => copy("ABCD1234", "邀请码")} style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "0 var(--radius-md) var(--radius-md) 0", cursor: "pointer" }}>复制</button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>邀请链接</div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, height: 40, display: "flex", alignItems: "center", paddingLeft: "var(--spacing-sm)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRight: "none", borderRadius: "var(--radius-md) 0 0 var(--radius-md)", fontSize: "var(--text-caption)", color: "var(--color-body)", overflow: "hidden", whiteSpace: "nowrap" }}>https://aliapi.com/invite?code=ABCD1234</div>
              <button onClick={() => copy("https://aliapi.com/invite?code=ABCD1234", "邀请链接")} style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "0 var(--radius-md) var(--radius-md) 0", cursor: "pointer" }}>复制</button>
            </div>
          </div>
        </div>
        <div style={{ width: 120, height: 120, backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, flexDirection: "column", gap: 4 }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M3 9h4M17 9h4M3 15h4M17 15h4" /><path d="M9 3v4M9 17v4M15 3v4M15 17v4" /></svg>
          <span style={{ fontSize: 11, color: "var(--color-muted)" }}>二维码</span>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
        <Kpi label="累计邀请注册人数" value="123" sub="通过你的邀请链接完成注册的用户数" />
        <Kpi label="累计激活人数" value="45" sub="完成首充或达到指定调用量的用户" />
        <Kpi label="累计获得奖励额度" value="¥ 1,234.56" sub="含已使用与已过期" />
        <Kpi label="当前未过期额度" value="¥ 567.89" sub="仍可用于调用消耗" />
      </div>

      {/* Tabs + Tables */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Seg options={["下级用户列表", "奖励流水"]} value={tab === "users" ? "下级用户列表" : "奖励流水"} onChange={(v) => setTab(v === "下级用户列表" ? "users" : "rewards")} />
      </div>

      {tab === "users" && (
        <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
          <table style={{ width: "100%", minWidth: 650, borderCollapse: "collapse" }}>
            <thead><tr style={{ backgroundColor: "#F9FAFB" }}><Th>用户标识</Th><Th>注册时间</Th><Th>激活状态</Th><Th right>累计充值金额</Th><Th right>为你带来奖励额度</Th></tr></thead>
            <tbody>
              {MOCK_USERS.map((r, i) => (
                <tr key={i} style={{ height: 44 }}>
                  <Td style={{ fontWeight: 500, color: "var(--color-ink)" }}>{r.name}</Td>
                  <Td muted>{r.regDate}</Td>
                  <Td><Badge active={r.status === "已激活"} /></Td>
                  <Td right style={{ fontWeight: 500, color: r.recharge === "¥ 0.00" ? "var(--color-muted)" : "var(--color-ink)" }}>{r.recharge}</Td>
                  <Td right style={{ fontWeight: 600, color: r.reward === "¥ 0.00" ? "var(--color-muted)" : "var(--color-success)" }}>{r.reward}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "rewards" && (
        <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
          <table style={{ width: "100%", minWidth: 750, borderCollapse: "collapse" }}>
            <thead><tr style={{ backgroundColor: "#F9FAFB" }}><Th>发生时间</Th><Th>关联用户</Th><Th>奖励类型</Th><Th right>奖励额度</Th><Th right>资产有效期截止</Th><Th>状态</Th></tr></thead>
            <tbody>
              {MOCK_REWARDS.map((r, i) => (
                <tr key={i} style={{ height: 44 }}>
                  <Td muted>{r.time}</Td>
                  <Td style={{ fontWeight: 500, color: "var(--color-ink)" }}>{r.user}</Td>
                  <Td><TypeBadge type={r.type} /></Td>
                  <Td right>
                    <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-success)" }}>{r.amount}</span>
                    <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginLeft: 4 }}>· {r.tokens} Tokens</span>
                  </Td>
                  <Td right muted>{r.expire}</Td>
                  <Td><Badge active={r.status === "未过期"} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
        <span>共 {tab === "users" ? MOCK_USERS.length : MOCK_REWARDS.length} 条</span>
      </div>
    </div>
  );
}

/* Shared */
function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 96 }}><span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>{label}</span><span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{value}</span>{sub && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 4 }}>{sub}</span>}</div>;
}

function Badge({ active }: { active: boolean }) {
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: active ? "var(--color-success)" : "var(--color-muted)", backgroundColor: active ? "#ECFDF5" : "var(--color-surface-card)", borderRadius: "var(--radius-sm)" }}>{active ? "已激活" : "仅注册"}</span>;
}

function TypeBadge({ type }: { type: string }) {
  const m: Record<string, { fg: string; bg: string }> = { "首充奖励": { fg: "#2563EB", bg: "#EFF6FF" }, "消费返佣": { fg: "#059669", bg: "#ECFDF5" } };
  const c = m[type] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{type}</span>;
}

function Seg({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return <div style={{ display: "inline-flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)" }}>{options.map((o) => <button key={o} onClick={() => onChange(o)} style={{ height: 34, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-nav-link)", fontWeight: 500, color: o === value ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: o === value ? "var(--color-canvas)" : "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", boxShadow: o === value ? "0 1px 3px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap", transition: "all 0.15s ease" }}>{o}</button>)}</div>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children, style, muted, right }: { children: React.ReactNode; style?: React.CSSProperties; muted?: boolean; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", color: muted ? "var(--color-muted)" : undefined, ...style }}>{children}</td>;
}
