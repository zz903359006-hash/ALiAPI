"use client";

import { useState } from "react";

type InvoiceStatus = false | "processing" | true;

const MONTHLY_BILLS: { month: string; consumed: number; memberCount: number; invoiced: InvoiceStatus; invoiceId: string | null; calls: number; members: { name: string; amount: number; pct: number }[]; models: { name: string; pct: number }[] }[] = [
  { month: "2026年7月", consumed: 1250.00, memberCount: 4, invoiced: false, invoiceId: null, calls: 8420,
    members: [
      { name: "张三", amount: 520.00, pct: 42 },
      { name: "李芳", amount: 310.00, pct: 25 },
      { name: "赵强", amount: 270.00, pct: 22 },
      { name: "王五", amount: 150.00, pct: 11 },
    ],
    models: [
      { name: "DeepSeek-chat", pct: 45 },
      { name: "Qwen-plus", pct: 30 },
      { name: "GPT-4o", pct: 25 },
    ],
  },
  { month: "2026年6月", consumed: 980.00, memberCount: 4, invoiced: true, invoiceId: "INV-202606-001", calls: 7210,
    members: [
      { name: "李芳", amount: 360.00, pct: 37 },
      { name: "张三", amount: 290.00, pct: 30 },
      { name: "赵强", amount: 210.00, pct: 21 },
      { name: "王五", amount: 120.00, pct: 12 },
    ],
    models: [
      { name: "DeepSeek-chat", pct: 50 },
      { name: "GPT-4o", pct: 30 },
      { name: "Claude 3.5", pct: 20 },
    ],
  },
  { month: "2026年5月", consumed: 1450.00, memberCount: 3, invoiced: true, invoiceId: "INV-202605-003", calls: 10300,
    members: [
      { name: "赵强", amount: 620.00, pct: 43 },
      { name: "张三", amount: 480.00, pct: 33 },
      { name: "李芳", amount: 350.00, pct: 24 },
    ],
    models: [
      { name: "Qwen-plus", pct: 40 },
      { name: "DeepSeek-chat", pct: 35 },
      { name: "Claude 3.5", pct: 25 },
    ],
  },
];

export default function AdminBillingPage() {
  const [bills, setBills] = useState(MONTHLY_BILLS);
  const [invoiceMonth, setInvoiceMonth] = useState<string | null>(null);
  const [detailMonth, setDetailMonth] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", margin: 0 }}>
          财务
        </h1>
      </div>

      {/* Balance hero — clean, only balance + recharge */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>当前可用余额</div>
            <div style={{ fontSize: 48, fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              ¥ 12,345.60
            </div>
          </div>
          <button style={{ height: 44, padding: "0 var(--spacing-xl)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            立即充值
          </button>
        </div>
      </div>

      {/* Monthly bill summary */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>
        <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>月度账单与开票</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
          {MONTHLY_BILLS.map((bill) => {
            const isInvoiced = bill.invoiced === true;
            const isProcessing = bill.invoiced === "processing";
            return (
              <div key={bill.month} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-md) var(--spacing-sm)", borderBottom: `1px solid var(--color-hairline-soft)` }}>
                <div>
                  <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{bill.month}账单</div>
                  <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-primary)", fontFamily: "var(--font-display)", marginTop: 4 }}>¥ {bill.consumed.toFixed(2)}</div>
                  <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>{bill.memberCount} 名成员</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                  <button onClick={() => setDetailMonth(bill.month)} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    详情
                  </button>
                  {isInvoiced ? (
                    <button onClick={() => showToast(`发票 ${bill.invoiceId} 即将开放下载`)} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                      下载发票
                    </button>
                  ) : isProcessing ? (
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)", cursor: "not-allowed" }}>处理中</span>
                  ) : (
                    <button onClick={() => setInvoiceMonth(bill.month)} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>
                      申请开票
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail drawer */}
      {detailMonth && (() => {
        const bill = MONTHLY_BILLS.find((b) => b.month === detailMonth)!;
        return (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 999, backgroundColor: "rgba(0,0,0,0.3)" }} onClick={() => setDetailMonth(null)} />
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 1000, width: 420, maxWidth: "90vw", backgroundColor: "var(--color-canvas)", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)", flexShrink: 0 }}>
                <span style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)" }}>{bill.month} 账单详情</span>
                <button onClick={() => setDetailMonth(null)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--color-muted)", borderRadius: "var(--radius-md)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4L12 12M12 4L4 12" /></svg>
                </button>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-xl)" }}>
                {/* Block 1: Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-md)" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>本月总消耗</div>
                    <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-primary)" }}>¥{bill.consumed.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>消耗成员数</div>
                    <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{bill.memberCount} 人</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>调用次数</div>
                    <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{bill.calls.toLocaleString()} 次</div>
                  </div>
                </div>

                {/* Block 2: Member breakdown */}
                <div>
                  <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-md)" }}>成员消耗明细</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {bill.members.map((m, mi) => (
                      <div key={mi} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-sm) 0", borderBottom: mi < bill.members.length - 1 ? "1px solid var(--color-hairline-soft)" : "none" }}>
                        <span style={{ width: 80, fontSize: "var(--text-body-sm)", color: "var(--color-ink)", flexShrink: 0 }}>{m.name}</span>
                        <span style={{ width: 80, fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", textAlign: "right", flexShrink: 0 }}>¥{m.amount.toFixed(2)}</span>
                        <div style={{ flex: 1, height: 6, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", overflow: "hidden" }}>
                          <div style={{ width: `${m.pct}%`, height: "100%", borderRadius: "var(--radius-full)", backgroundColor: ["#000000", "#333333", "#666666", "#999999"][mi] }} />
                        </div>
                        <span style={{ width: 36, fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-muted)", textAlign: "right", flexShrink: 0 }}>{m.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Block 3: Model distribution */}
                <div>
                  <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-md)" }}>模型消耗分布</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                    {bill.models.map((md, mi) => {
                      const colors = ["#000000", "#333333", "#666666"];
                      return (
                        <div key={mi}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{md.name}</span>
                            <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{md.pct}%</span>
                          </div>
                          <div style={{ height: 4, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", overflow: "hidden" }}>
                            <div style={{ width: `${md.pct}%`, height: "100%", borderRadius: "var(--radius-full)", backgroundColor: colors[mi] || "#DBEAFE" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom action bar */}
              <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderTop: "1px solid var(--color-hairline)", flexShrink: 0 }}>
                {bill.invoiced ? (
                  <button onClick={() => showToast(`发票 ${bill.invoiceId} 即将开放下载`)} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-muted)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", width: "100%" }}>
                    下载发票
                  </button>
                ) : (
                  <button onClick={() => { setDetailMonth(null); setInvoiceMonth(bill.month); }} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", width: "100%" }}>
                    申请开票
                  </button>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* Invoice modal */}
      {invoiceMonth && (() => {
        const bill = bills.find((b) => b.month === invoiceMonth)!;
        const maxAmt = bill.consumed;
        const [amt, setAmt] = useState(maxAmt);
        const exceeds = amt > maxAmt;
        return (
        <div key={invoiceMonth} style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setInvoiceMonth(null)}>
          <div style={{ width: 460, maxWidth: "90vw", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
              <span style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)" }}>申请开具发票</span>
            </div>
            <div style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", lineHeight: 1.6, padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-sm)" }}>
                正在申请开具 {invoiceMonth} 的发票<br />当前可开票金额：¥ {maxAmt.toFixed(2)}
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>发票抬头</span>
                <input value="AliAPI（银弹科技）" readOnly style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-muted)", background: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", cursor: "not-allowed" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>税号</span>
                <input value="91310104MA7ADEF123" readOnly style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-muted)", background: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", cursor: "not-allowed" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>接收邮箱</span>
                <input value="billing@aliplatform.com" readOnly style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-muted)", background: "var(--color-surface-soft)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", cursor: "not-allowed" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>开票金额 <span style={{ color: "var(--color-error)" }}>*</span></span>
                <input value={amt} onChange={(e) => setAmt(Number(e.target.value))} type="number" min={0} style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: `1px solid ${exceeds ? "var(--color-error)" : "var(--color-hairline)"}`, borderRadius: "var(--radius-md)", outline: "none", width: "100%" }}
                  onFocus={(e) => { if (!exceeds) e.currentTarget.style.borderColor = "var(--color-ink)"; }} onBlur={(e) => { if (!exceeds) e.currentTarget.style.borderColor = "var(--color-hairline)"; }} />
                {exceeds && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}>超出可开票金额上限 ¥{maxAmt.toFixed(2)}</span>}
              </label>
              <div style={{ textAlign: "right" }}>
                <button onClick={() => showToast("请前往设置页修改开票资料")} style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  修改开票资料
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-sm)" }}>
                <button onClick={() => setInvoiceMonth(null)} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
                <button onClick={() => {
                  if (exceeds) return;
                  setBills((prev) => prev.map((b) => b.month === invoiceMonth ? { ...b, invoiced: "processing" as InvoiceStatus } : b));
                  setInvoiceMonth(null);
                  showToast("开票申请已提交，发票将在 3 个工作日内发送至您的邮箱");
                }} disabled={exceeds} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: exceeds ? "#9CA3AF" : "var(--color-on-primary)", backgroundColor: exceeds ? "var(--color-surface-strong)" : "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: exceeds ? "not-allowed" : "pointer" }}>提交开票申请</button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
