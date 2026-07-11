"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";
import { currentUser } from "@/lib/role";
import TokenAnalysisView from "./_components/TokenAnalysisView";

interface KeyUsage {
  id: string;
  name: string;
  mask: string;
  enterpriseUsed: number;
  personalUsed: number;
  totalUsed: number;
}

const KEY_USAGE_DATA: Record<string, KeyUsage[]> = {
  "张明": [
    { id: "sk-****3e2d", name: "测试", mask: "sk-****3e2d", enterpriseUsed: 125.50, personalUsed: 0, totalUsed: 125.50 },
    { id: "sk-****8f2c", name: "生产环境", mask: "sk-****8f2c", enterpriseUsed: 374.50, personalUsed: 38.00, totalUsed: 412.50 },
    { id: "sk-****7a4f", name: "数据分析", mask: "sk-****7a4f", enterpriseUsed: 0, personalUsed: 62.00, totalUsed: 62.00 },
  ],
  "李芳": [
    { id: "sk-****1a9b", name: "客服机器人", mask: "sk-****1a9b", enterpriseUsed: 80.00, personalUsed: 20.00, totalUsed: 100.00 },
  ],
};

const ALLOCATED_ENTERPRISE = 500.00;
const ALLOCATED_PERSONAL = 200.00;
const ALLOCATED_ENTERPRISE_M = 50.00;
const ALLOCATED_PERSONAL_M = 20.00;

type Dim = "year" | "week" | "day" | "hour";

const DIMS: { key: Dim; label: string }[] = [
  { key: "year", label: "年" },
  { key: "week", label: "周" },
  { key: "day", label: "日" },
  { key: "hour", label: "小时" },
];

const YEARS = ["2026 年", "2025 年", "2024 年"];

function pad(n: number) { return n.toString().padStart(2, "0"); }

function getDayOptions() {
  const base = new Date(2026, 6, 9);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
}
function getHourOptions() {
  const currentHour = 16;
  return Array.from({ length: 24 }, (_, i) => {
    const h = (currentHour - i + 24) % 24;
    return `${pad(h)}:00`;
  });
}
function getWeekOptions() {
  const currentWeek = 28;
  return Array.from({ length: 7 }, (_, i) => `第 ${currentWeek - i} 周`);
}

const DAY_OPTIONS = getDayOptions();
const HOUR_OPTIONS = getHourOptions();
const WEEK_OPTIONS = getWeekOptions();

interface Pt { label: string; ent: number; per: number }

function genTrend(dim: Dim, period: string, key: string, factor: number): Pt[] {
  const seed = (period.length * 7 + key.length * 13) % 100;

  if (dim === "year") {
    return Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1} 月`,
      ent: +((45 + ((i * 9 + seed) % 35)) * factor).toFixed(2),
      per: +(i * 3 + seed) % 30 < 18 ? +((6 + ((i * 4 + seed) % 12)) * factor).toFixed(2) : 0,
    }));
  }
  if (dim === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const dow = (i + 1) % 7;
      const isWeekend = dow === 0 || dow === 6;
      return {
        label: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i],
        ent: +(isWeekend ? (6 + ((i * 3 + seed) % 8)) * factor : (22 + ((i * 7 + seed) % 30)) * factor).toFixed(2),
        per: +((12 + ((i * 5 + seed) % 18)) * factor).toFixed(2),
      };
    });
  }
  if (dim === "day") {
    return Array.from({ length: 24 }, (_, i) => {
      const isWorkHour = i >= 9 && i <= 18;
      return {
        label: `${pad(i)}:00`,
        ent: +(isWorkHour ? (18 + ((i * 3 + seed) % 12)) * factor : (3 + ((i * 2 + seed) % 5)) * factor).toFixed(2),
        per: +(isWorkHour ? (5 + ((i * 2 + seed) % 7)) * factor : (0.5 + ((i * 1 + seed) % 2)) * factor).toFixed(2),
      };
    });
  }
  return Array.from({ length: 6 }, (_, i) => {
    const x = i * 10;
    return {
      label: `${pad(x)} 分`,
      ent: +((8 + ((i * 4 + seed) % 14)) * factor).toFixed(2),
      per: +((2 + ((i * 2 + seed) % 6)) * factor).toFixed(2),
    };
  });
}

const DIM_SCALE: Record<Dim, number> = {
  "year": 1,
  "week": 0.32,
  "day": 0.06,
  "hour": 0.005,
};

/* ================================================================
   Page
   ================================================================ */
export default function UsageAnalyticsPage() {
  const [tab, setTab] = useState<"cost" | "token">("cost");

  return (
    <div>
      <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", margin: "0 0 var(--spacing-lg)" }}>
        {getRouteTitle("/analytics/usage")}
      </h1>
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid var(--color-hairline-soft)", marginBottom: "var(--spacing-lg)" }}>
        <TabButton active={tab === "cost"} onClick={() => setTab("cost")}>金额分析</TabButton>
        <TabButton active={tab === "token"} onClick={() => setTab("token")}>Token 分析</TabButton>
      </div>

      {tab === "cost" ? <CostView /> : <TokenAnalysisView />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 40,
        paddingLeft: 4,
        paddingRight: 4,
        marginLeft: 16,
        marginRight: 16,
        fontSize: "var(--text-body-md)",
        fontWeight: active ? 600 : 500,
        color: active ? "var(--color-ink)" : "var(--color-muted)",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--color-ink)" : "2px solid transparent",
        marginBottom: -1,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ================================================================
   CostView — 用量分析 (¥)
   ================================================================ */
function CostView() {
  return <AnalysisView unit="¥" tabKey="cost" />;
}

/* CostView renamed to 金额分析 */

/* ================================================================
   Shared analysis view
   ================================================================ */
function AnalysisView({ unit, tabKey }: { unit: string; tabKey: "cost" | "token" }) {
  const isCost = unit === "¥";
  const baseKeys = KEY_USAGE_DATA[currentUser] ?? [];

  const [dim, setDim] = useState<Dim>(tabKey === "cost" ? "day" : "week");
  const [year, setYear] = useState(YEARS[0]);
  const [week, setWeek] = useState(WEEK_OPTIONS[0]);
  const [day, setDay] = useState(DAY_OPTIONS[0]);
  const [hour, setHour] = useState(HOUR_OPTIONS[0]);
  const [period, setPeriod] = useState(tabKey === "cost" ? DAY_OPTIONS[0] : WEEK_OPTIONS[0]);
  const [toast, setToast] = useState("");

  const periodKey = dim === "year" ? year : dim === "week" ? week : dim === "day" ? day : hour;
  const dimOptions: Record<Dim, string[]> = { year: YEARS, week: WEEK_OPTIONS, day: DAY_OPTIONS, hour: HOUR_OPTIONS };
  const periodOptions = dimOptions[dim];

  const scale = DIM_SCALE[dim];

  const myKeys = baseKeys.map((k) => {
    const factor = isCost ? scale : scale;
    const entRaw = k.enterpriseUsed * factor;
    const perRaw = k.personalUsed * factor;
    const entVal = isCost ? entRaw : entRaw / 10;
    const perVal = isCost ? perRaw : perRaw / 10;
    return {
      ...k,
      enterpriseUsed: +entVal.toFixed(2),
      personalUsed: +perVal.toFixed(2),
      totalUsed: +(entVal + perVal).toFixed(2),
    };
  });

  const usedEnterprise = myKeys.reduce((s, k) => s + k.enterpriseUsed, 0);
  const usedPersonal = myKeys.reduce((s, k) => s + k.personalUsed, 0);
  const allocEnterprise = isCost ? ALLOCATED_ENTERPRISE : ALLOCATED_ENTERPRISE_M;
  const allocPersonal = isCost ? ALLOCATED_PERSONAL : ALLOCATED_PERSONAL_M;
  const remainingEnterprise = allocEnterprise - usedEnterprise;
  const remainingPersonal = allocPersonal - usedPersonal;

  const trendFactor = isCost ? 1 : 0.1;
  const trend = genTrend(dim, period, periodKey, scale * trendFactor);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const onDimChange = (d: Dim) => {
    setDim(d);
    if (d === "year") setPeriod(year);
    else if (d === "week") setPeriod(week);
    else if (d === "day") setPeriod(day);
    else setPeriod(hour);
  };
  const onPeriodChange = (p: string) => {
    setPeriod(p);
    if (dim === "year") setYear(p);
    else if (dim === "week") setWeek(p);
    else if (dim === "day") setDay(p);
    else setHour(p);
  };

  const handleExport = (k: KeyUsage) => {
    const csv = [
      ["时间", "Key 名称", "Key ID", `费用 (${unit})`, "扣减额度类型"].join(","),
      ...Array.from({ length: 6 }, (_, i) => [
        `2026-06-${(i + 1).toString().padStart(2, "0")} 10:${(i * 7).toString().padStart(2, "0")}`,
        k.name, k.id, (k.totalUsed / 6).toFixed(2), i % 2 === 0 ? "企业" : "个人",
      ].join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${k.name}-调用日志.csv`;
    a.click();
    showToast("日志已导出");
  };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", marginBottom: "var(--spacing-lg)", flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          {DIMS.map((d) => (
            <button
              key={d.key}
              onClick={() => onDimChange(d.key)}
              style={{
                height: 36, paddingLeft: 18, paddingRight: 18,
                fontSize: "var(--text-body-sm)",
                fontWeight: dim === d.key ? 600 : 500,
                color: dim === d.key ? "#fff" : "var(--color-body)",
                backgroundColor: dim === d.key ? "#000" : "transparent",
                border: "none",
                borderLeft: d === DIMS[0] ? "none" : "1px solid var(--color-hairline)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
        <select value={period} onChange={(e) => onPeriodChange(e.target.value)} style={selectStyle}>
          {periodOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>
            {period} {isCost ? "消耗趋势" : "Token 趋势"}
          </span>
          <div style={{ display: "flex", gap: 16, fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 2, backgroundColor: "#000", display: "inline-block" }} />
              企业已用
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 2, backgroundColor: "#9ca3af", display: "inline-block" }} />
              个人已用
            </span>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-lg)" }}>
          <TrendChart data={trend} dim={dim} unit={unit} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <KpiTile label={isCost ? "企业金额" : "企业额度"} value={`${unit} ${allocEnterprise.toFixed(2)}`} />
        <KpiTile label={isCost ? "已用企业金额" : "已用企业额度"} value={`${unit} ${usedEnterprise.toFixed(2)}`} />
        <KpiTile label={isCost ? "剩余企业金额" : "剩余企业额度"} value={`${unit} ${remainingEnterprise.toFixed(2)}`} valueColor={remainingEnterprise <= 0 ? "#dc2626" : "var(--color-ink)"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <KpiTile label={isCost ? "个人充值金额" : "个人充值额度"} value={`${unit} ${allocPersonal.toFixed(2)}`} />
        <KpiTile label={isCost ? "已用个人金额" : "已用个人额度"} value={`${unit} ${usedPersonal.toFixed(2)}`} />
        <KpiTile label={isCost ? "剩余个人金额" : "剩余个人额度"} value={`${unit} ${remainingPersonal.toFixed(2)}`} valueColor={remainingPersonal < (isCost ? 10 : 1) ? "#dc2626" : "var(--color-ink)"} />
      </div>

      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>
            Key 消耗明细
          </span>
        </div>
        <div style={{ overflow: "auto", padding: "0 var(--spacing-lg) var(--spacing-lg)" }}>
          <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", marginTop: "var(--spacing-sm)" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                <Th>Key 名称</Th><Th>Key ID</Th><Th right>{isCost ? "已用企业金额" : "已用企业额度"} ({unit})</Th><Th right>{isCost ? "已用个人金额" : "已用个人额度"} ({unit})</Th><Th right>{isCost ? "已用总金额" : "已用总额度"} ({unit})</Th><Th right>操作</Th>
              </tr>
            </thead>
            <tbody>
              {myKeys.map((k) => (
                <tr key={k.id} style={{ height: 44 }}>
                  <Td style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{k.name}</Td>
                  <Td style={{ fontSize: "var(--text-caption)", fontFamily: "var(--font-mono)", color: "var(--color-body)" }}>{k.mask}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", fontVariantNumeric: "tabular-nums", color: k.enterpriseUsed > 0 ? "var(--color-ink)" : "var(--color-muted)" }}>{unit} {k.enterpriseUsed.toFixed(2)}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", fontVariantNumeric: "tabular-nums", color: k.personalUsed > 0 ? "var(--color-ink)" : "var(--color-muted)" }}>{unit} {k.personalUsed.toFixed(2)}</Td>
                  <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--color-ink)" }}>{unit} {k.totalUsed.toFixed(2)}</Td>
                  <Td right>
                    <ActionLink onClick={() => handleExport(k)}>导出日志</ActionLink>
                  </Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--color-hairline)" }}>
                <Td style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>合计</Td>
                <Td></Td>
                <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{unit} {usedEnterprise.toFixed(2)}</Td>
                <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{unit} {usedPersonal.toFixed(2)}</Td>
                <Td right style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{unit} {(usedEnterprise + usedPersonal).toFixed(2)}</Td>
                <Td></Td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TrendChart — SVG line chart
   ================================================================ */
function TrendChart({ data, dim, unit }: { data: Pt[]; dim: Dim; unit: string }) {
  const W = 1100;
  const H = 220;
  const padding = { top: 16, right: 24, bottom: 32, left: 56 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const maxV = Math.max(...data.flatMap((p) => [p.ent, p.per]), 1);
  const yMax = Math.ceil(maxV / 10) * 10 || 10;

  const x = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - (v / yMax) * innerH;

  const entPath = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.ent)}`).join(" ");
  const perPath = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.per)}`).join(" ");

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (yMax * (yTicks - i)) / yTicks);

  const [hover, setHover] = useState<number | null>(null);

  const xLabelStride = data.length <= 7 ? 1 : data.length <= 12 ? 1 : data.length <= 24 ? 3 : 1;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 240, overflow: "visible" }} onMouseLeave={() => setHover(null)}>
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={padding.left} y1={y(v)} x2={W - padding.right} y2={y(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padding.left - 8} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#6b7280">{v.toFixed(0)}</text>
          </g>
        ))}

        <path d={perPath} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={entPath} fill="none" stroke="#000" strokeWidth="2" />

        {data.map((p, i) => (i % xLabelStride === 0 || i === data.length - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7280">{p.label}</text>
        ))}

        {data.map((p, i) => (
          <g key={i}>
            <rect x={x(i) - innerW / data.length / 2} y={padding.top} width={innerW / data.length} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
            <circle cx={x(i)} cy={y(p.ent)} r={hover === i ? 4 : 2.5} fill="#000" />
            <circle cx={x(i)} cy={y(p.per)} r={hover === i ? 4 : 2.5} fill="#9ca3af" />
            {hover === i && (
              <line x1={x(i)} y1={padding.top} x2={x(i)} y2={H - padding.bottom} stroke="#000" strokeWidth="0.5" strokeDasharray="2 2" />
            )}
          </g>
        ))}
      </svg>

      {hover !== null && (
        <div style={{
          position: "absolute", left: `${(x(hover) / W) * 100}%`, top: 8, transform: "translateX(-50%)",
          backgroundColor: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 12, whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{data[hover].label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />
            企业已用 {unit} {data[hover].ent.toFixed(2)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#d1d5db", marginTop: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#9ca3af" }} />
            个人已用 {unit} {data[hover].per.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Shared components
   ================================================================ */
const selectStyle: React.CSSProperties = {
  height: 36, paddingLeft: 14, paddingRight: 32,
  fontSize: "var(--text-body-sm)", color: "var(--color-body)",
  backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
};

function KpiTile({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>
      <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)" }}>{label}</div>
      <div style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: valueColor || "var(--color-ink)", fontFamily: "var(--font-display)" }}>{value}</div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-sm)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}

function ActionLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontSize: "var(--text-body-sm)", fontWeight: 500,
      color: "var(--color-muted)", backgroundColor: "transparent",
      border: "none", cursor: "pointer",
      padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}