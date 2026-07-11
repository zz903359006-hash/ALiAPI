"use client";

import { useState } from "react";

const MEMBER_DATA = [
  {
    name: "张三", consumed: 125.50, budget: 500, balance: 374.50,
    keys: [{ name: "生产环境主 Key", mask: "sk-a***d", status: "正常" as const, consumed: 85.30 }, { name: "测试环境 Key", mask: "sk-t***m", status: "正常" as const, consumed: 40.20 }],
    models: [
      { name: "Deepseek-chat", pct: 45, consumed: 56.23 },
      { name: "Qwen-plus", pct: 30, consumed: 37.50 },
      { name: "其他模型", pct: 25, consumed: 31.77 },
    ],
  },
  {
    name: "李芳", consumed: 89.20, budget: 300, balance: 5.00,
    keys: [{ name: "客服机器人 Key", mask: "sk-k***b", status: "正常" as const, consumed: 89.20 }],
    models: [
      { name: "GPT-4o", pct: 55, consumed: 49.06 },
      { name: "Claude 3.5", pct: 30, consumed: 26.76 },
      { name: "其他模型", pct: 15, consumed: 13.38 },
    ],
  },
  {
    name: "赵强", consumed: 62.00, budget: 400, balance: 338.00,
    keys: [{ name: "投放分析 Key", mask: "sk-t***f", status: "正常" as const, consumed: 62.00 }],
    models: [
      { name: "Deepseek-chat", pct: 60, consumed: 37.20 },
      { name: "Qwen-plus", pct: 25, consumed: 15.50 },
      { name: "其他模型", pct: 15, consumed: 9.30 },
    ],
  },
];

const totalConsumed = MEMBER_DATA.reduce((s, m) => s + m.consumed, 0);
const totalBudget = 5000;
const pct = Math.min(100, (totalConsumed / totalBudget) * 100);
const barColor = pct < 50 ? "var(--color-success)" : pct < 80 ? "var(--color-warning)" : "var(--color-error)";
const COMPANY_BALANCE = 8521.00;

export default function MembersPage() {
  const [members, setMembers] = useState(MEMBER_DATA);
  const [drawerMember, setDrawerMember] = useState<typeof MEMBER_DATA[0] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [reclaimTarget, setReclaimTarget] = useState<string | null>(null);
  const [reclaimed, setReclaimed] = useState(false);
  const [toast, setToast] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const topUpExceeds = parseFloat(addAmount || "0") > COMPANY_BALANCE;
  const [phone, setPhone] = useState("");
  const [memberName, setMemberName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const [budgetAction, setBudgetAction] = useState("disable");
  const [allocation, setAllocation] = useState("");
  const allocationExceeds = parseFloat(allocation || "0") > COMPANY_BALANCE;

  const handleAdd = () => {
    if (!phone.trim() || allocationExceeds) return;
    setAddOpen(false);
    setPhone("");
    setMemberName("");
    setMonthlyBudget(500);
    setBudgetAction("disable");
    setAllocation("");
  };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", margin: 0 }}>
          成员
        </h1>
      </div>

      {/* Budget health bar */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-lg)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-xs)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)" }}>本月总消耗</span>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>¥{totalConsumed.toFixed(2)} / ¥{totalBudget.toFixed(2)}</span>
            </div>
            <div style={{ height: 8, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: "var(--radius-full)", backgroundColor: barColor, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-sm)" }}>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>活跃成员 4 人</span>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>已超额 0 人</span>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-warning)" }}>临期预警 1 人</span>
            </div>
          </div>
          <button onClick={() => setAddOpen(true)} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, marginTop: -2 }}>
            添加成员
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F9FAFB" }}>
              <Th>成员姓名</Th>
              <Th>预算消耗进度</Th>
              <Th right>本月消耗</Th>
              <Th right>当前余额 (¥)</Th>
              <Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => {
              const p = Math.min(100, (m.consumed / m.budget) * 100);
              const c = "#000000";
              const isEditing = editingKey === m.name;
              return (
                <tr key={i} style={{ height: 44 }}>
                  <Td>
                    <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{m.name}</span>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>¥{m.consumed.toFixed(2)} / ¥{m.budget.toFixed(2)}</span>
                      <div style={{ width: 120, height: 4, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", overflow: "hidden" }}>
                        <div style={{ width: `${p}%`, height: "100%", borderRadius: "var(--radius-full)", backgroundColor: c }} />
                      </div>
                    </div>
                  </Td>
                  <Td right>
                    <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>¥{m.consumed.toFixed(2)}</span>
                  </Td>
                  <Td right>
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                        <div style={{ position: "relative" }}>
                          <input
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            type="number"
                            min={0}
                            placeholder="金额"
                            autoFocus
                            style={{ width: 80, height: 28, padding: "0 6px", fontSize: "var(--text-caption)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", outline: "none" }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && addAmount) {
                                setMembers((prev) => prev.map((mm) => mm.name === m.name ? { ...mm, balance: parseFloat(addAmount) } : mm));
                                setEditingKey(null);
                                setAddAmount("");
                                showToast(`已将 ${m.name} 余额修改为 ¥ ${parseFloat(addAmount).toFixed(2)}`);
                              }
                            }}
                          />
                          {topUpExceeds && <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 2, fontSize: 10, color: "var(--color-error)", whiteSpace: "nowrap" }}>余额不足</div>}
                        </div>
                        <button
                          onClick={() => {
                            if (!addAmount) return;
                            setMembers((prev) => prev.map((mm) => mm.name === m.name ? { ...mm, balance: parseFloat(addAmount) } : mm));
                            setEditingKey(null);
                            setAddAmount("");
                            showToast(`已将 ${m.name} 余额修改为 ¥ ${parseFloat(addAmount).toFixed(2)}`);
                          }}
                          style={{ fontSize: 11, fontWeight: 500, color: "var(--color-success)", background: "none", border: "none", cursor: "pointer", padding: "1px 4px", lineHeight: "18px" }}
                        >
                          确认
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: m.balance < 10 ? "var(--color-error)" : "var(--color-ink)" }}>
                          {m.balance.toFixed(2)}
                        </span>
                        <button
                          onClick={() => { setEditingKey(m.name); setAddAmount(""); }}
                          style={{ fontSize: 11, fontWeight: 500, color: "var(--color-muted)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: "1px 6px", lineHeight: "18px" }}
                        >
                          修改
                        </button>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <button onClick={() => { setDrawerMember(m); setReclaimed(false); }} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      查看详情
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerMember && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 999, backgroundColor: "rgba(0,0,0,0.3)" }} onClick={() => setDrawerMember(null)} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 1000, width: 420, maxWidth: "90vw", backgroundColor: "var(--color-canvas)", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            {/* Drawer header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)", flexShrink: 0 }}>
              <span style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)" }}>{drawerMember.name} 的使用详情</span>
              <button onClick={() => setDrawerMember(null)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--color-muted)", borderRadius: "var(--radius-md)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4L12 12M12 4L4 12" /></svg>
              </button>
            </div>

            {/* Drawer body */}
            <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-xl)" }}>
              {/* Top: Three financial metrics */}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)", marginBottom: "var(--spacing-md)" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>月度预算上限</div>
                    <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>¥{drawerMember.budget.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>本月已消耗</div>
                    <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>¥{drawerMember.consumed.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--spacing-sm)" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>可用余额</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: "var(--color-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                      {reclaimed ? "¥ 0.00" : `¥${(drawerMember.budget - drawerMember.consumed).toFixed(2)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setReclaimTarget(drawerMember.name)}
                    disabled={reclaimed || (drawerMember.budget - drawerMember.consumed) <= 0}
                    style={{ height: 32, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: (reclaimed || (drawerMember.budget - drawerMember.consumed) <= 0) ? "var(--color-muted-soft)" : "var(--color-error)", background: "var(--color-canvas)", border: `1px solid ${(reclaimed || (drawerMember.budget - drawerMember.consumed) <= 0) ? "var(--color-hairline)" : "var(--color-error)"}`, borderRadius: "var(--radius-md)", cursor: (reclaimed || (drawerMember.budget - drawerMember.consumed) <= 0) ? "not-allowed" : "pointer", opacity: (reclaimed || (drawerMember.budget - drawerMember.consumed) <= 0) ? 0.4 : 1, flexShrink: 0 }}
                  >
                    回收余额
                  </button>
                </div>
              </div>

              {/* Middle: Model distribution */}
              <div>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-md)" }}>资金流向 · 模型分布</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                  {drawerMember.models.map((model, mi) => {
                    const colors = ["#000000", "#333333", "#666666"];
                    return (
                      <div key={mi}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{model.name}</span>
                          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{model.pct}% · ¥{model.consumed.toFixed(2)}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", overflow: "hidden" }}>
                          <div style={{ width: `${model.pct}%`, height: "100%", borderRadius: "var(--radius-full)", backgroundColor: colors[mi] || "#DBEAFE" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom: Key list with status */}
              <div>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-md)" }}>当前持有凭证</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {drawerMember.keys.map((k, ki) => (
                    <div key={ki} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-sm) 0", borderBottom: ki < drawerMember.keys.length - 1 ? "1px solid var(--color-hairline-soft)" : "none" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-success)", flexShrink: 0 }} />
                          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)" }}>{k.name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginLeft: 12 }}>{k.mask}</span>
                      </div>
                      <button style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-error)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>
                        停用
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reclaim quota modal */}
      {reclaimTarget && drawerMember && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setReclaimTarget(null)}>
          <div style={{ width: 400, maxWidth: "90vw", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
              <span style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)" }}>回收余额</span>
            </div>
            <div style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.6 }}>
                确认将 {reclaimTarget} 剩余的 ¥ {(drawerMember ? (drawerMember.budget - drawerMember.consumed) : 0).toFixed(2)} 全部回收到公司账户吗？
              </span>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)" }}>
                <button onClick={() => setReclaimTarget(null)} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
                <button onClick={() => { setReclaimed(true); setReclaimTarget(null); showToast("余额已回收"); }} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>确认回收</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setAddOpen(false)}>
          <div style={{ width: 460, maxWidth: "90vw", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
              <span style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)" }}>添加成员</span>
            </div>
            <div style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>手机号 <span style={{ color: "var(--color-error)" }}>*</span></span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="138****8888" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>姓名 <span style={{ color: "var(--color-muted)" }}>（选填）</span></span>
                <input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="张三" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>月度预算</span>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                  <input value={monthlyBudget} onChange={(e) => setMonthlyBudget(Number(e.target.value))} type="number" min={0} style={{ height: 40, width: 120, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>¥/月</span>
                </div>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>分配额度 (¥)</span>
                <input value={allocation} onChange={(e) => setAllocation(e.target.value)} type="number" min={0} placeholder="输入划拨金额" style={{ height: 40, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-md)", color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-ink)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-hairline)"} />
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>公司账户当前余额：¥ {COMPANY_BALANCE.toFixed(2)}</span>
              </label>
              <div>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-sm)" }}>达到预算后操作</div>
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  {[
                    { key: "disable", label: "直接停用他的调用" },
                    { key: "warn", label: "只发邮件提醒我" },
                  ].map((opt) => {
                    const selected = budgetAction === opt.key;
                    return (
                      <div key={opt.key} onClick={() => setBudgetAction(opt.key)}
                        style={{ flex: 1, padding: "var(--spacing-md) var(--spacing-sm)", borderRadius: "var(--radius-lg)", cursor: "pointer", textAlign: "center",
                          border: `2px solid ${selected ? "var(--color-ink)" : "var(--color-hairline)"}`,
                          backgroundColor: selected ? "var(--color-surface-soft)" : "var(--color-canvas)" }}>
                        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: selected ? 600 : 400, color: selected ? "var(--color-ink)" : "var(--color-body)" }}>{opt.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {allocationExceeds && (
                <div style={{ fontSize: "var(--text-caption)", color: "var(--color-error)", textAlign: "right" }}>公司余额不足，请先前往财务页充值</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-sm)" }}>
                <button onClick={() => setAddOpen(false)} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
                <button onClick={handleAdd} disabled={allocationExceeds} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: allocationExceeds ? "#9CA3AF" : "var(--color-on-primary)", backgroundColor: allocationExceeds ? "var(--color-surface-strong)" : "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: allocationExceeds ? "not-allowed" : "pointer" }}>确认添加</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}
