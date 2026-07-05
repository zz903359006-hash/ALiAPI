"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";

/* ================================================================
   Mock data
   ================================================================ */
const ASSET_TYPES = [
  { key: "principal", label: "本金", amount: 8200, color: "#2563EB", desc: "可提现 · 全账户通用" },
  { key: "reward", label: "奖励额度", amount: 1500, color: "#059669", desc: "仅调用费用 · 有有效期" },
  { key: "compensation", label: "保险补偿", amount: 840.5, color: "#7C3AED", desc: "仅补偿返还 · 不可提现" },
  { key: "invite", label: "邀请额度", amount: 1800, color: "#D97706", desc: "仅调用费用 · 有有效期" },
];

const totalBalance = ASSET_TYPES.reduce((s, a) => s + a.amount, 0);
const ACTIVE_TYPES = ASSET_TYPES.filter((a) => a.amount > 0);

const CONSUMPTION_ROWS = [
  { type: "本金", start: 10000, added: 800, consumed: 2600, end: 8200, expired: 0 },
  { type: "奖励额度", start: 2000, added: 0, consumed: 410.8, end: 1500, expired: 89.2 },
  { type: "保险补偿", start: 650, added: 190.5, consumed: 0, end: 840.5, expired: 0 },
  { type: "邀请额度", start: 1800, added: 0, consumed: 0, end: 1800, expired: 0 },
];

/* ================================================================
   Page
   ================================================================ */
export default function BillingPage() {
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-xl)", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
            {getRouteTitle("/billing")}
          </h1>
          <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
            查看资产构成与扣费优先级，管理充值和对账。
          </p>
        </div>
      </div>

      {/* ====== Section 1: Asset Structure Viz ====== */}
      <Card title="资产结构">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-xl)" }}>
          {/* Left: Donut chart */}
          <div>
            <DonutChart items={ACTIVE_TYPES} total={totalBalance} />
            <div style={{ display: "flex", gap: "var(--spacing-md)", marginTop: "var(--spacing-md)", flexWrap: "wrap" }}>
              {ACTIVE_TYPES.map((a) => (
                <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-caption)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: a.color, flexShrink: 0 }} />
                  <span style={{ color: "var(--color-muted)" }}>{a.label}</span>
                  <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{((a.amount / totalBalance) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Deduction priority ladder */}
          <div>
            <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-md)" }}>扣费优先级</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "① 临时额度", amount: "¥ 0.00", note: "耗尽", color: "#9CA3AF", bg: "#F3F4F6" },
                { label: "② 保险补偿额度", amount: "¥ 840.50", note: "可用", color: "#7C3AED", bg: "#F5F3FF" },
                { label: "③ 奖励额度", amount: "¥ 1,500.00", note: "可用", color: "#059669", bg: "#ECFDF5" },
                { label: "④ 本金", amount: "¥ 8,200.00", note: "可用", color: "#2563EB", bg: "#EFF6FF" },
              ].map((rung, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", padding: "var(--spacing-sm) var(--spacing-md)", backgroundColor: rung.bg, borderLeft: `3px solid ${rung.note === "耗尽" ? "#D1D5DB" : rung.color}`, marginBottom: 2, borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", opacity: rung.note === "耗尽" ? 0.5 : 1 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                    <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: rung.color }}>{rung.label}</span>
                    {rung.note === "耗尽" && <span style={{ fontSize: 11, color: "#9CA3AF", backgroundColor: "#E5E7EB", padding: "0 6px", borderRadius: "var(--radius-sm)", lineHeight: "18px" }}>已耗尽</span>}
                  </div>
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: rung.note === "耗尽" ? "#9CA3AF" : "var(--color-ink)" }}>{rung.amount}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "var(--spacing-sm)", fontSize: "var(--text-caption)", color: "var(--color-muted)", lineHeight: 1.6, padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)" }}>
              扣费时优先消耗即将过期的额度；同一到期日内，按临时额度 → 补偿 → 奖励 → 本金的顺序扣费。
            </div>
          </div>
        </div>
      </Card>

      {/* ====== Section 2: Expiry alert ====== */}
      <div style={{ marginTop: "var(--spacing-lg)", padding: "var(--spacing-md)", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        <span style={{ flex: 1, fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>
          有 <strong style={{ color: "var(--color-warning)" }}>¥ 320.00</strong> 的奖励额度将在 <strong>3 天</strong> 后过期（2026-07-15），请留意。
        </span>
        <button onClick={() => window.location.href = "/analytics/usage"} style={{ height: 34, padding: "0 var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          前往用量分析查看
        </button>
      </div>

      {/* ====== Section 3: Recharge dual cards ====== */}
      <div style={{ marginTop: "var(--spacing-lg)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)" }}>
        <Card title="充值">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-xs)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>充值金额</span>
              <span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>¥</span>
              <input type="number" min={1} placeholder="100" style={{ height: 40, width: 120, padding: "0 var(--spacing-sm)", fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" }} />
            </div>
            <button onClick={() => showToast("充值请求已提交，请在企业钱包完成支付")} style={{ height: 40, fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
              立即充值
            </button>
          </div>
        </Card>

        <Card title="自动充值">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ cursor: "pointer" }} />
              开启自动充值
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", flexShrink: 0 }}>余额低于</span>
              <input type="number" defaultValue={500} style={{ height: 36, width: 100, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" }} />
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>元时充值</span>
            </div>
            <button onClick={() => showToast("自动充值设置已保存")} style={{ height: 36, fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
              保存设置
            </button>
          </div>
        </Card>
      </div>

      {/* ====== Section 4: Fee rule explanation ====== */}
      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <Card title="计费规则说明">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)", padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <div>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>平台服务费</span>
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", margin: "var(--spacing-xs) 0 0", lineHeight: 1.6 }}>
                在全量模型的原生成本基础上统一加收 <strong style={{ color: "var(--color-warning)" }}>5%</strong> 作为网关调度与保险兜底费。<strong style={{ color: "var(--color-ink)" }}>BYOK（自带密钥）</strong>调用免收平台费。
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)", padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <div>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>扣费规则</span>
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", margin: "var(--spacing-xs) 0 0", lineHeight: 1.6 }}>
                扣费时优先消耗即将过期的额度；同一到期日内，按临时额度 → 补偿 → 奖励 → 本金的顺序扣费。
              </p>
            </div>
          </div>
        </div>
        </Card>
      </div>

      {/* ====== Section 5: Monthly consumption table ====== */}
      <div style={{ marginTop: "var(--spacing-xl)" }}>
        <Card title="本月资产对账明细">
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", minWidth: 750, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F9FAFB" }}>
                  <Th>资产类型</ Th>
                  <Th right>月初额度</Th>
                  <Th right>本月增加</Th>
                  <Th right>本月消耗</Th>
                  <Th right>月末余额</Th>
                  <Th right>过期失效量</Th>
                </tr>
              </thead>
              <tbody>
                {CONSUMPTION_ROWS.map((r, i) => (
                  <tr key={i} style={{ height: 44 }}>
                    <Td>
                      <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: ASSET_TYPES.find((a) => a.label === r.type)?.color || "var(--color-muted)", backgroundColor: (ASSET_TYPES.find((a) => a.label === r.type)?.color || "#F3F4F6") + "18", borderRadius: "var(--radius-sm)" }}>{r.type}</span>
                    </Td>
                    <Td right style={{ fontWeight: 500, color: "var(--color-ink)" }}>¥ {r.start.toLocaleString()}</Td>
                    <Td right style={{ color: "var(--color-success)" }}>+ ¥ {r.added.toLocaleString()}</Td>
                    <Td right style={{ color: r.consumed > 0 ? "var(--color-body)" : "var(--color-muted-soft)" }}>¥ {r.consumed > 0 ? r.consumed.toLocaleString() : "—"}</Td>
                    <Td right style={{ fontWeight: 600, color: "var(--color-ink)" }}>¥ {r.end.toLocaleString()}</Td>
                    <Td right style={{ color: r.expired > 0 ? "var(--color-error)" : "var(--color-muted-soft)" }}>{r.expired > 0 ? `¥ ${r.expired.toLocaleString()}` : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: "var(--spacing-md)", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => showToast("资产对账单 CSV 已开始下载")} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              导出资产对账单 CSV
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================
   SVG Donut Chart
   ================================================================ */
function DonutChart({ items, total }: { items: typeof ASSET_TYPES; total: number }) {
  const cx = 60, cy = 60, r = 48, sw = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = items.map((a) => {
    const pct = a.amount / total;
    const len = pct * circ;
    const seg = { ...a, dash: `${len} ${circ - len}`, offset };
    offset -= len;
    return seg;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
      <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
          {slices.map((s) => (
            <circle key={s.key} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw} strokeDasharray={s.dash} strokeDashoffset={s.offset} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
          ))}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>¥{total >= 10000 ? (total / 10000).toFixed(1) + "K" : total.toFixed(0)}</div>
          <div style={{ fontSize: 10, color: "var(--color-muted)" }}>总额</div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Shared components
   ================================================================ */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span>
      </div>
      <div style={{ padding: "var(--spacing-lg)" }}>{children}</div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}
