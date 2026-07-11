"use client";

import { useState, useMemo } from "react";
import { getRouteTitle } from "@/config/titles";
import { currentUser } from "@/lib/role";

const MY_KEYS_DATA: Record<string, { id: string; name: string }[]> = {
  "张明": [
    { id: "sk-****8f2c", name: "生产环境主 Key" },
    { id: "sk-****3e2d", name: "测试环境 Key" },
  ],
  "李芳": [
    { id: "sk-****1a9b", name: "客服机器人 Key" },
  ],
  "赵强": [
    { id: "sk-****6b0c", name: "数据导出 Key" },
  ],
};

const MY_KEYS = MY_KEYS_DATA[currentUser] || [];

const MODELS = ["全部模型", "GPT-4o", "Claude 3.5", "通义千问 Max", "DeepSeek V3"];

const myKeyIds = new Set(MY_KEYS.map((k) => k.id));

const RATES: Record<string, { input: number; output: number }> = {
  "GPT-4o": { input: 0.03, output: 0.06 },
  "Claude 3.5": { input: 0.02, output: 0.06 },
  "通义千问 Max": { input: 0.008, output: 0.02 },
  "DeepSeek V3": { input: 0.002, output: 0.006 },
  "GPT-4o (代码)": { input: 0.03, output: 0.06 },
};

function calcCost(model: string, inTk: string, outTk: string): number {
  const r = RATES[model] || RATES["GPT-4o"];
  return (parseFloat(inTk) * r.input + parseFloat(outTk) * r.output) / 1000;
}

const MOCK_DETAIL = Array.from({ length: 20 }, (_, i) => {
  const model = ["GPT-4o", "Claude 3.5", "通义千问 Max", "DeepSeek V3", "GPT-4o (代码)"][i % 5];
  const inputTokens = ((i * 2718 + 50000) % 50000 + 1000).toFixed(0);
  const outputTokens = ((i * 1800 + 20000) % 30000 + 500).toFixed(0);
  return {
    time: `2026-06-${(i % 30 + 1).toString().padStart(2, "0")} ${(8 + (i % 12)).toString().padStart(2, "0")}:${(i * 3 % 60).toString().padStart(2, "0")}`,
    keyId: myKeyIds.has("sk-****8f2c") ? ["sk-****8f2c", "sk-****3e2d"][i % 2] : (myKeyIds.has("sk-****1a9b") ? "sk-****1a9b" : myKeyIds.has("sk-****6b0c") ? "sk-****6b0c" : "sk-****7a4f"),
    model,
    inputTokens,
    outputTokens,
    cost: calcCost(model, inputTokens, outputTokens),
    status: ["成功", "成功", "成功", "失败", "成功"][i % 5],
  };
}).filter((r) => myKeyIds.has(r.keyId));

const TOP_KEYS = MY_KEYS.map((k) => ({
  name: k.name, id: k.id, tokens: k.id === "sk-****8f2c" ? "890,000" : "210,000",
})).sort((a, b) => parseInt(b.tokens.replace(/,/g, "")) - parseInt(a.tokens.replace(/,/g, "")));

const USER_BALANCE: Record<string, number> = {
  "张明": 374.50,
  "李芳": 28.30,
  "赵强": 5.80,
};

/* ================================================================
   Page
   ================================================================ */
export default function UsageAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("近 7 日");
  const [selectedKeys, setSelectedKeys] = useState<string>("我的所有 Key");
  const [model, setModel] = useState("全部模型");

  const filtered = useMemo(() => {
    if (selectedKeys === "我的所有 Key") return MOCK_DETAIL;
    return MOCK_DETAIL.filter((r) => r.keyId === selectedKeys);
  }, [selectedKeys]);

  const totalTokens = filtered.reduce((s, r) => s + parseFloat(r.inputTokens) + parseFloat(r.outputTokens), 0);
  const totalInput = filtered.reduce((s, r) => s + parseFloat(r.inputTokens), 0);
  const totalOutput = filtered.reduce((s, r) => s + parseFloat(r.outputTokens), 0);
  const totalCost = filtered.reduce((s, r) => s + r.cost, 0);
  const totalRequests = filtered.length;

  const handleExport = () => {
    const csv = [
      ["时间", "Key", "模型", "输入 Token", "输出 Token", "预估费用 (¥)", "结果状态"].join(","),
      ...filtered.map((r) => [r.time, r.keyId, r.model, r.inputTokens, r.outputTokens, r.cost.toFixed(2), r.status].join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "用量明细.csv"; a.click();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/analytics/usage")}
        </h1>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <Sel value={timeRange} onChange={setTimeRange} options={["今天", "近 7 日", "本月", "近 30 天"]} />
        <Sel value={selectedKeys} onChange={setSelectedKeys} options={["我的所有 Key", ...MY_KEYS.map((k) => k.id)]} />
        <Sel value={model} onChange={setModel} options={MODELS} />
      </div>

      {/* KPI cards — 3 core metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <BalanceCard balance={USER_BALANCE[currentUser] ?? 0} />
        <KpiCard label="已消耗金额" value={`¥ ${totalCost.toFixed(2)}`} sub="" />
        <KpiCard label="总 Token 消耗" value={totalTokens >= 1000000 ? `${(totalTokens / 1000000).toFixed(2)}M` : `${(totalTokens / 1000).toFixed(0)}K`} sub="" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
        <BarChart title="Key 消耗排行 (Top 5)" data={TOP_KEYS.map((k, _, arr) => { const maxVal = Math.max(...arr.map((x) => parseInt(x.tokens.replace(/,/g, "")))); return { name: k.name, tokens: k.tokens, pct: parseInt(k.tokens.replace(/,/g, "")) / maxVal * 100 }; })} wide />
      </div>

      {/* Detail table */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>
            调用明细
          </span>
          <button onClick={handleExport} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            导出当前筛选结果
          </button>
        </div>
        <div style={{ overflow: "auto", padding: "0 var(--spacing-lg) var(--spacing-lg)" }}>
          <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", marginTop: "var(--spacing-sm)" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                <Th>时间</Th><Th>Key</Th><Th>模型</Th><Th right>输入 Token</Th><Th right>输出 Token</Th><Th right>预估费用 (¥)</Th><Th>结果状态</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map((r, i) => (
                <tr key={i} style={{ height: 40 }}>
                  <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{r.time}</Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", fontFamily: "var(--font-mono)" }}>{r.keyId}</Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{r.model}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{parseFloat(r.inputTokens).toLocaleString()}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{parseFloat(r.outputTokens).toLocaleString()}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{r.cost.toFixed(2)}</Td>
                  <Td><StatusTag status={r.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: "var(--spacing-sm)", textAlign: "center" }}>共 {filtered.length} 条，显示前 15 条</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Shared components
   ================================================================ */
function BalanceCard({ balance }: { balance: number }) {
  const low = balance < 10;
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: `1px solid ${low ? "var(--color-error)" : "var(--color-hairline)"}`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>
      <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>当前可用余额</div>
      <div style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: low ? "var(--color-error)" : "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-xxs)" }}>
        ¥ {balance.toFixed(2)}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>
      <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>{label}</div>
      <div style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: sub ? "var(--spacing-xxs)" : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{sub}</div>}
    </div>
  );
}

function BarChart({ title, data, wide }: { title: string; data: { name: string; pct: number; tokens?: string }[]; wide?: boolean }) {
  const maxPct = Math.max(...data.map((d) => d.pct));
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span>
      </div>
      <div style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            <span style={{ width: wide ? 160 : 120, fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }} title={d.name}>{d.name}</span>
            <div style={{ flex: 1, height: 8, backgroundColor: "#F3F4F6", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ width: `${(d.pct / maxPct) * 100}%`, height: "100%", backgroundColor: "#000000", borderRadius: 9999, minWidth: 4, transition: "width 0.3s" }} />
            </div>
            <span style={{ width: 80, textAlign: "right", fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}>{d.tokens || `${d.pct.toFixed(0)}%`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const ok = status === "成功";
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: ok ? "#059669" : "#DC2626", backgroundColor: ok ? "#ECFDF5" : "#FEF2F2", borderRadius: "var(--radius-sm)" }}>{status}</span>;
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-sm)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}
