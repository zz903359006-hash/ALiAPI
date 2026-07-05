"use client";

import { useState, useEffect } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";

/* ================================================================
   Mock data
   ================================================================ */
interface LogRow {
  id: string;
  time: string;
  requestId: string;
  team: string;
  member: string;
  keyName: string;
  keyMask: string;
  model: string;
  modelCategory: string;
  vendor: string;
  inputTokens: number;
  outputTokens: number;
  costTokens: string;
  costRmb: string;
  status: "success" | "biz_error" | "gateway_error" | "empty_output" | "hallucination" | "low_quality";
  insured: boolean;
  billType: string;
  routingStrategy: string;
  routingReason: string;
  routedModel: string;
  routedVendor: string;
  degraded: boolean;
  prompt: string;
  response: string;
  hle: { score: number; accuracy: number; hallucination: number; stability: number; latency: number } | null;
  compensation: { type: string; amount: string; recordId: string; status: string } | null;
}

const MOCK_LOGS: LogRow[] = [
  {
    id: "log-01", time: "2026-06-26 14:32:10", requestId: "req-a1b2c3d4", team: "AI 平台部", member: "张明",
    keyName: "生产环境主 Key", keyMask: "sk-****8f2c", model: "GPT-4o", modelCategory: "通用对话", vendor: "OpenAI",
    inputTokens: 1234, outputTokens: 2345, costTokens: "3,579", costRmb: "¥ 0.123", status: "success",
    insured: false, billType: "付费",
    routingStrategy: "性价比优先", routingReason: "成本/质量/延迟综合得分最高", routedModel: "GPT-4o", routedVendor: "OpenAI", degraded: false,
    prompt: "请分析以下用户反馈并给出改进建议:\n\n用户反馈: \"产品很好用，但加载速度有时较慢...\"",
    response: "根据用户反馈分析：\n\n1. 整体满意度：正面\n2. 核心问题：加载速度\n3. 建议：优化前端资源加载...",
    hle: { score: 0.87, accuracy: 0.92, hallucination: 0.05, stability: 0.88, latency: 0.82 },
    compensation: null,
  },
  {
    id: "log-02", time: "2026-06-26 14:31:55", requestId: "req-e5f6a7b8", team: "客服中心", member: "李芳",
    keyName: "客服机器人 Key", keyMask: "sk-****1a9b", model: "通义千问 Max", modelCategory: "通用对话", vendor: "阿里云",
    inputTokens: 890, outputTokens: 1560, costTokens: "2,450", costRmb: "¥ 0.068", status: "gateway_error",
    insured: true, billType: "保险",
    routingStrategy: "最低成本", routingReason: "成本优先选择最低单价模型", routedModel: "通义千问 Max", routedVendor: "阿里云", degraded: true,
    prompt: "用户: 我的订单什么时候发货？\n历史: [订单#12345 已付款 状态:待发货]",
    response: "(网关超时，已由保险补偿)",
    hle: null,
    compensation: { type: "超时", amount: "¥ 0.068 · 2,450 Tokens", recordId: "CMP-0042", status: "已自动补偿" },
  },
  {
    id: "log-03", time: "2026-06-26 14:30:22", requestId: "req-c9d0e1f2", team: "增长与投放", member: "陈静",
    keyName: "投放分析 Key", keyMask: "sk-****7a4f", model: "DeepSeek V3", modelCategory: "文本生成", vendor: "DeepSeek",
    inputTokens: 2100, outputTokens: 4200, costTokens: "6,300", costRmb: "¥ 0.042", status: "success",
    insured: false, billType: "付费",
    routingStrategy: "性价比优先", routingReason: "DeepSeek 延迟最低性价比最高", routedModel: "DeepSeek V3", routedVendor: "DeepSeek", degraded: false,
    prompt: "生成5条广告文案，产品为智能手环，目标人群25-35岁上班族。",
    response: "1.【健康由你掌控】24小时心率监测，智能提醒...\n2.【轻装上阵】仅重23g，无感佩戴...\n3.【续航之王】充电一次用14天...",
    hle: { score: 0.91, accuracy: 0.95, hallucination: 0.02, stability: 0.90, latency: 0.93 },
    compensation: null,
  },
  {
    id: "log-04", time: "2026-06-26 14:29:40", requestId: "req-3a4b5c6d", team: "数据平台", member: "赵强",
    keyName: "数据导出 Key", keyMask: "sk-****6b0c", model: "Claude 3.5", modelCategory: "代码", vendor: "Anthropic",
    inputTokens: 3400, outputTokens: 1200, costTokens: "4,600", costRmb: "¥ 0.195", status: "hallucination",
    insured: true, billType: "保险",
    routingStrategy: "最高质量", routingReason: "代码生成场景选择质量最高模型", routedModel: "Claude 3.5", routedVendor: "Anthropic", degraded: true,
    prompt: "Write a Python function to parse CSV and generate summary statistics.",
    response: "def parse_csv_and_summarize(filepath):\n    import pandas as pd\n    df = pd.read_csv(filepath)\n    return df.describe()\n# Note: this uses a non-existent attribute 'describe' on DataFrame.",
    hle: { score: 0.42, accuracy: 0.35, hallucination: 0.68, stability: 0.50, latency: 0.88 },
    compensation: { type: "幻觉", amount: "¥ 0.195 · 4,600 Tokens", recordId: "CMP-0043", status: "已自动补偿" },
  },
  {
    id: "log-05", time: "2026-06-26 14:28:05", requestId: "req-7e8f9a0b", team: "AI 平台部", member: "张明",
    keyName: "生产环境主 Key", keyMask: "sk-****8f2c", model: "GPT-4o", modelCategory: "多模态", vendor: "OpenAI",
    inputTokens: 5600, outputTokens: 890, costTokens: "6,490", costRmb: "¥ 0.245", status: "success",
    insured: false, billType: "付费",
    routingStrategy: "性价比优先", routingReason: "综合得分最高", routedModel: "GPT-4o", routedVendor: "OpenAI", degraded: false,
    prompt: "[Image: product_photo.jpg] 请描述这张产品图片的内容，并生成电商标题。",
    response: "图片展示了一款白色智能手表...\n标题：【新品首发】智能健康手表 白色款 14天超长续航",
    hle: { score: 0.93, accuracy: 0.96, hallucination: 0.01, stability: 0.94, latency: 0.85 },
    compensation: null,
  },
];

/* ================================================================
   Page
   ================================================================ */
export default function ObservabilityPage() {
  const [tab, setTab] = useState("logs");
  const [detail, setDetail] = useState<LogRow | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t) setTab(t);
  }, []);

  const tabItems = [
    { key: "logs", label: "请求日志", content: null },
    { key: "insurance", label: "保险补偿", content: null },
    { key: "hle", label: "HLE 质量", content: null },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/observability")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", lineHeight: "var(--text-body-sm--line-height)", color: "var(--color-muted)" }}>
          按时间、团队、模型等维度查看每一次请求的详细记录，支持过滤错误与保险补偿，便于排查与审计。
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Tabs tabs={tabItems} activeKey={tab} onChange={setTab} />
      </div>

      {/* Tab: 请求日志 */}
      {tab === "logs" && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
              <Sel options={["最近 1 小时", "最近 24 小时", "最近 7 日", "自定义"]} />
              <Sel options={["全部团队", "AI 平台部", "客服中心", "增长与投放", "数据平台"]} />
              <Sel options={["全部 Key", "生产环境主 Key", "客服机器人 Key", "投放分析 Key"]} />
              <Sel options={["全部模型", "GPT-4o", "Claude 3.5", "通义千问 Max", "DeepSeek V3"]} />
            </div>
            <div style={{ display: "flex", gap: "var(--spacing-xs)", flexShrink: 0 }}>
              <input placeholder="请求 ID" style={{ ...inpS, width: 140 }} />
              <Sel options={["全部供应商", "OpenAI", "阿里云", "Anthropic", "DeepSeek"]} />
              <Sel options={["全部结果", "成功", "业务错误", "网关错误", "空输出", "幻觉", "低质量"]} />
              <Sel options={["全部保险", "已触发", "未触发"]} />
            </div>
          </div>

          {/* Table */}
          <LogTable data={MOCK_LOGS} onView={setDetail} />
          <Pagi total={MOCK_LOGS.length} />
        </>
      )}

      {/* Tab: 保险补偿 (placeholder) */}
      {tab === "insurance" && <InsuranceTab />}

      {/* Tab: HLE 质量 (placeholder) */}
      {tab === "hle" && <HleTab />}

      {/* Detail Drawer */}
      <LogDrawer data={detail} onClose={() => setDetail(null)} onSwitchTab={setTab} />
    </div>
  );
}

/* ================================================================
   Log Table
   ================================================================ */
function LogTable({ data, onView }: { data: LogRow[]; onView: (r: LogRow) => void }) {
  if (data.length === 0) return <EmptyState />;
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
      <table style={{ width: "100%", minWidth: 1200, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <Th>时间</Th><Th>团队·员工</Th><Th>API Key</Th><Th>模型</Th><Th>路由</Th><Th>Token (入/出)</Th><Th>供应商</Th><Th>费用</Th><Th>状态</Th><Th>保险</Th><Th right>操作</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} style={{ height: 44 }}>
              <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{r.time}</Td>
              <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.team} · {r.member}</Td>
              <Td><div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.keyName}</span><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>{r.keyMask}</span></div></Td>
              <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", fontWeight: 500 }}>{r.model}</Td>
              <Td>
                <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)", whiteSpace: "nowrap", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }} title={r.routingStrategy}>{r.routingStrategy}</span>
              </Td>
              <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.vendor}</Td>
              <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", fontVariantNumeric: "tabular-nums" }}>{r.inputTokens.toLocaleString()} / {r.outputTokens.toLocaleString()}</Td>
              <Td style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{r.costRmb}</Td>
              <Td><StatusBadge s={r.status} /></Td>
              <Td>{r.insured ? <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "#2563EB", backgroundColor: "#EFF6FF", borderRadius: "var(--radius-sm)" }}>已触发</span> : <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted-soft)" }}>—</span>}</Td>
              <Td right><ALink onClick={() => onView(r)}>查看详情</ALink></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Log Detail Drawer
   ================================================================ */
function LogDrawer({ data, onClose, onSwitchTab }: { data: LogRow | null; onClose: () => void; onSwitchTab: (tab: string) => void }) {
  const [toast, setToast] = useState("");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealText, setAppealText] = useState("");
  if (!data) return null;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const costHigh = parseFloat(data.costRmb.replace(/[¥,]/g, "")) > 0.1;
  const hleLow = data.hle && data.hle.score < 0.7;
  const abnormal = data.status !== "success";

  return (
    <>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[999]" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div style={{ width: 380, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-sm)" }}>确认操作</h3>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", margin: "0 0 var(--spacing-lg)" }}>{confirmAction}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)" }}>
              <button onClick={() => setConfirmAction(null)} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
              <button onClick={() => { showToast("已成功加入黑名单，下次调用将自动屏蔽"); setConfirmAction(null); }} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "#fff", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>确认</button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal modal */}
      {appealOpen && (
        <div className="fixed inset-0 z-[999]" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div style={{ width: 420, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-sm)" }}>发起申诉</h3>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: "0 0 var(--spacing-md)" }}>说明申诉理由，我们将人工复核本次保险补偿。</p>
            <textarea value={appealText} onChange={(e) => setAppealText(e.target.value)} placeholder="请描述申诉原因…" style={{ width: "100%", height: 100, padding: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-md)" }}>
              <button onClick={() => { setAppealOpen(false); setAppealText(""); }} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
              <button onClick={() => { showToast("申诉已提交，我们将在 2 个工作日内处理"); setAppealOpen(false); setAppealText(""); }} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "#fff", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>提交申诉</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 560, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between shrink-0" style={{ height: 60, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div>
            <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>请求详情</div>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>请求 ID: {data.requestId} · <StatusBadge s={data.status} /> · {data.time}</div>
          </div>
          <ButXn onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></ButXn>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg) var(--spacing-lg) 0" }}>
          {/* Basic info */}
          <Sec title="基本信息">
            <Fld label="请求 ID" value={data.requestId} mono />
            <Fld label="时间" value={data.time} />
            <Fld label="团队/员工" value={`${data.team} · ${data.member}`} />
            <Fld label="API Key"><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{data.keyName}</span><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginLeft: 8 }}>{data.keyMask}</span></Fld>
            <Fld label="模型" value={data.model} />
            <Fld label="供应商" value={data.vendor} />
            <Fld label="账单类型"><span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: data.billType === "付费" ? "#2563EB" : "#059669", backgroundColor: data.billType === "付费" ? "#EFF6FF" : "#ECFDF5", borderRadius: "var(--radius-sm)" }}>{data.billType}</span></Fld>
          </Sec>

          {/* Usage */}
          <Sec title="用量与费用">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-sm)" }}>
              <div><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block" }}>输入 Token</span><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{data.inputTokens.toLocaleString()}</span></div>
              <div><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block" }}>输出 Token</span><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{data.outputTokens.toLocaleString()}</span></div>
              <div><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block" }}>总 Token</span><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{data.costTokens}</span></div>
              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4, padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)" }}>
                <FeeRow label="原生 Token 成本" desc="模型官方计费" raw={data.costRmb} />
                <FeeRow label="平台服务费" desc="按 5% 计算" raw={data.costRmb} isFee />
                <FeeRow label="实际扣费总额" desc="" raw={data.costRmb} total />
              </div>
            </div>
          </Sec>

          {/* Routing summary */}
          <Sec title="路由决策摘要">
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", margin: "0 0 var(--spacing-sm)", lineHeight: 1.6 }}>
              本次请求由策略 <strong>{data.routingStrategy}</strong> 调度，选择了供应商 <strong>{data.routedVendor}</strong>（{data.routedModel}）。
            </p>
            <Fld label="决策理由" value={data.routingReason} />
            {data.degraded && (
              <div style={{ marginTop: "var(--spacing-sm)", padding: "var(--spacing-sm)", backgroundColor: "#FFFBEB", borderRadius: "var(--radius-md)", fontSize: "var(--text-caption)", color: "var(--color-warning)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <span>本次请求触发故障自动降级，已从原始选择切换至 {data.routedModel}</span>
              </div>
            )}
          </Sec>

          {/* Prompt / Response */}
          <Sec title="请求内容（已脱敏）">
            <div style={{ marginBottom: "var(--spacing-md)" }}>
              <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>Prompt</span>
              <pre style={{ fontSize: "var(--text-caption)", fontFamily: "var(--font-mono)", backgroundColor: "var(--color-surface-card)", padding: "var(--spacing-sm)", borderRadius: "var(--radius-md)", color: "var(--color-body)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 160, overflow: "auto" }}>{data.prompt}</pre>
            </div>
            <div>
              <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>Response</span>
              <pre style={{ fontSize: "var(--text-caption)", fontFamily: "var(--font-mono)", backgroundColor: "var(--color-surface-card)", padding: "var(--spacing-sm)", borderRadius: "var(--radius-md)", color: "var(--color-body)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 160, overflow: "auto" }}>{data.response}</pre>
            </div>
          </Sec>

          {/* HLE (conditional) */}
          {data.hle && (
            <Sec title="HLE 质量评估">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-md)" }}>
                <div>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block", marginBottom: 2 }}>综合分数</span>
                  <span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: data.hle.score >= 0.8 ? "var(--color-success)" : data.hle.score >= 0.5 ? "var(--color-warning)" : "var(--color-error)", fontFamily: "var(--font-display)" }}>{data.hle.score.toFixed(2)}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[["准确率", data.hle.accuracy], ["幻觉率", data.hle.hallucination], ["稳定性", data.hle.stability], ["延迟", data.hle.latency]].map(([k, v]) => (
                    <div key={k as string} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
                      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", width: 48, flexShrink: 0 }}>{k as string}</span>
                      <div style={{ flex: 1, height: 6, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <div style={{ width: `${(v as number) * 100}%`, height: "100%", backgroundColor: (v as number) >= 0.8 ? "var(--color-success)" : (v as number) >= 0.5 ? "var(--color-warning)" : "var(--color-error)", borderRadius: "var(--radius-full)" }} />
                      </div>
                      <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", width: 36, textAlign: "right" }}>{((v as number) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => { onClose(); onSwitchTab("hle"); }} style={actionLink}>在 HLE 质量看板查看趋势 →</button>
            </Sec>
          )}

          {/* Insurance compensation (conditional) */}
          {data.compensation && (
            <Sec title="保险补偿信息">
              <Fld label="补偿类型" value={data.compensation.type} />
              <Fld label="补偿额度" value={data.compensation.amount} />
              <Fld label="补偿记录" value={data.compensation.recordId} mono />
              <Fld label="状态"><span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-success)", backgroundColor: "#ECFDF5", borderRadius: "var(--radius-sm)" }}>{data.compensation.status}</span></Fld>
            </Sec>
          )}
        </div>

        {/* ====== Bottom sticky action area ====== */}
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderTop: "1px solid var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
          {(costHigh || abnormal || hleLow || data.compensation) && (
            <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: "0 0 var(--spacing-sm)" }}>觉得这次调用不够理想？</p>
          )}

          {(costHigh || abnormal) && (
            <div style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-sm)", flexWrap: "wrap" }}>
              <button onClick={() => window.location.href = `/routing/auto?key=${data.keyMask}`} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> 调整该 Key 的路由策略
              </button>
              <button onClick={() => setConfirmAction(`将模型「${data.model}」加入全局路由黑名单，后续请求将不再选择该模型。`)} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-error)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg> 把 {data.model} 加入黑名单
              </button>
            </div>
          )}

          {(hleLow || abnormal) && (
            <div style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-sm)" }}>
              <button onClick={() => { showToast("已将「" + data.model + "」标记为低质模型，后续 HLE 评估将重点关注"); }} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-warning)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> 将该模型标记为低质
              </button>
            </div>
          )}

          {data.compensation && (
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <button onClick={() => { onClose(); onSwitchTab("insurance"); }} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg> 查看补偿详情
              </button>
              <button onClick={() => setAppealOpen(true)} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> 发起申诉
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Insurance Tab — analysis + records
   ================================================================ */
const COMP_DATA = {
  totalAmount: "¥ 1,234.56",
  totalCount: 123,
  avgAmount: "¥ 10.04 / 次",
  avgFreq: "3.2 次 / 天",
};

const COMP_TYPE = [
  { type: "超时", amount: "¥ 432.00", pct: 35 },
  { type: "报错", amount: "¥ 308.50", pct: 25 },
  { type: "幻觉", amount: "¥ 246.80", pct: 20 },
  { type: "空输出", amount: "¥ 123.40", pct: 10 },
  { type: "低质量", amount: "¥ 86.38", pct: 7 },
  { type: "其他", amount: "¥ 37.48", pct: 3 },
];

const COMP_MODEL = [
  { name: "通义千问 Max", vendor: "阿里云", amount: "¥ 456.00", count: 48, pct: 37 },
  { name: "GPT-4o", vendor: "OpenAI", amount: "¥ 320.00", count: 35, pct: 26 },
  { name: "Claude 3.5", vendor: "Anthropic", amount: "¥ 258.56", count: 22, pct: 21 },
  { name: "DeepSeek V3", vendor: "DeepSeek", amount: "¥ 200.00", count: 18, pct: 16 },
];

const COMP_TEAM = [
  { name: "AI 平台部", amount: "¥ 520.00", count: 55, pct: 42 },
  { name: "客服中心", amount: "¥ 340.00", count: 32, pct: 28 },
  { name: "增长与投放", amount: "¥ 210.50", count: 20, pct: 17 },
  { name: "产品研发", amount: "¥ 164.06", count: 16, pct: 13 },
];

const MOCK_RECORDS = [
  { id: "CMP-42", time: "2026-06-26 14:31", requestId: "req-e5f6a7b8", team: "客服中心", member: "李芳", model: "通义千问 Max", vendor: "阿里云", reason: "超时", origTokens: "2,450", origRmb: "¥ 0.068", compTokens: "2,450", compRmb: "¥ 0.068", status: "已自动补偿", appeal: "未申诉" },
  { id: "CMP-43", time: "2026-06-26 14:29", requestId: "req-3a4b5c6d", team: "数据平台", member: "赵强", model: "Claude 3.5", vendor: "Anthropic", reason: "幻觉", origTokens: "4,600", origRmb: "¥ 0.195", compTokens: "4,600", compRmb: "¥ 0.195", status: "已自动补偿", appeal: "申诉中" },
  { id: "CMP-41", time: "2026-06-25 10:30", requestId: "req-1a2b3c4d", team: "AI 平台部", member: "张明", model: "GPT-4o", vendor: "OpenAI", reason: "报错", origTokens: "3,200", origRmb: "¥ 0.112", compTokens: "3,200", compRmb: "¥ 0.112", status: "待审核", appeal: "未申诉" },
  { id: "CMP-40", time: "2026-06-24 08:15", requestId: "req-5c6d7e8f", team: "产品研发", member: "王磊", model: "DeepSeek V3", vendor: "DeepSeek", reason: "低质量", origTokens: "1,800", origRmb: "¥ 0.018", compTokens: "1,800", compRmb: "¥ 0.018", status: "驳回", appeal: "已处理" },
  { id: "CMP-39", time: "2026-06-23 16:45", requestId: "req-9a0b1c2d", team: "增长与投放", member: "陈静", model: "通义千问 Max", vendor: "阿里云", reason: "空输出", origTokens: "5,100", origRmb: "¥ 0.143", compTokens: "5,100", compRmb: "¥ 0.143", status: "已自动补偿", appeal: "未申诉" },
];

function InsuranceTab() {
  const [insTab, setInsTab] = useState("analysis");

  return (
    <div>
      {/* Insurance sub-tabs */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Seg3 options={["补偿分析", "补偿记录"]} value={insTab === "analysis" ? "补偿分析" : "补偿记录"} onChange={(v) => setInsTab(v === "补偿分析" ? "analysis" : "records")} />
      </div>

      {insTab === "analysis" && <InsAnalysis />}
      {insTab === "records" && <InsRecords />}
    </div>
  );
}

function InsAnalysis() {
  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
          <InsLabel>时间</InsLabel><InsSel options={["最近 7 日", "本月", "过去 3 个月", "自定义"]} />
          <InsLabel>原因</InsLabel><InsSel options={["全部原因", "超时", "报错", "空输出", "幻觉", "低质量", "其他"]} />
          <InsLabel>模型</InsLabel><InsSel options={["全部模型", "GPT-4o", "Claude 3.5", "通义千问 Max", "DeepSeek V3"]} />
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-xs)", flexShrink: 0 }}>
          <InsLabel>供应商</InsLabel><InsSel options={["全部供应商", "OpenAI", "阿里云", "Anthropic", "DeepSeek"]} />
          <InsLabel>团队</InsLabel><InsSel options={["全部团队", "AI 平台部", "客服中心", "增长与投放", "数据平台", "产品研发"]} />
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
        <InsKpi label="总赔偿额度" value={COMP_DATA.totalAmount} sub="所选时间段内的总补偿金额" />
        <InsKpi label="赔偿次数" value={String(COMP_DATA.totalCount)} sub="所有补偿记录数量" />
        <InsKpi label="平均每次赔偿额度" value={COMP_DATA.avgAmount} />
        <InsKpi label="平均赔偿频率" value={COMP_DATA.avgFreq} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <InsCard title="按补偿类型汇总">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COMP_TYPE.map((d, i) => {
              const colors = ["var(--color-brand-accent)", "#F59E0B", "#7C3AED", "#EC4899", "#10B981", "#6B7280"];
              return (
                <div key={d.type} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                  <span style={{ width: 56, fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-body)" }}>{d.type}</span>
                  <div style={{ flex: 1, height: 20, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                    <div style={{ width: `${d.pct}%`, height: "100%", backgroundColor: colors[i], borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", paddingLeft: "var(--spacing-xs)", fontSize: "var(--text-caption)", color: "#fff", fontWeight: 500 }}>{d.pct > 15 ? `${d.pct}%` : ""}</div>
                  </div>
                  <span style={{ width: 56, textAlign: "right", fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}>{d.amount}</span>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: "1px solid var(--color-hairline-soft)", paddingTop: "var(--spacing-sm)", marginTop: "var(--spacing-sm)", display: "flex", flexDirection: "column", gap: 4 }}>
            {COMP_TYPE.map((d, i) => {
              const colors = ["var(--color-brand-accent)", "#F59E0B", "#7C3AED", "#EC4899", "#10B981", "#6B7280"];
              return (
                <div key={d.type} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", fontSize: "var(--text-caption)", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-brand-accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ""; }}>
                  <span style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", backgroundColor: colors[i], flexShrink: 0 }} />
                  <span style={{ fontWeight: 500, color: "var(--color-body)" }}>{d.type}</span>
                  <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--color-ink)" }}>{d.pct}%</span>
                </div>
              );
            })}
          </div>
        </InsCard>

        <InsCard title="按模型 / 供应商汇总">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COMP_MODEL.map((d, i) => {
              const max = COMP_MODEL[0].pct;
              const colors = ["var(--color-brand-accent)", "#F59E0B", "#7C3AED", "#10B981"];
              return (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", cursor: "pointer" }}>
                  <span style={{ width: 90, fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${d.name} · ${d.vendor}`}>{d.name}</span>
                  <div style={{ flex: 1, height: 20, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                    <div style={{ width: `${(d.pct / max) * 100}%`, height: "100%", backgroundColor: colors[i], borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", paddingLeft: "var(--spacing-xs)", fontSize: "var(--text-caption)", color: "#fff", fontWeight: 500 }}>{d.pct}%</div>
                  </div>
                  <span style={{ width: 28, textAlign: "right", fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}>{d.count}次</span>
                </div>
              );
            })}
          </div>
        </InsCard>
      </div>

      {/* Charts row 2 */}
      <InsCard title="按团队 / 员工汇总">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {COMP_TEAM.map((d, i) => {
            const max = COMP_TEAM[0].pct;
            const colors = ["var(--color-brand-accent)", "#F59E0B", "#7C3AED", "#10B981"];
            return (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", cursor: "pointer" }}>
                <span style={{ width: 90, fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-body)" }}>{d.name}</span>
                <div style={{ flex: 1, height: 20, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  <div style={{ width: `${(d.pct / max) * 100}%`, height: "100%", backgroundColor: colors[i], borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", paddingLeft: "var(--spacing-xs)", fontSize: "var(--text-caption)", color: "#fff", fontWeight: 500 }}>{d.amount} · {d.count}次</div>
                </div>
                <span style={{ width: 28, textAlign: "right", fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}>{d.pct}%</span>
              </div>
            );
          })}
        </div>
      </InsCard>
    </div>
  );
}

function InsRecords() {
  const [appealOpen, setAppealOpen] = useState(false);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
          <InsSel options={["最近 7 日", "本月", "过去 3 个月", "自定义"]} />
          <InsSel options={["全部原因", "超时", "报错", "空输出", "幻觉", "低质量"]} />
          <InsSel options={["全部模型", "GPT-4o", "Claude 3.5", "通义千问 Max", "DeepSeek V3"]} />
          <InsSel options={["全部团队", "AI 平台部", "客服中心", "增长与投放", "数据平台", "产品研发"]} />
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-xs)", flexShrink: 0 }}>
          <InsSel options={["全部状态", "已自动补偿", "待审核", "驳回"]} />
          <InsSel options={["全部申诉", "未申诉", "申诉中", "已处理"]} />
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
        <table style={{ width: "100%", minWidth: 950, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F9FAFB" }}>
              <InsTh>时间</InsTh><InsTh>请求 ID</InsTh><InsTh>团队·员工</InsTh><InsTh>模型·供应商</InsTh><InsTh>原因</InsTh><InsTh>原始消耗</InsTh><InsTh>补偿额度</InsTh><InsTh>状态</InsTh><InsTh>申诉</InsTh><InsTh right>操作</InsTh>
            </tr>
          </thead>
          <tbody>
            {MOCK_RECORDS.map((r) => (
              <tr key={r.id} style={{ height: 44 }}>
                <InsTd style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{r.time}</InsTd>
                <InsTd style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-body)" }}>{r.requestId}</InsTd>
                <InsTd style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.team} · {r.member}</InsTd>
                <InsTd style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", fontWeight: 500 }}>{r.model} · {r.vendor}</InsTd>
                <InsTd><CompReasonBadge reason={r.reason} /></InsTd>
                <InsTd style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{r.origTokens} Tokens · {r.origRmb}</InsTd>
                <InsTd style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-success)" }}>+{r.compRmb}</InsTd>
                <InsTd><CompStatusBadge status={r.status} /></InsTd>
                <InsTd><AppealBadge status={r.appeal} /></InsTd>
                <InsTd right>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                    <InsALink>查看</InsALink>
                    {r.appeal === "未申诉" && <InsALink onClick={() => setAppealOpen(true)}>申诉</InsALink>}
                  </div>
                </InsTd>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagi total={MOCK_RECORDS.length} />

      {/* Appeal Modal */}
      {appealOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={() => setAppealOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setAppealOpen(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 440, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "var(--spacing-xl)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
                <span style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>发起申诉</span>
                <button onClick={() => setAppealOpen(false)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <div>
                  <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", display: "block", marginBottom: 4 }}>申诉原因</span>
                  <textarea rows={4} style={{ width: "100%", padding: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", resize: "vertical" }} placeholder="请详细描述申诉原因..." />
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", display: "block", marginBottom: 4 }}>联系方式（可选）</span>
                  <input style={{ width: "100%", height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" }} placeholder="邮箱或电话" />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-xl)" }}>
                <button onClick={() => setAppealOpen(false)} style={{ height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
                <button onClick={() => setAppealOpen(false)} style={{ height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>提交申诉</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InsKpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 96 }}><span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>{label}</span><span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, letterSpacing: "var(--text-display-sm--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{value}</span>{sub && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 4 }}>{sub}</span>}</div>;
}

function InsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}><div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}><span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span></div><div style={{ padding: "var(--spacing-lg)" }}>{children}</div></div>;
}

function CompReasonBadge({ reason }: { reason: string }) {
  const m: Record<string, { fg: string; bg: string }> = { "超时": { fg: "#D97706", bg: "#FFFBEB" }, "报错": { fg: "var(--color-error)", bg: "#FEF2F2" }, "幻觉": { fg: "#7C3AED", bg: "#F5F3FF" }, "空输出": { fg: "#6B7280", bg: "#F3F4F6" }, "低质量": { fg: "#D97706", bg: "#FFFBEB" }, "其他": { fg: "#6B7280", bg: "#F3F4F6" } };
  const c = m[reason] ?? m["其他"];
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{reason}</span>;
}

function CompStatusBadge({ status }: { status: string }) {
  const m: Record<string, { fg: string; bg: string }> = { "已自动补偿": { fg: "var(--color-success)", bg: "#ECFDF5" }, "待审核": { fg: "#D97706", bg: "#FFFBEB" }, "驳回": { fg: "var(--color-error)", bg: "#FEF2F2" } };
  const c = m[status] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{status}</span>;
}

function AppealBadge({ status }: { status: string }) {
  const m: Record<string, { fg: string; bg: string }> = { "未申诉": { fg: "#6B7280", bg: "#F3F4F6" }, "申诉中": { fg: "#2563EB", bg: "#EFF6FF" }, "已处理": { fg: "var(--color-success)", bg: "#ECFDF5" } };
  const c = m[status] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{status}</span>;
}

function InsLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-body)", whiteSpace: "nowrap" }}>{children}</span>;
}

function InsSel({ options }: { options: string[] }) {
  return <select style={{ height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>{options.map((o) => <option key={o} value={o === options[0] ? "" : o}>{o}</option>)}</select>;
}

function Seg3({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return <div style={{ display: "inline-flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)" }}>{options.map((o) => <button key={o} onClick={() => onChange(o)} style={{ height: 34, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-nav-link)", fontWeight: 500, color: o === value ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: o === value ? "var(--color-canvas)" : "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", boxShadow: o === value ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s ease", whiteSpace: "nowrap" }}>{o}</button>)}</div>;
}

function InsTh({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function InsTd({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}

function InsALink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap" }}>{children}</button>;
}

/*
   HLE Tab — leaderboard + trend + manual test
   ================================================================ */
const MOCK_HLE = [
  { rank: 1, model: "GPT-4o", vendor: "OpenAI", category: "通用对话", score: 0.92, accuracy: 92, hallucination: 3, stability: 0.94, latency: 0.88 },
  { rank: 2, model: "Claude 3.5", vendor: "Anthropic", category: "通用对话", score: 0.89, accuracy: 90, hallucination: 4, stability: 0.91, latency: 0.82 },
  { rank: 3, model: "DeepSeek V3", vendor: "DeepSeek", category: "通用对话", score: 0.85, accuracy: 87, hallucination: 6, stability: 0.88, latency: 0.93 },
  { rank: 4, model: "通义千问 Max", vendor: "阿里云", category: "通用对话", score: 0.82, accuracy: 84, hallucination: 7, stability: 0.85, latency: 0.80 },
  { rank: 5, model: "GPT-4o", vendor: "OpenAI", category: "代码", score: 0.78, accuracy: 80, hallucination: 9, stability: 0.82, latency: 0.76 },
  { rank: 6, model: "Claude 3.5", vendor: "Anthropic", category: "代码", score: 0.75, accuracy: 77, hallucination: 10, stability: 0.79, latency: 0.74 },
  { rank: 7, model: "通义千问 Max", vendor: "阿里云", category: "多模态", score: 0.68, accuracy: 72, hallucination: 14, stability: 0.70, latency: 0.65 },
  { rank: 8, model: "DeepSeek V3", vendor: "DeepSeek", category: "多模态", score: 0.62, accuracy: 66, hallucination: 18, stability: 0.64, latency: 0.68 },
];

function HleTab() {
  const [modelFilter, setModelFilter] = useState("");
  const [scoreThreshold, setScoreThreshold] = useState(0);
  const [trendModel, setTrendModel] = useState("GPT-4o");
  const [trendMetric, setTrendMetric] = useState("综合分数");

  const filtered = MOCK_HLE.filter((r) => {
    if (modelFilter && r.model !== modelFilter) return false;
    if (r.score < scoreThreshold) return false;
    return true;
  });

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
          <Label>时间</Label><Sel options={["最近 7 日", "最近 30 日", "过去 3 个月", "自定义"]} />
          <Label>模型</Label>
          <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} style={{ ...selS, width: 140 }}>
            <option value="">全部模型</option>
            {["GPT-4o", "Claude 3.5", "DeepSeek V3", "通义千问 Max"].map((m) => <option key={m}>{m}</option>)}
          </select>
          <Label>供应商</Label><Sel options={["全部供应商", "OpenAI", "Anthropic", "DeepSeek", "阿里云"]} />
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-xs)", flexShrink: 0 }}>
          <Label>评测</Label><Seg2 options={["全部评测", "自动评测", "手动评测"]} value="全部评测" onChange={() => {}} />
        </div>
      </div>

      {/* Leaderboard */}
      <HleCard title="模型质量排行榜" action={
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>最低分数阈值</span>
          <input type="range" min="0" max="1" step="0.05" value={scoreThreshold} onChange={(e) => setScoreThreshold(parseFloat(e.target.value))}
            style={{ width: 100, accentColor: "var(--color-primary)" }} />
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", minWidth: 28 }}>{scoreThreshold.toFixed(2)}</span>
        </div>
      }>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-xxl)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>暂无符合条件的模型评测数据</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                <Th2>#</Th2><Th2>模型</Th2><Th2>供应商</Th2><Th2>综合 HLE ↑</Th2><Th2>准确率</Th2><Th2>幻觉率</Th2><Th2>稳定性</Th2><Th2>延迟</Th2><Th2 right>操作</Th2>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.model}-${r.category}`} style={{ height: 44 }}>
                  <Td2 style={{ color: "var(--color-muted)", fontWeight: 500 }}>{r.rank}</Td2>
                  <Td2><div><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{r.model}</span><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginLeft: 6 }}>{r.category}</span></div></Td2>
                  <Td2 style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.vendor}</Td2>
                  <Td2><ScoreBadge score={r.score} /></Td2>
                  <Td2 style={{ fontVariantNumeric: "tabular-nums" }}>{r.accuracy}%</Td2>
                  <Td2 style={{ fontVariantNumeric: "tabular-nums", color: r.hallucination > 10 ? "var(--color-warning)" : "var(--color-body)" }}>{r.hallucination}%</Td2>
                  <Td2 style={{ fontVariantNumeric: "tabular-nums" }}>{r.stability.toFixed(2)}</Td2>
                  <Td2 style={{ fontVariantNumeric: "tabular-nums" }}>{r.latency.toFixed(2)}</Td2>
                  <Td2 right>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                      <ALink2 onClick={() => { setTrendModel(r.model); }}>查看趋势</ALink2>
                      <ALink2>路由策略</ALink2>
                    </div>
                  </Td2>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </HleCard>

      {/* Bottom: Trend + Manual Test */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "var(--spacing-lg)", marginTop: "var(--spacing-lg)" }}>
        {/* Trend */}
        <HleCard title="质量趋势" action={
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
            <select value={trendModel} onChange={(e) => setTrendModel(e.target.value)} style={{ ...selS, width: 140, height: 30 }}>
              {["GPT-4o", "Claude 3.5", "DeepSeek V3", "通义千问 Max"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <Seg2 options={["综合分数", "准确率", "幻觉率", "稳定性", "延迟"]} value={trendMetric} onChange={setTrendMetric} />
          </div>
        }>
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="100%" height="160" viewBox="0 0 320 160" style={{ overflow: "visible" }}>
              {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <line key={p} x1={40} y1={20 + 120 * (1 - p)} x2={310} y2={20 + 120 * (1 - p)} stroke="var(--color-hairline-soft)" strokeWidth="1" />
              ))}
              {[0.25, 0.5, 0.75, 1].map((p) => (
                <text key={p} x={34} y={24 + 120 * (1 - p)} textAnchor="end" fontSize="10" fill="var(--color-muted)">{(p * 100).toFixed(0)}</text>
              ))}
              <polyline points="40,68 70,56 100,80 130,44 160,62 190,32 220,50 250,38 280,50 310,44" fill="none" stroke="var(--color-brand-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {["D1","D2","D3","D4","D5","D6","D7","D8","D9","D10"].map((d, i) => (
                <text key={d} x={40 + i * 30} y={155} textAnchor="middle" fontSize="9" fill="var(--color-muted)">{d}</text>
              ))}
            </svg>
          </div>
        </HleCard>

        {/* Manual Test */}
        <HleCard title="手动质量检测">
          <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: 0, marginBottom: "var(--spacing-md)" }}>选择模型与供应商，粘贴请求和期望输出，立即触发一次 HLE 评测，结果将计入上方排行榜。</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block", marginBottom: 4 }}>模型</span>
                <select style={{ ...selS, width: "100%" }}><option>GPT-4o</option><option>Claude 3.5</option><option>DeepSeek V3</option><option>通义千问 Max</option></select>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block", marginBottom: 4 }}>供应商</span>
                <select style={{ ...selS, width: "100%" }}><option>OpenAI</option><option>Anthropic</option><option>DeepSeek</option><option>阿里云</option></select>
              </div>
            </div>
            <div>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block", marginBottom: 4 }}>测试 Prompt</span>
              <textarea rows={3} style={{ ...txS, width: "100%", resize: "vertical" }} placeholder="输入要测试的 Prompt..." />
            </div>
            <div>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block", marginBottom: 4 }}>期望输出 / 参考答案（可选）</span>
              <textarea rows={2} style={{ ...txS, width: "100%", resize: "vertical" }} placeholder="输入期望的输出或参考答案..." />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
              <button style={primaryBtn}>发起评测</button>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>评测结果将在数秒内刷新到排行榜和趋势图中。</span>
            </div>
          </div>
        </HleCard>
      </div>

      {/* Cross-links */}
      <div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-lg)", padding: "var(--spacing-md)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
        <span>相关入口：</span>
        <TxtLink>在请求日志中查看样本 →</TxtLink>
        <TxtLink>在路由策略中查看 →</TxtLink>
      </div>
    </div>
  );
}

function HleCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: "var(--spacing-lg)" }}>{children}</div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 0.8 ? "var(--color-success)" : score >= 0.6 ? "var(--color-warning)" : "var(--color-error)";
  const bg = score >= 0.8 ? "#ECFDF5" : score >= 0.6 ? "#FFFBEB" : "#FEF2F2";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-body-sm)", fontWeight: 600, color }}>
      <span style={{ display: "inline-block", width: `${score * 100}%`, maxWidth: 60, height: 6, backgroundColor: color, borderRadius: "var(--radius-full)" }} />
      {score.toFixed(2)}
    </span>
  );
}

function TxtLink({ children }: { children: React.ReactNode }) {
  return <button style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-brand-accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{children}</button>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-body)", whiteSpace: "nowrap" }}>{children}</span>;
}

function Seg2({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "inline-flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)" }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{ height: 28, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: o === value ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: o === value ? "var(--color-canvas)" : "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", boxShadow: o === value ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s ease", whiteSpace: "nowrap" }}>{o}</button>
      ))}
    </div>
  );
}

function Th2({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td2({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}

function ALink2({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap" }}>{children}</button>;
}

const primaryBtn: React.CSSProperties = { height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };

const txS: React.CSSProperties = { padding: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", fontFamily: "var(--font-mono)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" };

function PH({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 240 }}>
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg></div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>{title}</span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>{desc}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 240 }}>
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>暂无请求日志</span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>当你通过 API 发起调用后，将在此看到每一次请求的详细记录。</span>
    </div>
  );
}

function Sel({ options }: { options: string[] }) {
  return <select style={selS}>{options.map((o) => <option key={o} value={o === options[0] ? "" : o}>{o}</option>)}</select>;
}

function Pagi({ total }: { total: number }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}><span>共 {total} 条请求</span><div style={{ display: "flex", gap: "var(--spacing-xxs)" }}><PagiBtn disabled>上一页</PagiBtn><PagiBtn active>1</PagiBtn><PagiBtn disabled>下一页</PagiBtn></div></div>;
}

function PagiBtn({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return <button disabled={disabled} style={{ height: 32, minWidth: 32, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)", backgroundColor: active ? "var(--color-primary)" : "transparent", border: active ? "none" : "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}

function ALink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap" }}>{children}</button>;
}

function Sec({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return <div style={{ marginBottom: "var(--spacing-lg)", paddingBottom: last ? 0 : "var(--spacing-lg)", borderBottom: last ? "none" : "1px solid var(--color-hairline-soft)" }}><h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, lineHeight: "var(--text-title-sm--line-height)", color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>{title}</h3>{children}</div>;
}

function Fld({ label, value, children, mono }: { label: string; value?: string; children?: React.ReactNode; mono?: boolean }) {
  return <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)" }}><span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", width: 72, flexShrink: 0 }}>{label}</span>{children ?? <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", fontFamily: mono ? "var(--font-mono)" : undefined }}>{value}</span>}</div>;
}

function StatusBadge({ s }: { s: string }) {
  const m: Record<string, { label: string; fg: string; bg: string }> = {
    success: { label: "成功", fg: "var(--color-success)", bg: "#ECFDF5" },
    biz_error: { label: "业务错误", fg: "var(--color-error)", bg: "#FEF2F2" },
    gateway_error: { label: "网关错误", fg: "var(--color-error)", bg: "#FEF2F2" },
    empty_output: { label: "空输出", fg: "#D97706", bg: "#FFFBEB" },
    hallucination: { label: "幻觉", fg: "#D97706", bg: "#FFFBEB" },
    low_quality: { label: "低质量", fg: "#D97706", bg: "#FFFBEB" },
  };
  const c = m[s] ?? { label: s, fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{c.label}</span>;
}

function FeeRow({ label, desc, raw, isFee, total }: { label: string; desc: string; raw: string; isFee?: boolean; total?: boolean }) {
  const val = parseFloat(raw.replace(/[¥,]/g, "")) || 0;
  const native = val / 1.05;
  const fee = val - native;
  const display = total ? val : isFee ? fee : native;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: total ? "var(--text-body-sm)" : "var(--text-caption)", fontWeight: total ? 600 : 400, color: "var(--color-ink)" }}>{label}</span>
        {desc && <span style={{ fontSize: 11, color: "var(--color-muted)" }}>({desc})</span>}
      </div>
      <span style={{ fontSize: total ? "var(--text-body-sm)" : "var(--text-caption)", fontWeight: total ? 700 : 600, color: total ? "var(--color-ink)" : isFee ? "var(--color-warning)" : "var(--color-ink)" }}>
        ¥ {display.toFixed(4)}
      </span>
    </div>
  );
}

function ButXn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}>{children}</button>;
}

const secondaryBtn: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", marginTop: "var(--spacing-sm)" };

const actionBtn: React.CSSProperties = { height: 34, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };

const actionLink: React.CSSProperties = { height: 34, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-brand-accent)", backgroundColor: "transparent", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };

const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };

const inpS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" };
