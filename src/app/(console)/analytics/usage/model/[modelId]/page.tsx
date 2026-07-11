"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  FullscreenIcon, DownloadIcon, IconBtn, KpiMetric, SmallMetric, SingleLineChart, MultiLineChart, ReliabilityCard,
  formatMTokens, deltaColor, deltaArrow,
} from "../../_components/TokenAnalysisView";

const TIME_RANGES = ["1 小时", "6 小时", "12 小时", "24 小时", "7 天", "30 天"] as const;
const PRECISIONS = ["按分钟", "按小时", "按天"] as const;
const INFERENCE_TYPES = ["全部", "实时推理", "批量推理"] as const;
const GRANULARITY_PRECISION: Record<typeof TIME_RANGES[number], typeof PRECISIONS[number]> = {
  "1 小时": "按分钟", "6 小时": "按分钟", "12 小时": "按小时", "24 小时": "按小时", "7 天": "按天", "30 天": "按天",
};
const TIME_LABELS: Record<typeof TIME_RANGES[number], string[]> = {
  "1 小时": ["-60m", "-50m", "-40m", "-30m", "-20m", "-10m", "现在"],
  "6 小时": ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "现在"],
  "12 小时": ["-12h", "-10h", "-8h", "-6h", "-4h", "-2h", "现在"],
  "24 小时": ["-24h", "-20h", "-16h", "-12h", "-8h", "-4h", "现在"],
  "7 天": ["07-05", "07-06", "07-07", "07-08", "07-09", "07-10", "07-11"],
  "30 天": ["06-11", "06-16", "06-21", "06-26", "07-01", "07-06", "07-11"],
};

interface ModelKPIs {
  tokenTotal: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  requestCount: number;
  successRate: number;
  ttft: number;
  latency: number;
  failRate: number;
  rateLimit: number;
  safety: number;
}

function scale(value: number, timeRange: typeof TIME_RANGES[number]): number {
  const scaleMap: Record<typeof TIME_RANGES[number], number> = {
    "1 小时": 0.16, "6 小时": 1, "12 小时": 1.8, "24 小时": 3.3, "7 天": 22.6, "30 天": 102,
  };
  return Math.round(value * scaleMap[timeRange]);
}

const DEFAULT_KPI: ModelKPIs = {
  tokenTotal: 11800000,
  inputTokens: 8260000,
  outputTokens: 3540000,
  cachedTokens: 2360000,
  requestCount: 920,
  successRate: 99.3,
  ttft: 230,
  latency: 0.80,
  failRate: 0.7,
  rateLimit: 6,
  safety: 1,
};

function makeTrendData(base: number, jitter: number, length = 7): number[] {
  return Array.from({ length }, (_, i) => Math.round(base / length + Math.sin(i * 0.9) * jitter + Math.random() * jitter * 0.4));
}

export default function ModelDetailPage() {
  const params = useParams<{ modelId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const modelId = decodeURIComponent(params.modelId);

  const initialTimeRange = (searchParams.get("t") as typeof TIME_RANGES[number] | null) || "6 小时";
  const initialPrecision = (searchParams.get("p") as typeof PRECISIONS[number] | null) || GRANULARITY_PRECISION[initialTimeRange];
  const initialInference = (searchParams.get("i") as typeof INFERENCE_TYPES[number] | null) || "全部";

  const [collapsed, setCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]>(initialTimeRange);
  const [precision, setPrecision] = useState<typeof PRECISIONS[number]>(initialPrecision);
  const [inference, setInference] = useState<typeof INFERENCE_TYPES[number]>(initialInference);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [mainMetric, setMainMetric] = useState<"tokenTotal" | "requestCount">("tokenTotal");
  const [avgCompVisible, setAvgCompVisible] = useState({ total: true, input: true, output: true, cached: true });

  const scaleFactor = { "1 小时": 0.16, "6 小时": 1, "12 小时": 1.8, "24 小时": 3.3, "7 天": 22.6, "30 天": 102 }[timeRange];
  const kpi: ModelKPIs = {
    tokenTotal: Math.round(DEFAULT_KPI.tokenTotal * scaleFactor),
    inputTokens: Math.round(DEFAULT_KPI.inputTokens * scaleFactor),
    outputTokens: Math.round(DEFAULT_KPI.outputTokens * scaleFactor),
    cachedTokens: Math.round(DEFAULT_KPI.cachedTokens * scaleFactor),
    requestCount: Math.round(DEFAULT_KPI.requestCount * scaleFactor),
    successRate: DEFAULT_KPI.successRate,
    ttft: DEFAULT_KPI.ttft,
    latency: DEFAULT_KPI.latency,
    failRate: DEFAULT_KPI.failRate,
    rateLimit: Math.round(DEFAULT_KPI.rateLimit * scaleFactor),
    safety: Math.round(DEFAULT_KPI.safety * scaleFactor),
  };

  const tokenTrend = makeTrendData(kpi.tokenTotal, kpi.tokenTotal * 0.08);
  const requestTrend = makeTrendData(kpi.requestCount, kpi.requestCount * 0.1);
  const labels = TIME_LABELS[timeRange];

  const avgComp = {
    total: makeTrendData(kpi.tokenTotal / kpi.requestCount, 200),
    input: makeTrendData(kpi.inputTokens / kpi.requestCount, 150),
    output: makeTrendData(kpi.outputTokens / kpi.requestCount, 80),
    cached: makeTrendData(kpi.cachedTokens / kpi.requestCount, 60),
  };

  const reliability = {
    fail4xx: makeTrendData(kpi.failRate * kpi.requestCount / 100, 5),
    fail5xx: makeTrendData(kpi.failRate * kpi.requestCount / 100 * 0.3, 2),
    failRate: makeTrendData(kpi.failRate, 0.3),
    rateLimit: makeTrendData(kpi.rateLimit, 2),
    safety: makeTrendData(kpi.safety, 1),
    failTotal: Math.round(kpi.failRate * kpi.requestCount / 100),
    failRatePct: kpi.failRate,
    rateLimitTotal: kpi.rateLimit,
    safetyTotal: kpi.safety,
  };

  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const reset = () => {
    setTimeRange(initialTimeRange);
    setPrecision(initialPrecision);
    setInference(initialInference);
    setSelectedKeys([]);
  };

  const keyOptions = ["测试", "生产环境", "数据分析"];

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "8px 16px", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Breadcrumb */}
      <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginBottom: "var(--spacing-md)", display: "flex", alignItems: "center", gap: 6 }}>
        <a onClick={() => router.push("/analytics/usage")} style={{ cursor: "pointer", color: "var(--color-muted)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-ink)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-muted)"}>用量分析</a>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-muted)" }}><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <a onClick={() => router.push("/analytics/usage")} style={{ cursor: "pointer", color: "var(--color-muted)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-ink)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-muted)"}>Token 分析</a>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-muted)" }}><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <a onClick={() => router.push("/analytics/usage")} style={{ cursor: "pointer", color: "var(--color-muted)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-ink)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-muted)"}>模型用量</a>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-muted)" }}><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span style={{ color: "var(--color-body)", fontWeight: 500 }}>{modelId}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", margin: 0 }}>
          {modelId}
        </h1>
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)", overflow: "hidden" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: collapsed ? "none" : "1px solid var(--color-hairline-soft)" }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>筛选</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={reset} style={{ height: 28, padding: "0 12px", fontSize: "var(--text-caption)", color: "var(--color-body)", backgroundColor: "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>重置</button>
            <button onClick={() => setCollapsed((v) => !v)} style={{ height: 28, padding: "0 12px", fontSize: "var(--text-caption)", color: "var(--color-body)", backgroundColor: "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>{collapsed ? "展开" : "收起"}</button>
          </div>
        </div>
        {!collapsed && (
          <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <DetailFilterSelect label="选择时间" value={timeRange} options={TIME_RANGES as unknown as string[]} onChange={(v) => { setTimeRange(v as typeof TIME_RANGES[number]); setPrecision(GRANULARITY_PRECISION[v as typeof TIME_RANGES[number]]); }} />
            <DetailFilterSelect label="时间精度" value={precision} options={PRECISIONS as unknown as string[]} onChange={(v) => setPrecision(v as typeof PRECISIONS[number])} />
            <DetailFilterSelect label="推理类型" value={inference} options={INFERENCE_TYPES as unknown as string[]} onChange={(v) => setInference(v as typeof INFERENCE_TYPES[number])} />
            <MultiSelectFilter2 label="Key" options={keyOptions} selected={selectedKeys} onChange={setSelectedKeys} />
          </div>
        )}
      </div>

      {/* KPI - Token breakdown (4) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <KpiMetric label="全部 Token 总量" value={formatMTokens(kpi.tokenTotal)} unit="M tokens" delta={114} />
        <KpiMetric label="输入 Token 总数（不含缓存）" value={formatMTokens(kpi.inputTokens)} unit="M tokens" delta={108} />
        <KpiMetric label="输出 Tokens 总量" value={formatMTokens(kpi.outputTokens)} unit="M tokens" delta={130} />
        <KpiMetric label="隐式缓存命中 Token 总量" value={formatMTokens(kpi.cachedTokens)} unit="M tokens" delta={145} />
      </div>

      {/* Main trend - 4 lines */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>Token 趋势（4 指标）</div>
          <div style={{ display: "flex", gap: 4 }}>
            <IconBtn title="全屏"><FullscreenIcon /></IconBtn>
            <IconBtn title="下载"><DownloadIcon /></IconBtn>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-lg)" }}>
          <MultiLineChart
            series={[
              { key: "total", label: "全部 Token", color: "#000", points: avgComp.total, visible: avgCompVisible.total },
              { key: "input", label: "输入（不含缓存）", color: "#374151", points: avgComp.input, visible: avgCompVisible.input },
              { key: "output", label: "输出", color: "#9ca3af", points: avgComp.output, visible: avgCompVisible.output },
              { key: "cached", label: "缓存命中", color: "#d1d5db", points: avgComp.cached, visible: avgCompVisible.cached },
            ]}
            labels={labels}
            unit="tokens"
            hover={null}
            setHover={() => {}}
            onToggle={(key) => setAvgCompVisible((v) => ({ ...v, [key]: !v[key as keyof typeof v] }))}
          />
        </div>
      </div>

      {/* Secondary trend - request count */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>调用次数趋势</div>
          <div style={{ display: "flex", gap: 4 }}>
            <IconBtn title="全屏"><FullscreenIcon /></IconBtn>
            <IconBtn title="下载"><DownloadIcon /></IconBtn>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-lg)" }}>
          <SingleLineChart
            points={requestTrend}
            labels={labels}
            unit="次"
            valueFormat={(v) => v.toLocaleString()}
            hover={null}
            setHover={() => {}}
            metricLabel="调用次数"
            compare={false}
            comparePoints={[]}
          />
        </div>
      </div>

      {/* Avg request composition */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>平均单次请求调用量</div>
          <div style={{ display: "flex", gap: 4 }}>
            <IconBtn title="全屏"><FullscreenIcon /></IconBtn>
            <IconBtn title="下载"><DownloadIcon /></IconBtn>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-lg)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            <SmallMetric label="平均全部 Token 总量" value={formatMTokens(avgComp.total.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
            <SmallMetric label="平均输入 Token 总数（不含缓存）" value={formatMTokens(avgComp.input.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
            <SmallMetric label="平均输出 Tokens 总量" value={formatMTokens(avgComp.output.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
            <SmallMetric label="平均隐式缓存命中 Token 总量" value={formatMTokens(avgComp.cached.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
          </div>
          <MultiLineChart
            series={[
              { key: "total", label: "全部 Token", color: "#000", points: avgComp.total, visible: avgCompVisible.total },
              { key: "input", label: "输入（不含缓存）", color: "#374151", points: avgComp.input, visible: avgCompVisible.input },
              { key: "output", label: "输出", color: "#9ca3af", points: avgComp.output, visible: avgCompVisible.output },
              { key: "cached", label: "缓存命中", color: "#d1d5db", points: avgComp.cached, visible: avgCompVisible.cached },
            ]}
            labels={labels}
            unit="tokens"
            hover={null}
            setHover={() => {}}
            onToggle={(key) => setAvgCompVisible((v) => ({ ...v, [key]: !v[key as keyof typeof v] }))}
          />
        </div>
      </div>

      {/* Reliability 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <ReliabilityCard
          title="失败次数"
          mainValue={reliability.failTotal.toLocaleString()}
          mainUnit="次"
          series={[
            { key: "4xx", label: "4xx", color: "#000", points: reliability.fail4xx },
            { key: "5xx", label: "5xx", color: "#9ca3af", points: reliability.fail5xx },
          ]}
          labels={labels}
        />
        <ReliabilityCard
          title="失败率"
          mainValue={reliability.failRatePct.toFixed(1)}
          mainUnit="%"
          mainColor="#dc2626"
          series={[
            { key: "rate", label: "失败率", color: "#000", points: reliability.failRate },
            { key: "4xx", label: "4xx", color: "#9ca3af", points: reliability.fail4xx.map((v) => +(v / 10).toFixed(2)) },
            { key: "5xx", label: "5xx", color: "#d1d5db", points: reliability.fail5xx.map((v) => +(v / 10).toFixed(2)) },
          ]}
          labels={labels}
          warn={reliability.failRatePct > 5}
        />
        <ReliabilityCard
          title="限流错误次数"
          mainValue={reliability.rateLimitTotal.toLocaleString()}
          mainUnit="次"
          series={[{ key: "limit", label: "429", color: "#000", points: reliability.rateLimit }]}
          labels={labels}
          warn={reliability.rateLimitTotal > 50}
          warnHint="建议提升配额或启用重试/排队"
        />
        <ReliabilityCard
          title="内容安全拦截次数"
          mainValue={reliability.safetyTotal.toLocaleString()}
          mainUnit="次"
          series={[{ key: "safe", label: "安全拦截", color: "#000", points: reliability.safety }]}
          labels={labels}
        />
      </div>
    </div>
  );
}

const detailSelectStyle: React.CSSProperties = {
  height: 36, paddingLeft: 14, paddingRight: 32,
  fontSize: "var(--text-body-sm)", color: "var(--color-body)",
  backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
};

function DetailFilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={detailSelectStyle}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function MultiSelectFilter2({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const display = selected.length === 0 ? "全部" : `已选 ${selected.length} 项`;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{label}</span>
      <button onClick={() => setOpen((v) => !v)} style={{ ...detailSelectStyle, height: 36, paddingLeft: 14, paddingRight: 32, position: "relative", textAlign: "left", cursor: "pointer", color: selected.length ? "var(--color-ink)" : "var(--color-body)", fontWeight: selected.length ? 500 : 400 }}>
        {display}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 60, marginTop: 4, minWidth: 160, backgroundColor: "#fff", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 20, padding: 4 }}>
          <button onClick={() => onChange([])} style={{ display: "block", width: "100%", padding: "6px 10px", fontSize: "var(--text-caption)", color: "var(--color-body)", background: "none", border: "none", borderRadius: "var(--radius-xs)", cursor: "pointer", textAlign: "left" }}>全部</button>
          {options.map((o) => (
            <label key={o} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", fontSize: "var(--text-caption)", color: "var(--color-body)", cursor: "pointer" }}>
              <input type="checkbox" checked={selected.includes(o)} onChange={() => onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])} />
              {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}