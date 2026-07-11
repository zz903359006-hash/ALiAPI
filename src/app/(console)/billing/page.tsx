"use client";

import { useState, useMemo } from "react";
import { getRouteTitle } from "@/config/titles";
import { isEmployee } from "@/lib/role";

/* ================================================================
   Mock data
   ================================================================ */
const ENTERPRISE_BALANCE = 920.36;
const PERSONAL_BALANCE = 314.20;
const TOTAL_BALANCE = ENTERPRISE_BALANCE + PERSONAL_BALANCE;

const BILL_ROWS = [
  { time: "2026-07-06 10:30", type: "额度分配", amount: 500.00, target: "企业自动分配额度", balance: 1734.56, source: "企业分配" as const, flow: "转入" as const },
  { time: "2026-07-05 14:23", type: "调用扣费", amount: -12.50, target: "sk-****8f2c / DeepSeek V3", balance: 1234.56, source: "企业分配" as const, flow: "扣减" as const },
  { time: "2026-07-04 16:42", type: "充值", amount: 500.00, target: "订单 #20260704-8832", balance: 1247.06, source: "个人充值" as const, flow: "转入" as const },
  { time: "2026-07-04 09:18", type: "调用扣费", amount: -15.20, target: "sk-****1a9b / Claude 3.5", balance: 747.06, source: "个人充值" as const, flow: "扣减" as const },
];

/* ================================================================
   Page
   ================================================================ */
export default function BillingPage() {
  const [toast, setToast] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [flowType, setFlowType] = useState("全部类型");
  const [sourceType, setSourceType] = useState("全部来源");
  const [timeRange, setTimeRange] = useState("最近 7 日");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const filteredRows = useMemo(() => {
    return BILL_ROWS.filter((r) => {
      if (flowType !== "全部类型" && ((flowType === "资金转入" && r.flow !== "转入") || (flowType === "资金扣减" && r.flow !== "扣减"))) return false;
      if (sourceType !== "全部来源" && r.source !== sourceType) return false;
      return true;
    });
  }, [flowType, sourceType]);

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

      {/* Balance cards — split into enterprise + personal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>企业分配</div>
          <div style={{ fontSize: "var(--text-display-lg)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            ¥ {ENTERPRISE_BALANCE.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>个人充值</div>
          <div style={{ fontSize: "var(--text-display-lg)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            ¥ {PERSONAL_BALANCE.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {TOTAL_BALANCE > 0 && (
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)" }}>
        {isEmployee && (
          <button onClick={() => setInvoiceOpen(true)} style={{ height: 44, padding: "0 var(--spacing-xl)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>
            申请发票
          </button>
        )}
        <button onClick={() => showToast("充值请求已提交，请完成支付")} style={{ height: 44, padding: "0 var(--spacing-xl)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>
          立即充值
        </button>
      </div>
      )}

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

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)", flexWrap: "wrap" }}>
          <Sel value={flowType} onChange={setFlowType} options={["全部类型", "资金转入", "资金扣减"]} />
          <Sel value={sourceType} onChange={setSourceType} options={["全部来源", "企业分配", "个人充值"]} />
          <Sel value={timeRange} onChange={setTimeRange} options={["最近 7 日", "本月", "自定义"]} />
        </div>

        <div style={{ overflow: "auto", padding: "0 var(--spacing-lg) var(--spacing-lg)" }}>
          <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", marginTop: "var(--spacing-sm)" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                <Th>时间</Th>
                <Th>流水类型</Th>
                <Th>资金来源</Th>
                <Th right>变动金额</Th>
                <Th>关联对象</Th>
                <Th right>当前余额</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, i) => (
                <tr key={i} style={{ height: 44 }}>
                  <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{r.time}</Td>
                  <Td>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: r.flow === "转入" ? "#059669" : "var(--color-muted)", backgroundColor: r.flow === "转入" ? "#ECFDF5" : "var(--color-surface-card)", borderRadius: "var(--radius-sm)" }}>{r.type}</span>
                  </Td>
                  <Td>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: r.source === "企业分配" ? "#2563EB" : "#D97706", backgroundColor: r.source === "企业分配" ? "#EFF6FF" : "#FFFBEB", borderRadius: "var(--radius-sm)" }}>{r.source}</span>
                  </Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: r.amount > 0 ? "#059669" : "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{r.amount > 0 ? `+ ${r.amount.toFixed(2)}` : `- ${Math.abs(r.amount).toFixed(2)}`}</Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.target}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>¥ {r.balance.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: "var(--spacing-sm)", textAlign: "center" }}>共 {filteredRows.length} 条</p>
        </div>
      </div>

      {/* Invoice modal */}
      {invoiceOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div style={{ width: 480, maxWidth: "90vw", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <div style={{ padding: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
              <span style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)" }}>申请开具发票</span>
            </div>
            <InvoiceForm onClose={() => setInvoiceOpen(false)} showToast={showToast} />
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceForm({ onClose, showToast }: { onClose: () => void; showToast: (m: string) => void }) {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!amount || !email.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      showToast("发票申请已提交，3 个工作日内发送至您的邮箱");
    }, 800);
  };

  return (
    <div style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>发票抬头 <span style={{ color: "var(--color-error)" }}>*</span></span>
        <input value="limAPI（银弹科技）" readOnly style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-muted)", background: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", cursor: "not-allowed" }} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>税号 <span style={{ color: "var(--color-muted)" }}>（选填）</span></span>
        <input value="91310104MA7ADEF123" readOnly style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-muted)", background: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", cursor: "not-allowed" }} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>申请开票金额 <span style={{ color: "var(--color-error)" }}>*</span></span>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0} placeholder="仅限个人充值部分余额" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-ink)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-hairline)"; }} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>接收邮箱 <span style={{ color: "var(--color-error)" }}>*</span></span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-ink)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-hairline)"; }} />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-sm)" }}>
        <button onClick={onClose} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
        <button onClick={handleSubmit} disabled={submitting} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: submitting ? "#9CA3AF" : "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "提交中..." : "提交开票申请"}
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: "var(--spacing-xs)" }}>
        <button onClick={() => showToast("历史发票下载功能即将上线")} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "Inter, sans-serif", padding: 0 }}>
          下载历史发票
        </button>
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

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ height: 34, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}
