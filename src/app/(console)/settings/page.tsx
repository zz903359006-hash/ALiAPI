"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";

export default function SettingsPage() {
  const [dataRetention, setDataRetention] = useState(true);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [defaultStrategy, setDefaultStrategy] = useState("性价比优先");
  const [defaultFallback, setDefaultFallback] = useState("DeepSeek V3");
  const [autoDegrade, setAutoDegrade] = useState(true);
  const [balanceAlert, setBalanceAlert] = useState(true);
  const [balanceThreshold, setBalanceThreshold] = useState("10");
  const [expiryAlert, setExpiryAlert] = useState(true);
  const [expiryDays, setExpiryDays] = useState("7");
  const [bigSpendAlert, setBigSpendAlert] = useState(true);
  const [notifyChannels, setNotifyChannels] = useState<Set<string>>(new Set(["站内"]));
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [taxId, setTaxId] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [address, setAddress] = useState("");
  const [toast, setToast] = useState("");

  const [byokKeys, setByokKeys] = useState([
    { provider: "OpenAI", label: "OpenAI", keyMasked: "sk-****...abcd", color: "#10A37F", status: "正常" },
    { provider: "Anthropic", label: "Anthropic", keyMasked: "sk-ant-****...xyz", color: "#D4A574", status: "正常" },
  ]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [addProvider, setAddProvider] = useState("OpenAI");
  const [addKey, setAddKey] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const toggleChannel = (ch: string) => {
    setNotifyChannels((prev) => {
      const next = new Set(prev);
      next.has(ch) ? next.delete(ch) : next.add(ch);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Confirm modal */}
      {showRetentionModal && (
        <div className="fixed inset-0 z-50" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div style={{ width: 400, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-sm)" }}>确认关闭数据服务</h3>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", margin: "0 0 var(--spacing-lg)", lineHeight: 1.6 }}>
              关闭后请求日志和 AI 保险补偿将不可用，历史数据将在 30 天后清除。是否继续？
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)" }}>
              <button onClick={() => setShowRetentionModal(false)} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
              <button onClick={() => { setDataRetention(false); setShowRetentionModal(false); showToast("已关闭数据服务，进入 ZDR 模式"); }} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "#fff", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>确认关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: "var(--spacing-xl)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/settings")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
          管理数据隐私、路由策略、通知偏好与账单信息。
        </p>
      </div>

      {/* Card 1: 数据留存与隐私 */}
      <Card title="数据留存与隐私">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-lg)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", marginBottom: 4 }}>启用数据服务</div>
            <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: 0, lineHeight: 1.6 }}>
              开启后将记录请求日志以供观测并触发 AI 保险补偿。关闭则进入 Zero Data Retention (ZDR) 模式，系统不留存任何 Prompt 与响应。
            </p>
          </div>
          <Switch checked={dataRetention} onChange={() => dataRetention ? setShowRetentionModal(true) : (setDataRetention(true), showToast("已开启数据服务"))} />
        </div>
      </Card>

      {/* Card 2: 全局默认路由 */}
      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <Card title="全局默认路由">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 400 }}>
            <Field label="默认策略">
              <select value={defaultStrategy} onChange={(e) => setDefaultStrategy(e.target.value)} style={selS}>
                {["性价比优先", "最低成本", "最高质量", "最低延迟"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="默认备用模型">
              <select value={defaultFallback} onChange={(e) => setDefaultFallback(e.target.value)} style={selS}>
                {["DeepSeek V3", "GPT-4o", "Claude 3.5", "通义千问 Max"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>允许 Auto 路由自动降级</div>
                <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>上游故障时自动切换至备用模型</div>
              </div>
              <Switch checked={autoDegrade} onChange={() => setAutoDegrade(!autoDegrade)} />
            </div>
            <button onClick={() => showToast("路由默认设置已保存")} style={primaryBtn}>保存路由默认设置</button>
          </div>
        </Card>
      </div>

      {/* Card 3: 通知与告警偏好 */}
      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <Card title="通知与告警偏好">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 400 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>余额低于阈值预警</div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", marginTop: 4 }}>
                  <input type="number" value={balanceThreshold} onChange={(e) => setBalanceThreshold(e.target.value)} style={inpS} />
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>%</span>
                </div>
              </div>
              <Switch checked={balanceAlert} onChange={() => setBalanceAlert(!balanceAlert)} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>临期额度提前提醒</div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", marginTop: 4 }}>
                  <input type="number" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} style={inpS} />
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>天</span>
                </div>
              </div>
              <Switch checked={expiryAlert} onChange={() => setExpiryAlert(!expiryAlert)} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>大额异常消费预警</span>
              <Switch checked={bigSpendAlert} onChange={() => setBigSpendAlert(!bigSpendAlert)} />
            </div>

            <div>
              <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)" }}>通知接收渠道</div>
              <div style={{ display: "flex", gap: "var(--spacing-lg)" }}>
                {["站内", "邮件", "企业微信 Webhook"].map((ch) => (
                  <label key={ch} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-body)", cursor: "pointer" }}>
                    <input type="checkbox" checked={notifyChannels.has(ch)} onChange={() => toggleChannel(ch)} style={{ cursor: "pointer" }} />
                    {ch}
                  </label>
                ))}
              </div>
            </div>

            <button onClick={() => showToast("通知偏好已保存")} style={primaryBtn}>保存通知偏好</button>
          </div>
        </Card>
      </div>

      {/* Card 4: 账单与发票信息 */}
      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <Card title="账单信息">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 400 }}>
            <Field label="发票抬头">
              <input value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} placeholder="例：XX 科技有限公司" style={inpS} />
            </Field>
            <Field label="税号">
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="统一社会信用代码" style={inpS} />
            </Field>
            <Field label="开票邮箱">
              <input value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} placeholder="invoice@example.com" style={inpS} />
            </Field>
            <Field label="邮寄地址">
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="省/市/区/详细地址" style={inpS} />
            </Field>
            <button onClick={() => showToast("账单信息已保存")} style={primaryBtn}>保存账单信息</button>
          </div>
        </Card>
      </div>

      {/* Card 5: 自有密钥 (BYOK) */}
      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <Card title="自有密钥 (BYOK)">
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginBottom: "var(--spacing-lg)", lineHeight: 1.6 }}>
            添加你的 OpenAI / Anthropic / Google / DeepSeek 等厂商的 Key。调用时将优先使用你的账户密钥，系统会在密钥不可用时自动回退至平台余额。
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {byokKeys.map((k: any) => (
              <div key={k.provider} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", padding: "var(--spacing-sm) var(--spacing-md)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: k.color, flexShrink: 0 }} />
                <span style={{ width: 80, fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", flexShrink: 0 }}>{k.label}</span>
                <code style={{ flex: 1, fontSize: "var(--text-caption)", color: "var(--color-muted)", fontFamily: "monospace" }}>{k.keyMasked}</code>
                <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: k.status === "正常" ? "var(--color-success)" : k.status === "余额不足" ? "var(--color-warning)" : "var(--color-error)", whiteSpace: "nowrap" }}>{k.status}</span>
                <button onClick={() => { setByokKeys((prev: any[]) => prev.filter((x: any) => x.provider !== k.provider)); showToast(k.label + " 密钥已移除"); }} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-error)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: "var(--radius-xs)" }}>删除</button>
              </div>
            ))}
            <button onClick={() => setShowAddKey(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 40, border: "1px dashed var(--color-hairline)", borderRadius: "var(--radius-md)", background: "none", cursor: "pointer", color: "var(--color-muted)", fontSize: "var(--text-body-sm)", fontWeight: 500 }}>+ 添加密钥</button>
          </div>
        </Card>
      </div>

      {/* Add Key Modal */}
      {showAddKey && (
        <div className="fixed inset-0 z-50" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div style={{ width: 400, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
              <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: 0, fontFamily: "var(--font-display)" }}>添加自有密钥</h3>
              <button onClick={() => setShowAddKey(false)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", borderRadius: "var(--radius-full)" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <Field label="提供商">
                <select value={addProvider} onChange={(e) => setAddProvider(e.target.value)} style={selS}>
                  {["OpenAI", "Anthropic", "Google", "DeepSeek", "阿里云"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Key">
                <input value={addKey} onChange={(e) => setAddKey(e.target.value)} placeholder="sk-..." style={inpS} />
              </Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-lg)" }}>
              <button onClick={() => setShowAddKey(false)} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
              <button onClick={() => { if (!addKey.trim()) return; setByokKeys((prev: any[]) => [...prev, { provider: addProvider, label: addProvider, keyMasked: addKey.slice(0, 5) + "****..." + addKey.slice(-4), color: "#6B7280", status: "正常" }]); setAddKey(""); setShowAddKey(false); showToast(addProvider + " 密钥已添加"); }} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "#fff", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>确认添加</button>
            </div>
          </div>
        </div>
      )}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", padding: 0, position: "relative", backgroundColor: checked ? "var(--color-primary)" : "var(--color-surface-strong)", transition: "background 0.2s", flexShrink: 0 }}
    >
      <span style={{ display: "block", width: 18, height: 18, borderRadius: "50%", backgroundColor: "#fff", position: "absolute", top: 3, left: checked ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
    </button>
  );
}

const primaryBtn: React.CSSProperties = { height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", alignSelf: "flex-start" };

const inpS: React.CSSProperties = { height: 36, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%", boxSizing: "border-box" };

const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", width: "100%", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
