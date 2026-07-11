"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";
import type { TabItem } from "@/components/layout/Tabs";
import QuickKeyModal from "@/components/QuickKeyModal";
import { isEmployee } from "@/lib/role";

const MOCK_KEYS = [
  { id: "k1", name: "生产环境 Key", key: "sk-prod-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6", masked: "sk-prod-****...z6" },
  { id: "k2", name: "测试环境 Key", key: "sk-test-m9n8o7p6q5r4s3t2u1v0w9x8y7z6a5b4c3d2e1f0g1h2i3j4k5l6m7", masked: "sk-test-****...m7" },
  { id: "k3", name: "开发调试", key: "sk-dev-q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0x1c2v3b4n5m6", masked: "sk-dev-****...m6" },
];

interface ModelItem {
  id: string; name: string; nameId: string; category: string; provider: string; providerColor: string;
  description: string;
  inputPrice: string; outputPrice: string; inputPriceNum: number; outputPriceNum: number;
  ctxLen: string; maxOutput: string;
  hle: number; hleAccuracy: number; hleHallucination: number; hleStability: number; hleLatency: number;
  inputModes: string[]; outputModes: string[]; capabilities: string[];
  cumulativeUsage: string;
  supplierCount: number;
  lastUpdated: string;
  suppliers: { name: string; color: string; latency: string }[];
}

const MOCK: ModelItem[] = [
  { id: "mdl-01", name: "GPT-4o", nameId: "gpt-4o-2024-08-06", category: "对话", provider: "OpenAI", providerColor: "#10A37F", description: "OpenAI 最新多模态旗舰模型，支持文本、图像、音频输入输出，在推理、创造性和多语言任务上表现卓越。", inputPrice: "¥0.035", outputPrice: "¥0.105", inputPriceNum: 0.035, outputPriceNum: 0.105, ctxLen: "128K", maxOutput: "16K", hle: 0.92, hleAccuracy: 0.94, hleHallucination: 3, hleStability: 0.91, hleLatency: 0.88, inputModes: ["text", "image", "audio"], outputModes: ["text", "image"], capabilities: ["流式", "多模态", "长文本"], cumulativeUsage: "370.81M", supplierCount: 2, lastUpdated: "2026-06-26 14:00:00", suppliers: [{ name: "OpenAI (直接)", color: "#10A37F", latency: "1.2s" }, { name: "Microsoft Azure", color: "#0078D4", latency: "1.5s" }] },
  { id: "mdl-02", name: "Claude 3.5 Sonnet", nameId: "claude-3-5-sonnet-20240620", category: "对话", provider: "Anthropic", providerColor: "#D4A574", description: "Anthropic 的高性能模型，擅长长文本理解、代码生成和复杂推理，200K 超长上下文窗口。", inputPrice: "¥0.042", outputPrice: "¥0.126", inputPriceNum: 0.042, outputPriceNum: 0.126, ctxLen: "200K", maxOutput: "8K", hle: 0.89, hleAccuracy: 0.90, hleHallucination: 4, hleStability: 0.92, hleLatency: 0.82, inputModes: ["text", "image"], outputModes: ["text"], capabilities: ["流式", "长文本"], cumulativeUsage: "215.40M", supplierCount: 2, lastUpdated: "2026-06-25 08:30:00", suppliers: [{ name: "Anthropic (直接)", color: "#D4A574", latency: "1.8s" }, { name: "AWS Bedrock", color: "#FF9900", latency: "2.1s" }] },
  { id: "mdl-03", name: "通义千问 Max", nameId: "qwen-max-2025", category: "对话", provider: "阿里云", providerColor: "#FF6A00", description: "阿里云通义系列最强模型，中文能力领先，支持长文本理解和多轮对话，性价比极高。", inputPrice: "¥0.028", outputPrice: "¥0.084", inputPriceNum: 0.028, outputPriceNum: 0.084, ctxLen: "32K", maxOutput: "8K", hle: 0.82, hleAccuracy: 0.84, hleHallucination: 7, hleStability: 0.85, hleLatency: 0.80, inputModes: ["text"], outputModes: ["text"], capabilities: ["流式", "长文本"], cumulativeUsage: "189.20M", supplierCount: 2, lastUpdated: "2026-06-24 16:00:00", suppliers: [{ name: "阿里云 (直接)", color: "#FF6A00", latency: "0.8s" }, { name: "华为云", color: "#CF0A2C", latency: "1.0s" }] },
  { id: "mdl-04", name: "DeepSeek V3", nameId: "deepseek-v3-0324", category: "对话", provider: "DeepSeek", providerColor: "#4F46E5", description: "DeepSeek 最新旗舰模型，极低价格，优秀的中文和代码能力，适合高并发大规模调用。", inputPrice: "¥0.005", outputPrice: "¥0.015", inputPriceNum: 0.005, outputPriceNum: 0.015, ctxLen: "64K", maxOutput: "8K", hle: 0.85, hleAccuracy: 0.87, hleHallucination: 6, hleStability: 0.88, hleLatency: 0.93, inputModes: ["text"], outputModes: ["text"], capabilities: ["流式", "长文本"], cumulativeUsage: "452.10M", supplierCount: 3, lastUpdated: "2026-06-26 10:00:00", suppliers: [{ name: "DeepSeek (直接)", color: "#4F46E5", latency: "0.6s" }, { name: "火山引擎", color: "#1E6FFF", latency: "0.9s" }, { name: "腾讯云", color: "#00A4FF", latency: "1.1s" }] },
  { id: "mdl-05", name: "GPT-4o (代码)", nameId: "gpt-4o-code", category: "代码", provider: "OpenAI", providerColor: "#10A37F", description: "GPT-4o 针对代码生成与调试优化版本，支持多语言代码补全和解释。", inputPrice: "¥0.035", outputPrice: "¥0.105", inputPriceNum: 0.035, outputPriceNum: 0.105, ctxLen: "128K", maxOutput: "16K", hle: 0.88, hleAccuracy: 0.90, hleHallucination: 5, hleStability: 0.86, hleLatency: 0.85, inputModes: ["text"], outputModes: ["text"], capabilities: ["流式"], cumulativeUsage: "98.30M", supplierCount: 1, lastUpdated: "2026-06-23 12:00:00", suppliers: [{ name: "OpenAI (直接)", color: "#10A37F", latency: "1.1s" }] },
  { id: "mdl-06", name: "DALL·E 3", nameId: "dalle-3", category: "图像生成", provider: "OpenAI", providerColor: "#10A37F", description: "OpenAI 最新图像生成模型，支持高质量文本到图像生成，适用于创意设计场景。", inputPrice: "¥0.080", outputPrice: "—", inputPriceNum: 0.080, outputPriceNum: 0, ctxLen: "—", maxOutput: "—", hle: 0.75, hleAccuracy: 0.78, hleHallucination: 12, hleStability: 0.72, hleLatency: 0.60, inputModes: ["text"], outputModes: ["image"], capabilities: [], cumulativeUsage: "24.50M", supplierCount: 1, lastUpdated: "2026-06-20 09:00:00", suppliers: [{ name: "OpenAI (直接)", color: "#10A37F", latency: "2.5s" }] },
];

function recommendationTags(m: ModelItem): string[] {
  const tags: string[] = [];
  if (m.hle >= 0.90) tags.push("高质量");
  if (m.hle >= 0.85 && m.hle < 0.90) tags.push("高性价比");
  if (m.inputPriceNum <= 0.01) tags.push("低成本");
  if (m.hleLatency >= 0.90) tags.push("低延迟");
  const ctx = parseInt(m.ctxLen) || 0;
  if (ctx >= 128) tags.push("长上下文");
  if (m.capabilities.includes("代码") || m.name.includes("代码")) tags.push("适合代码");
  if (m.name === "GPT-4o") tags.push("热门");
  return tags.slice(0, 2);
}

const CATS = ["全部", "对话", "代码", "多模态", "图像生成", "嵌入"];
const CAPS = ["流式", "多模态", "长文本"];
const SORTS = ["综合推荐", "价格从低到高", "价格从高到低", "HLE 评分", "上下文长度"];
const PROVIDERS = ["全部", ...new Set(MOCK.map((m) => m.provider))];

export default function ModelsPage() {
  const [category, setCategory] = useState("全部");
  const [provider, setProvider] = useState("全部");
  const [sort, setSort] = useState("综合推荐");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeCaps, setActiveCaps] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ModelItem | null>(null);
  const [toast, setToast] = useState("");
  const [preferredModels, setPreferredModels] = useState<Set<string>>(new Set());
  const [blacklistedModels, setBlacklistedModels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortInfo, setSortInfo] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  const toggleCap = (c: string) => setActiveCaps((p) => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const clearFilters = () => { setCategory("全部"); setProvider("全部"); setSort("综合推荐"); setActiveCaps(new Set()); setSearch(""); };
  const copy = useCallback((id: string) => { navigator.clipboard.writeText(id); setToast("已复制到剪贴板"); setTimeout(() => setToast(""), 2000); }, []);

  const togglePreferred = useCallback((id: string) => {
    setPreferredModels((prev) => { const next = new Set(prev); if (next.has(id)) { next.delete(id); setToast("已取消优选"); } else { next.add(id); setToast("已设为优选"); } setTimeout(() => setToast(""), 2000); return next; });
  }, []);

  const toggleBlacklisted = useCallback((id: string) => {
    setBlacklistedModels((prev) => { const next = new Set(prev); if (next.has(id)) { next.delete(id); setToast("已移出黑名单"); } else { next.add(id); setToast("已加入黑名单"); } setTimeout(() => setToast(""), 2000); return next; });
  }, []);

  let data = MOCK;
  if (category !== "全部") data = data.filter((m) => m.category === category);
  if (provider !== "全部") data = data.filter((m) => m.provider === provider);
  if (activeCaps.size > 0) data = data.filter((m) => [...activeCaps].every((c) => m.capabilities.includes(c)));
  if (search) { const q = search.toLowerCase(); data = data.filter((m) => m.name.toLowerCase().includes(q) || m.nameId.toLowerCase().includes(q)); }
  if (sort === "价格从低到高") data = [...data].sort((a, b) => a.inputPriceNum - b.inputPriceNum);
  else if (sort === "价格从高到低") data = [...data].sort((a, b) => b.inputPriceNum - a.inputPriceNum);
  else if (sort === "HLE 评分") data = [...data].sort((a, b) => b.hle - a.hle);
  else if (sort === "上下文长度") data = [...data].sort((a, b) => (parseInt(b.ctxLen) || 0) - (parseInt(a.ctxLen) || 0));

  const hasFilters = category !== "全部" || provider !== "全部" || activeCaps.size > 0 || search;
  const filterTags: { label: string; onRemove: () => void }[] = [];
  if (category !== "全部") filterTags.push({ label: `类型：${category}`, onRemove: () => setCategory("全部") });
  if (provider !== "全部") filterTags.push({ label: `厂商：${provider}`, onRemove: () => setProvider("全部") });
  activeCaps.forEach((c) => filterTags.push({ label: `能力：${c}`, onRemove: () => toggleCap(c) }));
  if (search) filterTags.push({ label: `搜索：${search}`, onRemove: () => setSearch("") });

  return (
    <div>
      {toast && <Toast msg={toast} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-xl)", gap: "var(--spacing-md)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{getRouteTitle("/models")}</h1>
          <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>浏览可调用的 AI 模型，按能力和价格选择最适合的模型。</p>
        </div>
        <TxtBtn>查看文档</TxtBtn>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-xs)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", height: 40, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", gap: "var(--spacing-xs)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", minWidth: 200, flex: "0 1 260px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-muted)" }}><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索模型名称或标识…" style={{ border: "none", background: "none", outline: "none", flex: 1, fontSize: "var(--text-body-sm)", color: "var(--color-ink)", minWidth: 0 }} />
        </div>
        <Sel value={category} onChange={setCategory} options={CATS} />
        <Sel value={provider} onChange={setProvider} options={PROVIDERS} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Sel value={sort} onChange={setSort} options={SORTS} />
          <div style={{ position: "relative" }}>
            <span style={{ cursor: "pointer", display: "inline-flex", verticalAlign: "middle" }} onMouseEnter={() => setSortInfo(true)} onMouseLeave={() => setSortInfo(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg></span>
            {sortInfo && (
              <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 20, width: 220, padding: "var(--spacing-sm)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "var(--text-caption)", color: "var(--color-body)", lineHeight: 1.5, pointerEvents: "none" }}>
                综合推荐会优先参考价格、HLE 质量评分与调用热度。
              </div>
            )}
          </div>
        </div>
        {CAPS.map((c) => { const active = activeCaps.has(c); return <Pill key={c} active={active} onClick={() => toggleCap(c)}>{c}</Pill>; })}
        {hasFilters && <TxtBtn onClick={clearFilters} style={{ fontSize: "var(--text-caption)" }}>清除</TxtBtn>}
        <div style={{ marginLeft: "auto", display: "flex", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)", flexShrink: 0 }}>
          <ViewBtn active={view === "grid"} onClick={() => setView("grid")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          </ViewBtn>
          <ViewBtn active={view === "list"} onClick={() => setView("list")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          </ViewBtn>
        </div>
      </div>

      {/* Active filters bar */}
      {filterTags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xxs)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
          {filterTags.map((tag, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 26, paddingLeft: 8, paddingRight: 6, fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-pill)" }}>
              {tag.label}
              <button onClick={tag.onRemove} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", padding: 0 }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4L12 12M12 4L4 12" /></svg></button>
            </span>
          ))}
          {filterTags.length > 1 && <TxtBtn onClick={clearFilters} style={{ fontSize: "var(--text-caption)", marginLeft: 4 }}>清除全部</TxtBtn>}
        </div>
      )}

      {/* Content */}
      {loading ? <Skeleton /> : view === "grid" ? (
        <ModelsGrid data={data} onDetail={setDetail} onCopy={copy} onClear={clearFilters} />
      ) : (
        <ModelsList data={data} onDetail={setDetail} onCopy={copy} onClear={clearFilters} preferredModels={preferredModels} blacklistedModels={blacklistedModels} onTogglePreferred={togglePreferred} onToggleBlacklisted={toggleBlacklisted} />
      )}

      {/* Model Detail Drawer */}
      <ModelDrawer
        data={detail}
        onClose={() => setDetail(null)}
        preferredModels={preferredModels}
        blacklistedModels={blacklistedModels}
        onTogglePreferred={togglePreferred}
        onToggleBlacklisted={toggleBlacklisted}
        isEmployee={isEmployee}
      />

    </div>
  );
}

/* Grid */
function ModelsGrid({ data, onDetail, onCopy, onClear }: { data: ModelItem[]; onDetail: (m: ModelItem) => void; onCopy: (id: string) => void; onClear: () => void; }) {
  if (data.length === 0) return <Empty onClear={onClear} />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "var(--spacing-lg)", alignItems: "stretch" }}>
      {data.map((m) => <ModelCard key={m.id} data={m} onDetail={onDetail} onCopy={onCopy} />)}
    </div>
  );
}

function ModelCard({ data: m, onDetail, onCopy }: { data: ModelItem; onDetail: (m: ModelItem) => void; onCopy: (id: string) => void; }) {
  return (
    <div className="group/card"
      onClick={() => onDetail(m)}
      style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#d1d5db"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--color-hairline)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--spacing-md)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)", minWidth: 0 }}>
           <span style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", backgroundColor: m.providerColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{m.provider.charAt(0)}</span>
           <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
             <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nameId}</span>
             <button onClick={(e) => { e.stopPropagation(); onCopy(m.nameId); }} style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", padding: 0, flexShrink: 0 }} title="复制 ID"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></button>
           </div>
         </div>
       </div>
       <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", lineHeight: 1.5, marginBottom: "var(--spacing-md)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.description}</div>
       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-sm)", padding: "var(--spacing-sm) 0", marginBottom: "var(--spacing-md)" }}>
         <div><div style={{ fontSize: 10, color: "var(--color-muted)", marginBottom: 1 }}>输入价格</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-success)" }}>{m.inputPrice}</div><div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>上下文</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)" }}>{m.ctxLen}</div></div>
         <div><div style={{ fontSize: 10, color: "var(--color-muted)", marginBottom: 1 }}>输出价格</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-success)" }}>{m.outputPrice}</div><div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>最大输出</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)" }}>{m.maxOutput}</div></div>
       </div>
       {/* Hover overlay */}
        <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-150" style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6, zIndex: 1 }}>
          <button onClick={(e) => { e.stopPropagation(); onDetail(m); }} style={{ height: 28, padding: "0 10px", fontSize: 12, fontWeight: 500, color: "var(--color-ink)", backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>查看详情</button>
        </div>
     </div>
   );
 }

function ModelsList({ data, onDetail, onCopy, onClear, preferredModels, blacklistedModels, onTogglePreferred, onToggleBlacklisted }: { data: ModelItem[]; onDetail: (m: ModelItem) => void; onCopy: (id: string) => void; onClear: () => void; preferredModels: Set<string>; blacklistedModels: Set<string>; onTogglePreferred: (id: string) => void; onToggleBlacklisted: (id: string) => void; }) {
  if (data.length === 0) return <Empty onClear={onClear} />;
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
      <table style={{ width: "100%", minWidth: 850, borderCollapse: "collapse" }}>
        <thead><tr style={{ backgroundColor: "#F9FAFB" }}><Th2>模型</Th2><Th2>类型</Th2><Th2>输入</Th2><Th2>输出</Th2><Th2>上下文</Th2><Th2 right>操作</Th2></tr></thead>
        <tbody>{data.map((m) => (
          <tr key={m.id} onClick={() => onDetail(m)} style={{ height: 48, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-soft)"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            <Td2><div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}><span style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", backgroundColor: m.providerColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{m.provider.charAt(0)}</span><div><div style={{ fontWeight: 600, color: "var(--color-ink)", fontSize: "var(--text-body-sm)" }}>{m.name}</div><div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{m.nameId}</div></div></div></Td2>
            <Td2 style={{ color: "var(--color-muted)" }}>{m.category}</Td2>
            <Td2 style={{ fontWeight: 500, color: "var(--color-success)" }}>{m.inputPrice}</Td2>
            <Td2 style={{ fontWeight: 500, color: "var(--color-success)" }}>{m.outputPrice}</Td2>
            <Td2 style={{ color: "var(--color-body)" }}>{m.ctxLen}</Td2>
            <Td2 right><div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}><LBtn onClick={(e) => { e?.stopPropagation(); onCopy(m.nameId); }}>复制</LBtn><LBtn onClick={(e) => { e?.stopPropagation(); onDetail(m); }}>详情</LBtn></div></Td2>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}


/* Sub components */
function ModelDrawer({ data, onClose, preferredModels, blacklistedModels, onTogglePreferred, onToggleBlacklisted, isEmployee }: { data: ModelItem | null; onClose: () => void; preferredModels: Set<string>; blacklistedModels: Set<string>; onTogglePreferred: (id: string) => void; onToggleBlacklisted: (id: string) => void; isEmployee?: boolean }) {
  const [toast, setToast] = useState("");
  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [quickKeyModalOpen, setQuickKeyModalOpen] = useState(false);
  const [preferredSupplier, setPreferredSupplier] = useState<string | null>(null);
  const [pgKeyId, setPgKeyId] = useState("");
  const [pgPrompt, setPgPrompt] = useState("");
  const [pgResponse, setPgResponse] = useState("");
  const [pgStreaming, setPgStreaming] = useState(false);
  const [pgTemperature, setPgTemperature] = useState(0.7);
  const [pgMaxTokens, setPgMaxTokens] = useState(2048);
  const [pgPopoverOpen, setPgPopoverOpen] = useState(false);
  const [pgStats, setPgStats] = useState<{ latency: string; tokens: number; cost: string } | null>(null);
  const injectedKey = MOCK_KEYS.find((k) => k.id === selectedKeyId)?.key || "";
  if (!data) return null;
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };
  return (
    <>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.2)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 520, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <div className="flex items-start justify-between shrink-0" style={{ padding: "var(--spacing-xl) var(--spacing-xl) 0" }}>
          <div style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "flex-start", minWidth: 0 }}>
            <span style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", backgroundColor: data.providerColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{data.provider.charAt(0)}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.nameId}</span>
                  <button onClick={() => { navigator.clipboard.writeText(data.nameId); showToast("已复制模型 ID"); }} style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", padding: 0, flexShrink: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></button>
                </div>
              </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-xl)" }}>
          <DSec t="简介"><p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.7, margin: 0 }}>{data.description}</p></DSec>
          <DSec t="官方价格"><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <div><div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}><SpecRow label="输入价格" value={data.inputPrice} valueColor="var(--color-success)" /><SpecRow label="上下文长度" value={data.ctxLen} /></div></div>
            <div><div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}><SpecRow label="输出价格" value={data.outputPrice} valueColor="var(--color-success)" /><SpecRow label="最大输出" value={data.maxOutput} /></div></div>
          </div><div style={{ marginTop: "var(--spacing-sm)", fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>按每 1,000 Tokens 计费 · 输入/输出分别计费</div></DSec>
          <DSec t="快速调用"><div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div style={{ display: "flex", gap: "var(--spacing-xs)", alignItems: "center" }}>
              <select value={selectedKeyId} onChange={(e) => setSelectedKeyId(e.target.value)} style={{ flex: 1, height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: selectedKeyId ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                <option value="">选择已有 Key</option>
                {MOCK_KEYS.map((k) => <option key={k.id} value={k.id}>{k.name} ({k.masked})</option>)}
              </select>
              <button onClick={() => setQuickKeyModalOpen(true)} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>+ 新建</button>
            </div>
          </div></DSec>
          <DSec t="快速开始"><p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: "0 0 var(--spacing-md)" }}>复制以下代码，将 base_url 和 authorization 替换为你创建的 limKey 即可发起调用。</p><QuickCode modelId={data.nameId} apiKey={injectedKey} /></DSec>
        </div>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderTop: "1px solid var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
          {isEmployee ? (
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <button onClick={() => { onClose(); }} style={{ flex: 1, height: 40, fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>关闭</button>
              {sessionStorage.getItem("hasClaimedKey") ? (
                <button onClick={() => { onClose(); window.location.href = `/playground?model=${data.nameId}`; }} style={{ flex: 1, height: 40, fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>在线测试</button>
              ) : (
                <button onClick={() => { onClose(); window.location.href = "/keys"; }} style={{ flex: 1, height: 40, fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>前往领取 Key</button>
              )}
            </div>
          ) : (
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <button onClick={() => { onClose(); window.location.href = `/playground?model=${data.nameId}`; }} style={{ height: 40, padding: "0 var(--spacing-sm)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>在线测试</button>
            <button onClick={() => { onTogglePreferred(data.id); showToast(preferredModels.has(data.id) ? "已从路由优选名单移除" : "已加入全局路由优选名单"); }} style={{ height: 40, padding: "0 var(--spacing-sm)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>{preferredModels.has(data.id) ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> 已优选</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> 设为优选</>}</button>
            <button onClick={() => { onToggleBlacklisted(data.id); showToast(blacklistedModels.has(data.id) ? "已从路由黑名单移除" : "已加入全局路由黑名单"); }} style={{ height: 40, padding: "0 var(--spacing-sm)", fontSize: "var(--text-button)", fontWeight: 600, color: blacklistedModels.has(data.id) ? "var(--color-error)" : "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>{blacklistedModels.has(data.id) ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg> 已黑名单</> : "加入黑名单"}</button>
          </div>
          )}
        </div>
      </div>

      {quickKeyModalOpen && (
        <QuickKeyModal
          onClose={() => setQuickKeyModalOpen(false)}
          onSuccess={(name, key) => {
            const newKey = { id: `k${Date.now()}`, name, key, masked: `${key.slice(0, 8)}****...${key.slice(-2)}` };
            MOCK_KEYS.push(newKey);
            setSelectedKeyId(newKey.id);
            setQuickKeyModalOpen(false);
            showToast(`${name} 已创建`);
          }}
        />
      )}
    </>
  );
}

function QuickCode({ modelId, apiKey }: { modelId: string; apiKey?: string }) {
  const keyDisplay = apiKey || "sk-your-key-here";
  const isClaude = modelId.toLowerCase().includes("claude");
  const [protocol, setProtocol] = useState("openai");
  const [langTab, setLangTab] = useState("curl");

  const openaiCurl = `curl https://api.limAPI.dev/v1/chat/completions \\\n  -H "Authorization: Bearer ${keyDisplay}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "${modelId}",\n    "messages": [{"role": "user", "content": "Hello"}]\n  }'`;
  const openaiPython = `import openai\n\nclient = openai.OpenAI(\n    base_url="https://api.limAPI.dev/v1",\n    api_key="${keyDisplay}"\n)\n\nresponse = client.chat.completions.create(\n    model="${modelId}",\n    messages=[{"role": "user", "content": "Hello"}]\n)\nprint(response.choices[0].message.content)`;
  const openaiNode = `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://api.limAPI.dev/v1",\n  apiKey: "${keyDisplay}",\n});\n\nconst response = await client.chat.completions.create({\n  model: "${modelId}",\n  messages: [{ role: "user", content: "Hello" }],\n});\n\nconsole.log(response.choices[0].message.content);`;

  const anthropicCurl = `curl https://api.limAPI.dev/anthropic/v1/messages \\\n  -H "x-api-key: ${keyDisplay}" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "${modelId}",\n    "max_tokens": 1024,\n    "messages": [{"role": "user", "content": "Hello"}]\n  }'`;
  const anthropicPython = `import anthropic\n\nclient = anthropic.Anthropic(\n    api_key="${keyDisplay}",\n    base_url="https://api.limAPI.dev/anthropic"\n)\n\nresponse = client.messages.create(\n    model="${modelId}",\n    max_tokens=1024,\n    messages=[{"role": "user", "content": "Hello"}]\n)\nprint(response.content[0].text)`;
  const anthropicNode = `import Anthropic from "@anthropic-ai/sdk";\n\nconst client = new Anthropic({\n  apiKey: "${keyDisplay}",\n  baseURL: "https://api.limAPI.dev/anthropic",\n});\n\nconst response = await client.messages.create({\n  model: "${modelId}",\n  max_tokens: 1024,\n  messages: [{ role: "user", content: "Hello" }],\n});\n\nconsole.log(response.content[0].text);`;

  const isAnthropic = protocol === "anthropic";
  const code = isAnthropic ? anthropicCurl : openaiCurl;
  const codePython = isAnthropic ? anthropicPython : openaiPython;
  const codeNode = isAnthropic ? anthropicNode : openaiNode;

  const langTabs: TabItem[] = [
    { key: "curl", label: "cURL", content: <CodeSnippet code={code} /> },
    { key: "python", label: "Python", content: <CodeSnippet code={codePython} /> },
    { key: "node", label: "Node.js", content: <CodeSnippet code={codeNode} /> },
  ];

  if (!isClaude) {
    return <Tabs tabs={langTabs} activeKey={langTab} onChange={setLangTab} />;
  }

  const protocolTabs: TabItem[] = [
    { key: "openai", label: "OpenAI 兼容格式", content: <div><Tabs tabs={langTabs} activeKey={langTab} onChange={setLangTab} /></div> },
    {
      key: "anthropic", label: "Anthropic 原生格式",
      content: (
        <div>
          <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: "0 0 var(--spacing-md)" }}>如果您使用 Cursor 或 Claude 客户端，可在设置中将 Base URL 指向 <code style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)", fontSize: 11, backgroundColor: "var(--color-surface-card)", padding: "1px 4px", borderRadius: "var(--radius-sm)" }}>https://api.limAPI.dev/anthropic</code>。</p>
          <Tabs tabs={langTabs} activeKey={langTab} onChange={setLangTab} />
        </div>
      ),
    },
  ];

  return <Tabs tabs={protocolTabs} activeKey={protocol} onChange={setProtocol} />;
}

function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (<div style={{ position: "relative", backgroundColor: "#1e1e1e", borderRadius: "var(--radius-md)", overflow: "hidden", marginTop: 4 }}>
    <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ position: "absolute", top: 8, right: 8, zIndex: 1, height: 30, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: copied ? "#10b981" : "#a1a1aa", backgroundColor: "rgba(255,255,255,0.08)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>{copied ? "已复制" : "复制"}</button>
    <pre style={{ margin: 0, padding: "var(--spacing-md)", overflow: "auto", fontSize: 13, lineHeight: 1.6, fontFamily: "var(--font-mono)", color: "#d4d4d4", whiteSpace: "pre-wrap" }}>{code}</pre>
  </div>);
}

function Playground({ modelName, apiKeyId, setApiKeyId, prompt, setPrompt, response, setResponse, streaming, setStreaming, temperature, setTemperature, maxTokens, setMaxTokens, popoverOpen, setPopoverOpen, stats, setStats, showToast }: { modelName: string; apiKeyId: string; setApiKeyId: (v: string) => void; prompt: string; setPrompt: (v: string) => void; response: string; setResponse: (v: string) => void; streaming: boolean; setStreaming: (v: boolean) => void; temperature: number; setTemperature: (v: number) => void; maxTokens: number; setMaxTokens: (v: number) => void; popoverOpen: boolean; setPopoverOpen: (v: boolean) => void; stats: { latency: string; tokens: number; cost: string } | null; setStats: (v: { latency: string; tokens: number; cost: string } | null) => void; showToast: (m: string) => void; }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (popoverOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) setPopoverOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popoverOpen, setPopoverOpen]);

  const stopRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const estimatedTokens = Math.max(20, Math.round(prompt.length / 2.5));

  const startStream = () => {
    if (!apiKeyId) { showToast("请先选择 Key"); return; }
    if (!prompt.trim()) { showToast("请输入 Prompt"); return; }
    setStats(null);
    setResponse("");
    setStreaming(true);
    stopRef.current = false;
    const start = Date.now();
    const seed = `${modelName} 收到你的消息了。这是一段模拟流式输出，演示 Console Playground 的实时响应效果。\n\n针对你的问题，模型会按 Token 粒度增量返回。在生产环境，这里会通过 SSE/WebSocket 推送真实的 chat.completion.chunk 事件。\n\n下面是一段示例回答：\n- 第一要点：先用一句话总结\n- 第二要点：再展开 2-3 条理由\n- 第三要点：给出可直接执行的建议\n\n（演示数据，实际响应来自 ${modelName}）`;
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (stopRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStreaming(false);
        return;
      }
      i += 6;
      if (i >= seed.length) {
        setResponse(seed);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStreaming(false);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const tokens = Math.round(seed.length / 2);
        const cost = (tokens * 0.000012).toFixed(4);
        setStats({ latency: `${elapsed}s`, tokens, cost: `¥ ${cost}` });
        return;
      }
      setResponse(seed.slice(0, i));
    }, 35);
  };

  const stopStream = () => {
    stopRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStreaming(false);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const canSend = !!apiKeyId && !streaming;

  return (
    <div style={{ border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-canvas)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-sm) var(--spacing-md)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <select value={apiKeyId} onChange={(e) => setApiKeyId(e.target.value)} disabled={streaming} style={{ flex: 1, height: 32, paddingLeft: "var(--spacing-sm)", paddingRight: 28, fontSize: "var(--text-body-sm)", color: apiKeyId ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: streaming ? "not-allowed" : "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
          <option value="">选择 Key</option>
          {MOCK_KEYS.map((k) => <option key={k.id} value={k.id}>{k.name} ({k.masked})</option>)}
        </select>
        <div ref={popoverRef} style={{ position: "relative" }}>
          <button onClick={() => setPopoverOpen(!popoverOpen)} disabled={streaming} style={{ height: 32, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: streaming ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            参数
          </button>
          {popoverOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 10, width: 260, padding: "var(--spacing-md)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}>
              <div style={{ marginBottom: "var(--spacing-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>Temperature</span><span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)" }}>{temperature.toFixed(1)}</span></div>
                <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "var(--color-primary)" }} />
              </div>
              <div>
                <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginBottom: 6 }}>Max Tokens</div>
                <input type="number" min={1} max={32768} value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1)} style={{ width: "100%", height: 32, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "var(--spacing-md)", display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={streaming} placeholder="输入测试 Prompt..." style={{ width: "100%", minHeight: 90, padding: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-hairline)"; }} />
        <div style={{ position: "relative", backgroundColor: "#1e1e1e", borderRadius: "var(--radius-sm)", minHeight: 140, border: "1px solid #1e1e1e" }}>
          {response ? (
            <pre style={{ margin: 0, padding: "var(--spacing-sm) var(--spacing-md)", fontSize: 12.5, lineHeight: 1.65, fontFamily: "var(--font-mono)", color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 124 }}>{response}{streaming && <span style={{ display: "inline-block", width: 7, height: 14, backgroundColor: "#10b981", marginLeft: 2, verticalAlign: "text-bottom", animation: "pulse 1s infinite" }} />}</pre>
          ) : (
            <div style={{ padding: "var(--spacing-md)", fontSize: 12, color: "#6B7280", fontFamily: "var(--font-mono)" }}>{streaming ? "正在连接模型..." : "响应将在这里流式输出"}</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-sm) var(--spacing-md)", borderTop: "1px solid var(--color-hairline-soft)", backgroundColor: "var(--color-surface-card)", borderBottomLeftRadius: "var(--radius-md)", borderBottomRightRadius: "var(--radius-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
          {stats ? (
            <>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--color-success)" }} />耗时 <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>{stats.latency}</strong></span>
              <span>消耗 <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>{stats.tokens}</strong> Tokens</span>
              <span>费用 <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>{stats.cost}</strong></span>
            </>
          ) : (
            <span>预计消耗 ~{estimatedTokens} Tokens</span>
          )}
        </div>
        <div style={{ position: "relative" }}>
          {streaming ? (
            <button onClick={stopStream} style={{ height: 32, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "var(--color-error)" }} />停止生成
            </button>
          ) : (
            <button onClick={startStream} disabled={!canSend} title={!apiKeyId ? "请先选择 Key" : ""} style={{ height: 32, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: canSend ? "var(--color-primary)" : "#9CA3AF", border: "none", borderRadius: "var(--radius-sm)", cursor: canSend ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", gap: 6 }}>
              发送测试请求
            </button>
          )}
        </div>
      </div>
      {!apiKeyId && <div style={{ padding: "var(--spacing-xs) var(--spacing-md)", fontSize: 11, color: "var(--color-warning)", borderTop: "1px solid var(--color-hairline-soft)" }}>提示：请先创建 Key 并确保账户有可用额度</div>}
    </div>
  );
}

function SupplierChannelRow({ supplier }: { supplier: { name: string; type: string; latency: number; inputPrice: number; outputPrice: number; preferred: string | null; onPrefer: (name: string) => void } }) {
  const latencyColor = supplier.latency <= 200 ? "var(--color-success)" : supplier.latency <= 350 ? "var(--color-warning)" : "var(--color-error)";
  const latencyWidth = Math.max(15, 100 - supplier.latency / 5);
  const isPreferred = supplier.preferred === supplier.name;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", padding: "var(--spacing-sm) var(--spacing-md)", border: "1px solid var(--color-hairline-soft)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-canvas)" }}>
      <div style={{ flex: "0 0 130px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{supplier.name}</span>
          {isPreferred && <span style={{ fontSize: 10, fontWeight: 600, color: "#EA580C", backgroundColor: "rgba(234,88,12,0.10)", padding: "1px 6px", borderRadius: "var(--radius-pill)", display: "inline-flex", alignItems: "center", gap: 2 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> 优选</span>}
        </div>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{supplier.type}</span>
      </div>
      <div style={{ flex: "0 0 110px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-body)", whiteSpace: "nowrap" }}>延迟 {supplier.latency}ms</span>
        <div style={{ flex: 1, height: 4, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-full)", overflow: "hidden" }}><div style={{ width: `${latencyWidth}%`, height: "100%", backgroundColor: latencyColor, borderRadius: "var(--radius-full)" }} /></div>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-sm)", fontSize: "var(--text-caption)" }}>
        <div><span style={{ color: "var(--color-muted)" }}>输入 </span><span style={{ color: "var(--color-ink)", fontWeight: 600 }}>${supplier.inputPrice.toFixed(2)}</span><span style={{ color: "var(--color-muted)" }}> / 1M</span></div>
        <div><span style={{ color: "var(--color-muted)" }}>输出 </span><span style={{ color: "var(--color-ink)", fontWeight: 600 }}>${supplier.outputPrice.toFixed(2)}</span><span style={{ color: "var(--color-muted)" }}> / 1M</span></div>
      </div>
      <button onClick={() => supplier.onPrefer(supplier.name)} style={{ flex: "0 0 auto", height: 28, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: isPreferred ? "var(--color-on-primary)" : "var(--color-ink)", backgroundColor: isPreferred ? "var(--color-primary)" : "transparent", border: isPreferred ? "none" : "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap" }}>{isPreferred ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> 已优选</> : "设为优选"}</button>
    </div>
  );
}
function ModeIcon({ type, size = 14 }: { type: string; size?: number }) { const s = size; if (type === "text") return <span style={{ width: s, height: s, borderRadius: 3, backgroundColor: "#E0E7FF", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.55, fontWeight: 700, flexShrink: 0 }} title="文本">T</span>; if (type === "image") return <span style={{ width: s, height: s, borderRadius: 3, backgroundColor: "#FCE7F3", color: "#BE185D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.55, fontWeight: 700, flexShrink: 0 }} title="图片">I</span>; if (type === "audio") return <span style={{ width: s, height: s, borderRadius: 3, backgroundColor: "#D1FAE5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.55, fontWeight: 700, flexShrink: 0 }} title="音频">A</span>; return null; }
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} style={{ height: 30, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: active ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: active ? "#E5E7EB" : "var(--color-surface-card)", border: "none", borderRadius: "var(--radius-pill)", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{children}</button>; }
function Toast({ msg }: { msg: string }) { return <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{msg}</div>; }
function Skeleton() { return (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "var(--spacing-lg)" }}>{Array.from({ length: 6 }).map((_, i) => (<div key={i} style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}><div style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)" }}><div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-card)", animation: "pulse 1.5s infinite" }} /><div style={{ flex: 1 }}><div style={{ height: 14, width: "60%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, marginBottom: 6, animation: "pulse 1.5s infinite" }} /><div style={{ height: 10, width: "40%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, animation: "pulse 1.5s infinite" }} /></div></div><div style={{ height: 24, width: "35%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, marginBottom: "var(--spacing-md)", animation: "pulse 1.5s infinite" }} /><div style={{ height: 12, width: "100%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, marginBottom: 4, animation: "pulse 1.5s infinite" }} /><div style={{ height: 12, width: "70%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, marginBottom: "var(--spacing-md)", animation: "pulse 1.5s infinite" }} /><div style={{ height: 60, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)", marginBottom: "var(--spacing-md)", animation: "pulse 1.5s infinite" }} /><div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ height: 8, width: "30%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, animation: "pulse 1.5s infinite" }} /><div style={{ height: 8, width: "25%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, animation: "pulse 1.5s infinite" }} /><div style={{ height: 8, width: "20%", backgroundColor: "var(--color-surface-card)", borderRadius: 4, animation: "pulse 1.5s infinite" }} /></div></div>))}</div>); }
function Empty({ onClear }: { onClear: () => void }) { return (<div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minHeight: 300 }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><line x1="8" y1="11" x2="14" y2="11" /></svg><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginTop: "var(--spacing-md)" }}>未找到符合条件的模型</span><button onClick={onClear} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-brand-accent)", background: "none", border: "none", cursor: "pointer", marginTop: "var(--spacing-xs)" }}>清除全部筛选</button></div>); }
function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} style={selS}>{options.map((o) => <option key={o}>{o}</option>)}</select>; }
function ViewBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} style={{ height: 30, width: 30, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "var(--color-ink)" : "var(--color-muted)", backgroundColor: active ? "var(--color-canvas)" : "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{children}</button>; }
function TxtBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) { return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", ...style }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-ink)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}>{children}</button>; }
function Th2({ children, right }: { children: React.ReactNode; right?: boolean }) { return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>; }
function Td2({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) { return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>; }
function LBtn({ children, onClick }: { children: React.ReactNode; onClick?: (e?: any) => void }) { return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: "var(--radius-xs)" }}>{children}</button>; }
function DSec({ t, children }: { t: string; children: React.ReactNode }) { return <div style={{ marginBottom: "var(--spacing-xl)" }}><h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>{t}</h3>{children}</div>; }
function SpecRow({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) { return (<div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", width: 72, flexShrink: 0 }}>{label}</span>{typeof value === "string" ? <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: valueColor || "var(--color-ink)" }}>{value}</span> : value}</div>); }

const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
