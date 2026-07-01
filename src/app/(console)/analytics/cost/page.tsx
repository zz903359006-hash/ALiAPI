"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";

/* ================================================================
   Mock data
   ================================================================ */
const TEAM_MEMBERS: Record<string, string[]> = {
  "全部团队": ["全部员工"],
  "AI 平台部": ["全部员工", "张明", "刘伟"],
  "客服中心": ["全部员工", "李芳", "周婷"],
  "产品研发": ["全部员工", "王磊", "陈浩"],
  "增长与投放": ["全部员工", "陈静", "林峰"],
  "数据平台": ["全部员工", "赵强", "孙鹏"],
};

const MOCK_DETAIL = Array.from({ length: 20 }, (_, i) => ({
  time: `2026-06-${(i % 30 + 1).toString().padStart(2, "0")} ${(8 + (i % 12)).toString().padStart(2, "0")}:${(i * 3 % 60).toString().padStart(2, "0")}`,
  team: ["AI 平台部", "客服中心", "产品研发", "增长与投放", "数据平台"][i % 5],
  member: ["张明", "刘伟", "李芳", "周婷", "王磊", "陈浩", "陈静", "林峰", "赵强", "孙鹏"][i % 10],
  key: ["sk-****8f2c", "sk-****1a9b", "sk-****3e2d", "sk-****7a4f", "sk-****6b0c"][i % 5],
  model: ["GPT-4o", "Claude 3.5", "通义千问 Max", "DeepSeek V3", "GPT-4o (代码)"][i % 5],
  cost: (Math.random() * 5 + 0.1).toFixed(3),
  assetType: ["本金", "奖励额度", "保险补偿", "本金", "本金"][i % 5],
}));

const MODEL_COST = [
  { name: "GPT-4o", cost: "¥ 4,230.50", pct: 35 },
  { name: "Claude 3.5", cost: "¥ 2,890.00", pct: 24 },
  { name: "DeepSeek V3", cost: "¥ 1,950.00", pct: 16 },
  { name: "通义千问 Max", cost: "¥ 1,580.00", pct: 13 },
  { name: "GPT-4o (代码)", cost: "¥ 1,450.00", pct: 12 },
];

const TEAM_COST = [
  { name: "AI 平台部", cost: "¥ 4,120.00", pct: 34 },
  { name: "客服中心", cost: "¥ 2,850.00", pct: 24 },
  { name: "增长与投放", cost: "¥ 2,100.00", pct: 17 },
  { name: "数据平台", cost: "¥ 1,780.00", pct: 15 },
  { name: "产品研发", cost: "¥ 1,250.00", pct: 10 },
];

const VENDOR_COST = [
  { name: "OpenAI", cost: "¥ 5,680.50", pct: 42 },
  { name: "Anthropic", cost: "¥ 2,890.00", pct: 21 },
  { name: "DeepSeek", cost: "¥ 1,950.00", pct: 14 },
  { name: "阿里云", cost: "¥ 1,580.00", pct: 12 },
  { name: "其他", cost: "¥ 1,500.00", pct: 11 },
];

const TREND_DATA = [4200, 3800, 4500, 5100, 4800, 6200, 5800];
const TREND_LABELS = ["06-20", "06-21", "06-22", "06-23", "06-24", "06-25", "06-26"];

/* ================================================================
   Page
   ================================================================ */
export default function CostAnalyticsPage() {
  const [team, setTeam] = useState("全部团队");
  const [member, setMember] = useState("全部员工");
  const [key, setKey] = useState("全部 Key");
  const [model, setModel] = useState("全部模型");
  const [timeRange, setTimeRange] = useState("近 7 日");
  const [drillTeam, setDrillTeam] = useState<string | null>(null);

  const effectiveTeam = drillTeam || team;
  const memberOpts = TEAM_MEMBERS[effectiveTeam] || TEAM_MEMBERS["全部团队"];

  const handleTeamChange = (v: string) => { setTeam(v); setMember("全部员工"); setDrillTeam(null); };

  const filtered = drillTeam
    ? MOCK_DETAIL.filter((r) => r.team === drillTeam)
    : MOCK_DETAIL;

  const totalCost = filtered.reduce((s, r) => s + parseFloat(r.cost), 0);

  const handleExport = () => {
    const csv = [["时间", "团队/员工", "API Key", "模型", "消耗金额", "扣减资产类型"].join(","),
      ...filtered.map((r) => [r.time, `${r.team}·${r.member}`, r.key, r.model, r.cost, r.assetType].join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "费用明细.csv"; a.click();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/analytics/cost")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
          按团队、成员、模型、供应商等维度分析费用支出，支持下钻与明细导出。
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <Sel value={timeRange} onChange={setTimeRange} options={["今天", "近 7 日", "本月", "近 30 天"]} />
        <Sel value={effectiveTeam} onChange={handleTeamChange} options={Object.keys(TEAM_MEMBERS)} />
        <Sel value={member} onChange={setMember} options={memberOpts} />
        <Sel value={key} onChange={setKey} options={["全部 Key", "生产环境主 Key", "客服机器人 Key", "投放分析 Key", "数据导出 Key"]} />
        <Sel value={model} onChange={setModel} options={["全部模型", "GPT-4o", "Claude 3.5", "通义千问 Max", "DeepSeek V3"]} />
        {drillTeam && (
          <button onClick={() => setDrillTeam(null)} style={{ height: 36, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-brand-accent)", backgroundColor: "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
            清除下钻 ✕
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <Kpi label="总费用" value={`¥ ${totalCost.toFixed(2)}`} sub={drillTeam || "全团队"} />
        <Kpi label="输入费用" value={`¥ ${(totalCost * 0.45).toFixed(2)}`} sub={`${((totalCost * 0.45 / totalCost) * 100).toFixed(0)}%`} />
        <Kpi label="输出费用" value={`¥ ${(totalCost * 0.55).toFixed(2)}`} sub={`${((totalCost * 0.55 / totalCost) * 100).toFixed(0)}%`} />
        <Kpi label="平均每次请求" value={`¥ ${(totalCost / Math.max(filtered.length, 1)).toFixed(3)}`} sub="基于当前筛选" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <BarCard title="模型费用分布" data={MODEL_COST} onClickLabel={(d) => setModel(d.name)} />
        <BarCard title="团队费用分布" data={TEAM_COST} onClickLabel={(d) => { setTeam(d.name); setDrillTeam(d.name); }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
        <BarCard title="供应商费用分布" data={VENDOR_COST} />
        <TrendCard data={TREND_DATA} labels={TREND_LABELS} />
      </div>

      {/* Detail table */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>
            {drillTeam ? `${drillTeam} 费用明细` : "费用明细（全部）"}
          </span>
          <button onClick={handleExport} style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            导出当前筛选结果
          </button>
        </div>
        <div style={{ overflow: "auto", padding: "0 var(--spacing-lg) var(--spacing-lg)" }}>
          <table style={{ width: "100%", minWidth: 750, borderCollapse: "collapse", marginTop: "var(--spacing-sm)" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                <Th>时间</Th><Th>团队/员工</Th><Th>API Key</Th><Th>模型</Th><Th right>消耗金额</Th><Th>扣减资产类型</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map((r, i) => (
                <tr key={i} style={{ height: 40 }}>
                  <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{r.time}</Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.team} · {r.member}</Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", fontFamily: "var(--font-mono)" }}>{r.key}</Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{r.model}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)" }}>¥ {r.cost}</Td>
                  <Td><AssetTag type={r.assetType} /></Td>
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
function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>
      <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>{label}</div>
      <div style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: sub ? "var(--spacing-xxs)" : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{sub}</div>}
    </div>
  );
}

function BarCard({ title, data, onClickLabel }: { title: string; data: { name: string; pct: number; cost?: string }[]; onClickLabel?: (d: any) => void }) {
  const maxPct = Math.max(...data.map((d) => d.pct));
  const colors = ["var(--color-brand-accent)", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span>
      </div>
      <div style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            <span style={{ width: 110, fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{d.name}</span>
            <div style={{ flex: 1, height: 20, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-xs)", overflow: "hidden", cursor: onClickLabel ? "pointer" : "default" }}
              onClick={() => onClickLabel?.(d)} title="下钻查看该团队明细">
              <div style={{ width: `${(d.pct / maxPct) * 100}%`, height: "100%", backgroundColor: colors[i] || "#DBEAFE", borderRadius: "var(--radius-xs)", minWidth: 4 }} />
            </div>
            <span style={{ width: 50, textAlign: "right", fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}>{d.pct}%</span>
            <span style={{ width: 90, textAlign: "right", fontSize: "var(--text-caption)", color: "var(--color-muted)", flexShrink: 0 }}>{d.cost || ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendCard({ data, labels }: { data: number[]; labels: string[] }) {
  const h = 180, w = 400, max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h * 0.85 - 10}`).join(" ");
  const area = `M0,${h} ${pts} ${w},${h}Z`;
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>费用趋势</span>
      </div>
      <div style={{ padding: "var(--spacing-lg)" }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 180 }}>
          <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
          <path d={area} fill="url(#trendFill)" />
          <polyline points={pts} fill="none" stroke="#3B82F6" strokeWidth="2" />
          {data.map((v, i) => (
            <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (v / max) * h * 0.85 - 10} r="3" fill="#3B82F6" />
          ))}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

function AssetTag({ type }: { type: string }) {
  const m: Record<string, { fg: string; bg: string }> = {
    "本金": { fg: "#2563EB", bg: "#EFF6FF" },
    "奖励额度": { fg: "#059669", bg: "#ECFDF5" },
    "保险补偿": { fg: "#7C3AED", bg: "#F5F3FF" },
  };
  const c = m[type] || { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{type}</span>;
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
