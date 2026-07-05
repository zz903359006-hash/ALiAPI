"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";

/* ================================================================
   Mock data
   ================================================================ */
const CURRENT_BALANCE = 1234.56;

const BILL_ROWS = [
  { time: "2026-07-05 14:23", type: "调用扣费", amount: -12.50, target: "sk-****8f2c / DeepSeek V3", balance: 1222.06 },
  { time: "2026-07-05 11:05", type: "调用扣费", amount: -8.30, target: "sk-****1a9b / GPT-4o", balance: 1234.56 },
  { time: "2026-07-04 16:42", type: "充值", amount: 500.00, target: "订单 #20260704-8832", balance: 1250.86 },
  { time: "2026-07-04 09:18", type: "调用扣费", amount: -15.20, target: "sk-****8f2c / Claude 3.5", balance: 750.86 },
  { time: "2026-07-03 20:55", type: "充值", amount: 1000.00, target: "订单 #20260703-1109", balance: 766.06 },
  { time: "2026-07-03 08:30", type: "调用扣费", amount: -6.80, target: "sk-****3e2d / DeepSeek V3", balance: -233.94 },
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

      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/billing")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
          管理充值与查看账单流水。
        </p>
      </div>

      {/* Balance card */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>当前可用余额</div>
            <div style={{ fontSize: "var(--text-display-lg)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              ¥ {CURRENT_BALANCE.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: "var(--spacing-xs)" }}>
              账户当前剩余可用额度，随调用实时扣减。
            </div>
          </div>
          <button onClick={() => showToast("充值请求已提交，请完成支付")} style={{ height: 44, padding: "0 var(--spacing-xl)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>
            立即充值
          </button>
        </div>
      </div>

      {/* Recharge quick action */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>快速充值</div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
          <input type="number" min={1} placeholder="输入充值金额" style={{ height: 40, width: 180, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" }} />
          <button onClick={() => showToast("充值请求已提交，请完成支付")} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
            立即充值
          </button>
        </div>
      </div>

      {/* Billing rule */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.6 }}>
          本平台采用按量计费模式，调用失败不计费。余额长期有效，无过期限制。
        </div>
      </div>

      {/* Transaction table */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>账单流水</span>
        </div>
        <div style={{ overflow: "auto", padding: "0 var(--spacing-lg) var(--spacing-lg)" }}>
          <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", marginTop: "var(--spacing-sm)" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                <Th>时间</Th>
                <Th>账单类型</Th>
                <Th right>变动金额</Th>
                <Th>关联对象</Th>
                <Th right>当前余额</Th>
              </tr>
            </thead>
            <tbody>
              {BILL_ROWS.map((r, i) => (
                <tr key={i} style={{ height: 44 }}>
                  <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{r.time}</Td>
                  <Td>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: r.type === "充值" ? "#059669" : "var(--color-ink)", backgroundColor: r.type === "充值" ? "#ECFDF5" : "var(--color-surface-soft)", borderRadius: "var(--radius-sm)" }}>{r.type}</span>
                  </Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: r.amount > 0 ? "#059669" : "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{r.amount > 0 ? `+ ${r.amount.toFixed(2)}` : `- ${Math.abs(r.amount).toFixed(2)}`}</Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.target}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>¥ {r.balance.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</Td>
                </tr>
              ))}
            </tbody>
          </table>
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
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}
