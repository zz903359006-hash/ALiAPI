"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";
import type { TabItem } from "@/components/layout/Tabs";

interface ModelRank {
  rank: number;
  name: string;
  nameId: string;
  provider: string;
  providerColor: string;
  category: string;
  weeklyTokens: string;
  weeklyTrend: number;
  totalTokens: string;
  hle: number;
  availability: number;
  suppliersCount: number;
  inputPrice: string;
  outputPrice: string;
}

const RANKS: ModelRank[] = [
  { rank: 1, name: "DeepSeek V3", nameId: "deepseek-v3-0324", provider: "DeepSeek", providerColor: "#4F46E5", category: "对话", weeklyTokens: "452.10M", weeklyTrend: 12.3, totalTokens: "2.1B", hle: 0.85, availability: 97.50, suppliersCount: 3, inputPrice: "¥0.005", outputPrice: "¥0.015" },
  { rank: 2, name: "GPT-4o", nameId: "gpt-4o-2024-08-06", provider: "OpenAI", providerColor: "#10A37F", category: "对话", weeklyTokens: "370.81M", weeklyTrend: -3.2, totalTokens: "1.8B", hle: 0.92, availability: 99.96, suppliersCount: 2, inputPrice: "¥0.035", outputPrice: "¥0.105" },
  { rank: 3, name: "Claude 3.5 Sonnet", nameId: "claude-3-5-sonnet-20240620", provider: "Anthropic", providerColor: "#D4A574", category: "对话", weeklyTokens: "215.40M", weeklyTrend: 5.8, totalTokens: "980M", hle: 0.89, availability: 99.92, suppliersCount: 2, inputPrice: "¥0.042", outputPrice: "¥0.126" },
  { rank: 4, name: "通义千问 Max", nameId: "qwen-max-2025", provider: "阿里云", providerColor: "#FF6A00", category: "对话", weeklyTokens: "189.20M", weeklyTrend: 18.5, totalTokens: "720M", hle: 0.82, availability: 99.85, suppliersCount: 2, inputPrice: "¥0.028", outputPrice: "¥0.084" },
  { rank: 5, name: "Gemini 2.0 Flash", nameId: "gemini-2-0-flash", provider: "Google", providerColor: "#4285F4", category: "对话", weeklyTokens: "156.30M", weeklyTrend: 25.1, totalTokens: "520M", hle: 0.88, availability: 99.88, suppliersCount: 2, inputPrice: "¥0.015", outputPrice: "¥0.045" },
  { rank: 6, name: "DeepSeek V4 Flash", nameId: "deepseek-v4-flash", provider: "DeepSeek", providerColor: "#4F46E5", category: "代码", weeklyTokens: "128.50M", weeklyTrend: 42.7, totalTokens: "380M", hle: 0.87, availability: 98.20, suppliersCount: 2, inputPrice: "¥0.002", outputPrice: "¥0.006" },
  { rank: 7, name: "GPT-4o (代码)", nameId: "gpt-4o-code", provider: "OpenAI", providerColor: "#10A37F", category: "代码", weeklyTokens: "98.30M", weeklyTrend: -8.4, totalTokens: "450M", hle: 0.88, availability: 99.90, suppliersCount: 1, inputPrice: "¥0.035", outputPrice: "¥0.105" },
  { rank: 8, name: "Qwen2.5 72B", nameId: "qwen2-5-72b", provider: "阿里云", providerColor: "#FF6A00", category: "对话", weeklyTokens: "72.60M", weeklyTrend: 6.2, totalTokens: "210M", hle: 0.80, availability: 99.70, suppliersCount: 2, inputPrice: "¥0.010", outputPrice: "¥0.030" },
  { rank: 9, name: "Claude Opus 4.8", nameId: "claude-opus-4-8", provider: "Anthropic", providerColor: "#D4A574", category: "对话", weeklyTokens: "55.20M", weeklyTrend: -5.1, totalTokens: "290M", hle: 0.95, availability: 99.95, suppliersCount: 1, inputPrice: "¥0.084", outputPrice: "¥0.252" },
  { rank: 10, name: "Mistral Large", nameId: "mistral-large-2407", provider: "Mistral", providerColor: "#FF5A00", category: "对话", weeklyTokens: "31.80M", weeklyTrend: 2.3, totalTokens: "120M", hle: 0.83, availability: 99.80, suppliersCount: 1, inputPrice: "¥0.020", outputPrice: "¥0.060" },
];

const HLE_TOP10 = [...RANKS].sort((a, b) => b.hle - a.hle).slice(0, 10);

const TIME_OPTIONS = ["本周", "本月", "近 30 天", "全部"];

export default function RankingsPage() {
  const [timeRange, setTimeRange] = useState("本周");
  const [tab, setTab] = useState("usage");

  // Compute provider breakdown
  const providerMap = new Map<string, { color: string; tokens: number }>();
  RANKS.forEach((m) => {
    const raw = parseFloat(m.weeklyTokens.replace(/[^0-9.]/g, ""));
    const existing = providerMap.get(m.provider);
    if (existing) existing.tokens += raw;
    else providerMap.set(m.provider, { color: m.providerColor, tokens: raw });
  });
  const totalTokens = [...providerMap.values()].reduce((s, p) => s + p.tokens, 0);
  const GRAY_PALETTE = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#E5E7EB"];
  const providerShares = [...providerMap.entries()].map(([name, data], i) => ({
    name,
    color: GRAY_PALETTE[i] || "#E5E7EB",
    share: data.tokens / totalTokens,
    tokens: data.tokens,
  })).sort((a, b) => b.share - a.share).map((p, i) => ({ ...p, color: GRAY_PALETTE[i] || "#E5E7EB" }));

  let cx = 90, cy = 90, r = 70;

  const donutSegments = () => {
    const segs: { color: string; dash: string; offset: number }[] = [];
    let offset = 0;
    const circ = 2 * Math.PI * r;
    providerShares.forEach((p) => {
      const len = p.share * circ;
      segs.push({ color: p.color, dash: `${len} ${circ - len}`, offset: -offset });
      offset += len;
    });
    return segs;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-xl)", gap: "var(--spacing-md)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>模型排行榜</h1>
          <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>基于 Token 用量、质量评分与热度的实时模型排行。</p>
        </div>
        <div style={{ display: "inline-flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)", flexShrink: 0 }}>
          {TIME_OPTIONS.map((label) => {
            const active = label === timeRange;
            return (
              <button key={label} onClick={() => setTimeRange(label)} style={{ height: 34, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-nav-link)", fontWeight: 500, color: active ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: active ? "var(--color-canvas)" : "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top cards: Market share donut + HLE leaderboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
        {/* Market share */}
        <Card title="Token 占比（按厂商）">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
            <div style={{ width: 180, height: 180, flexShrink: 0, position: "relative" }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                {donutSegments().map((seg, i) => (
                  <circle key={i} cx="90" cy="90" r="70" fill="none" stroke={seg.color} strokeWidth="28" strokeDasharray={seg.dash} strokeDashoffset={seg.offset} transform="rotate(-90 90 90)" style={{ transition: "all 0.3s" }} />
                ))}
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{RANKS.length}</div>
                <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>模型</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {providerShares.map((p) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: p.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: "var(--text-body-sm)", color: "var(--color-ink)" }}>{p.name}</span>
                  <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-muted)" }}>{(p.share * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* HLE Quality */}
        <Card title="HLE 质量排行 Top 10">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {HLE_TOP10.map((m, i) => (
              <div key={m.nameId} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", padding: "4px 0", borderBottom: i < HLE_TOP10.length - 1 ? "1px solid var(--color-hairline-soft)" : "none" }}>
                <span style={{ width: 20, fontSize: "var(--text-caption)", fontWeight: 600, color: i < 3 ? ["#000000", "#333333", "#666666"][i] : "var(--color-muted)", textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: m.providerColor, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: m.hle >= 0.9 ? "var(--color-success)" : m.hle >= 0.8 ? "var(--color-warning)" : "var(--color-error)" }}>{m.hle.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rankings table */}
      <Card title={`Token 热度排行 (${timeRange})`}>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", minWidth: 750, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                <Th2>#</Th2>
                <Th2>模型</Th2>
                <Th2>类别</Th2>
                <Th2>周用量</Th2>
                <Th2>涨幅</Th2>
                <Th2>总用量</Th2>
                <Th2>HLE</Th2>
                <Th2>可用率</Th2>
                <Th2>价格（输入/输出）</Th2>
              </tr>
            </thead>
            <tbody>
              {RANKS.map((m) => (
                <tr key={m.rank} style={{ height: 48, cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-soft)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Td2>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", backgroundColor: m.rank <= 3 ? ["#000000", "#333333", "#666666"][m.rank - 1] : "var(--color-surface-soft)", color: m.rank <= 3 ? "#fff" : "var(--color-muted)", fontSize: "var(--text-caption)", fontWeight: 600 }}>
                      {m.rank}
                    </span>
                  </Td2>
                  <Td2>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                      <span style={{ width: 24, height: 24, borderRadius: "var(--radius-sm)", backgroundColor: m.providerColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.provider.charAt(0)}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--color-ink)", fontSize: "var(--text-body-sm)" }}>{m.name}</div>
                        <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{m.nameId}</div>
                      </div>
                    </div>
                  </Td2>
                  <Td2 style={{ color: "var(--color-muted)" }}>{m.category}</Td2>
                  <Td2 style={{ fontWeight: 600, color: "var(--color-ink)" }}>{m.weeklyTokens}</Td2>
                  <Td2>
                    <span style={{ color: m.weeklyTrend >= 0 ? "var(--color-success)" : "var(--color-error)", fontWeight: 500, fontSize: "var(--text-body-sm)" }}>
                      {m.weeklyTrend >= 0 ? "↑" : "↓"} {Math.abs(m.weeklyTrend).toFixed(1)}%
                    </span>
                  </Td2>
                  <Td2 style={{ color: "var(--color-body)" }}>{m.totalTokens}</Td2>
                  <Td2>
                    <span style={{ fontWeight: 600, color: m.hle >= 0.9 ? "var(--color-success)" : m.hle >= 0.8 ? "var(--color-warning)" : "var(--color-error)" }}>{m.hle.toFixed(2)}</span>
                  </Td2>
                  <Td2>
                    <span style={{ fontWeight: 500, color: m.availability >= 99 ? "var(--color-success)" : m.availability >= 95 ? "var(--color-warning)" : "var(--color-error)" }}>{m.availability.toFixed(1)}%</span>
                  </Td2>
                  <Td2>
                    <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{m.inputPrice} / {m.outputPrice}</span>
                  </Td2>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</span>
      </div>
      <div style={{ padding: "var(--spacing-lg)" }}>{children}</div>
    </div>
  );
}

function Th2({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", ...style }}>{children}</td>;
}
