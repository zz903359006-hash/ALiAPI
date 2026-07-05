"use client";

import { useState, useEffect } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";
import type { TabItem } from "@/components/layout/Tabs";

/* ================================================================
   Types
   ================================================================ */
interface FormData {
  name: string;
  purpose: string;
  note: string;
  team: string;
  strategy: string;
  showAdvanced: boolean;
  weightCost: number;
  weightQuality: number;
  weightLatency: number;
  weightStability: number;
  preferredModels: string[];
  blacklistedModels: string[];
  riskTemplate: string;
  qps: number;
  dailyCalls: string;
  dailyTokens: string;
  overLimitAction: string;
}

/* ================================================================
   Constants
   ================================================================ */
const STEPS = ["基本信息", "路由策略", "风控与限额", "完成创建"];

const PURPOSES = ["生产", "测试", "个人探索"];
const TEAMS = ["AI 平台部", "客服中心", "研发部", "数据分析组"];

const STRATEGIES = [
  { id: "balanced", label: "性价比优先", desc: "平衡成本与质量，适合大多数场景", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /> <path d="M12 2v15.77" /></svg> },
  { id: "cost", label: "最低成本优先", desc: "优先选择单价最低的上游供应商", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h6a2 2 0 0 1 0 4H8" /></svg> },
  { id: "quality", label: "最高质量优先", desc: "优先选择 HLE 评分最高的模型", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
  { id: "latency", label: "最低延迟优先", desc: "优先选择响应速度最快的模型", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
];

const RISK_TEMPLATES: Record<string, { label: string; qps: number; calls: string; tokens: string }> = {
  loose: { label: "宽松", qps: 100, calls: "1000000", tokens: "10000000" },
  standard: { label: "标准", qps: 30, calls: "100000", tokens: "1000000" },
  strict: { label: "严格", qps: 5, calls: "10000", tokens: "100000" },
};

const ALL_MODELS = [
  "gpt-4o-2024-08-06", "claude-3-5-sonnet-20240620", "qwen-max-2025",
  "deepseek-v3-0324", "gpt-4o-code", "dalle-3",
];

const defaultForm: FormData = {
  name: "", purpose: "生产", note: "", team: "",
  strategy: "balanced", showAdvanced: false,
  weightCost: 50, weightQuality: 50, weightLatency: 50, weightStability: 50,
  preferredModels: [], blacklistedModels: [],
  riskTemplate: "standard", qps: 30, dailyCalls: "100000", dailyTokens: "1000000",
  overLimitAction: "block",
};

/* ================================================================
   Page
   ================================================================ */
export default function CreateKeyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [preferredModel, setPreferredModel] = useState("");
  const [generatedKey] = useState(() => "sk-" + Array.from({ length: 24 }, () => Math.random().toString(36)[2]).join(""));

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("model");
    if (m) setPreferredModel(m);
  }, []);
  const [copied, setCopied] = useState(false);
  const [codeTab, setCodeTab] = useState("python");

  const update = (patch: Partial<FormData>) => setForm((prev) => ({ ...prev, ...patch }));

  const canNext = (): boolean => {
    if (step === 0) return form.name.trim().length > 0;
    return true;
  };

  const handleNext = () => { if (canNext()) setStep((s) => Math.min(s + 1, 3)); };
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const applyTemplate = (id: string) => {
    const t = RISK_TEMPLATES[id];
    if (!t) return;
    update({ riskTemplate: id, qps: t.qps, dailyCalls: t.calls, dailyTokens: t.tokens });
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeTabs: TabItem[] = [
    {
      key: "python", label: "Python",
      content: <CodeBlock code={`import openai\n\nclient = openai.OpenAI(\n    base_url="https://api.aliapi.dev/v1",\n    api_key="${generatedKey}"\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Hello world"}]\n)\nprint(response.choices[0].message.content)`} />,
    },
    {
      key: "curl", label: "cURL",
      content: <CodeBlock code={`curl https://api.aliapi.dev/v1/chat/completions \\\n  -H "Authorization: Bearer ${generatedKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Hello world"}]\n  }'`} />,
    },
    {
      key: "node", label: "Node.js",
      content: <CodeBlock code={`import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://api.aliapi.dev/v1",\n  apiKey: "${generatedKey}",\n});\n\nconst response = await client.chat.completions.create({\n  model: "gpt-4o",\n  messages: [{ role: "user", content: "Hello world" }],\n});\n\nconsole.log(response.choices[0].message.content);`} />,
    },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Page title */}
      <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-xl)" }}>
        {getRouteTitle("/keys/create")}
      </h1>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: "var(--spacing-xl)", padding: "var(--spacing-xxs)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)", width: "100%" }}>
        {STEPS.map((label, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--spacing-xs)", height: 40, padding: "0 var(--spacing-sm)", backgroundColor: active ? "var(--color-canvas)" : "transparent", borderRadius: "var(--radius-sm)", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, backgroundColor: done ? "var(--color-success)" : active ? "var(--color-primary)" : "var(--color-surface-strong)", color: "#fff" }}>
                {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
              </span>
              <span style={{ fontSize: "var(--text-nav-link)", fontWeight: 500, color: active ? "var(--color-ink)" : done ? "var(--color-muted)" : "var(--color-muted-soft)", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xl)" }}>
        {step === 0 && <Step1 form={form} update={update} />}
        {step === 1 && <Step2 form={form} update={update} preferredModel={preferredModel} />}
        {step === 2 && <Step3 form={form} update={update} applyTemplate={applyTemplate} />}
        {step === 3 && (
          <Step4
            generatedKey={generatedKey}
            copied={copied}
            copyKey={copyKey}
            codeTabs={codeTabs}
            codeTab={codeTab}
            setCodeTab={setCodeTab}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-lg)", paddingTop: "var(--spacing-md)", borderTop: "1px solid var(--color-hairline-soft)" }}>
        <button onClick={() => window.location.href = "/keys"} style={textBtn}>取消</button>
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          {step > 0 && step < 3 && (
            <button onClick={handleBack} style={secondaryBtn}>上一步</button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} disabled={!canNext()} style={{ ...primaryBtn, opacity: canNext() ? 1 : 0.5, cursor: canNext() ? "pointer" : "not-allowed" }}>下一步</button>
          ) : (
            <button onClick={() => window.location.href = "/keys"} style={primaryBtn}>我已保存，关闭并返回列表</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Step 1: 基本信息
   ================================================================ */
function Step1({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      <h2 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>基本信息</h2>
      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: 0 }}>为你的 API Key 设置名称和用途，便于后续管理。</p>

      <FormField label="Key 名称" required>
        <input
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="例：生产环境主 Key"
          style={inputStyle}
        />
      </FormField>

      <FormField label="用途标签">
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          {PURPOSES.map((p) => (
            <PillBtn key={p} active={form.purpose === p} onClick={() => update({ purpose: p })}>{p}</PillBtn>
          ))}
        </div>
      </FormField>

      <FormField label="备注（选填）">
        <textarea
          value={form.note}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="备注信息，方便团队了解此 Key 的用途"
          style={{ ...inputStyle, height: 80, resize: "vertical", fontFamily: "inherit" }}
        />
      </FormField>

      <FormField label="所属团队/项目">
        <select
          value={form.team}
          onChange={(e) => update({ team: e.target.value })}
          style={selectStyle}
        >
          <option value="">不归属</option>
          {TEAMS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </FormField>
    </div>
  );
}

/* ================================================================
   Step 2: 路由策略
   ================================================================ */
function Step2({ form, update, preferredModel }: { form: FormData; update: (p: Partial<FormData>) => void; preferredModel?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      <h2 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>路由策略</h2>
      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: 0 }}>选择调用时的模型路由策略，控制模型选择的优先级。</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-sm)" }}>
        {STRATEGIES.map((s) => {
          const active = form.strategy === s.id;
          return (
            <div
              key={s.id}
              onClick={() => update({ strategy: s.id })}
              style={{
                padding: "var(--spacing-md)", borderRadius: "var(--radius-md)", cursor: "pointer",
                backgroundColor: active ? "var(--color-surface-soft)" : "var(--color-canvas)",
                border: active ? "2px solid var(--color-primary)" : "1px solid var(--color-hairline)",
                transition: "all 0.15s",
              }}
            >
              <div style={{ marginBottom: "var(--spacing-xs)" }}>{s.icon}</div>
              <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{s.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Advanced: custom weights */}
      <div>
        <button
          onClick={() => update({ showAdvanced: !form.showAdvanced })}
          style={{ ...textBtn, display: "flex", alignItems: "center", gap: "var(--spacing-xs)", fontSize: "var(--text-body-sm)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", transition: "transform 0.15s", transform: form.showAdvanced ? "rotate(90deg)" : "rotate(0deg)" }}><polyline points="9 18 15 12 9 6" /></svg>
          自定义（高级权重调整）
        </button>
        {form.showAdvanced && (
          <div style={{ marginTop: "var(--spacing-md)", display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <WeightSlider label="成本权重" value={form.weightCost} onChange={(v) => update({ weightCost: v })} />
            <WeightSlider label="质量权重" value={form.weightQuality} onChange={(v) => update({ weightQuality: v })} />
            <WeightSlider label="延迟权重" value={form.weightLatency} onChange={(v) => update({ weightLatency: v })} />
            <WeightSlider label="稳定性权重" value={form.weightStability} onChange={(v) => update({ weightStability: v })} />
          </div>
        )}
      </div>

      {/* Model black/whitelist — placeholder */}
      <div>
        <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-sm)" }}>模型黑白名单（可选）</div>
        {preferredModel && (
          <div style={{ marginBottom: "var(--spacing-sm)", padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)", fontSize: "var(--text-caption)", color: "var(--color-body)" }}>
            已从模型广场选择模型：<code style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-ink)" }}>{preferredModel}</code>
          </div>
        )}
        <select multiple style={{ ...selectStyle, height: 100, paddingTop: 4 }}>
          {ALL_MODELS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ================================================================
   Step 3: 风控与限额
   ================================================================ */
function Step3({ form, update, applyTemplate }: { form: FormData; update: (p: Partial<FormData>) => void; applyTemplate: (id: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      <h2 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>风控与限额</h2>
      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: 0 }}>设置调用频率和额度限制，防止异常消耗。</p>

      {/* Template pills */}
      <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
        {Object.entries(RISK_TEMPLATES).map(([id, t]) => (
          <PillBtn key={id} active={form.riskTemplate === id} onClick={() => applyTemplate(id)}>{t.label}</PillBtn>
        ))}
      </div>

      <FormField label="QPS 上限（每秒请求数）" required>
        <input
          type="number"
          min={1}
          value={form.qps}
          onChange={(e) => update({ qps: parseInt(e.target.value) || 0 })}
          style={inputStyle}
        />
      </FormField>

      <FormField label="日调用量上限">
        <input
          type="number"
          min={0}
          value={form.dailyCalls}
          onChange={(e) => update({ dailyCalls: e.target.value })}
          placeholder="无限制"
          style={inputStyle}
        />
      </FormField>

      <FormField label="日 Token 消耗上限">
        <input
          type="number"
          min={0}
          value={form.dailyTokens}
          onChange={(e) => update({ dailyTokens: e.target.value })}
          placeholder="无限制"
          style={inputStyle}
        />
      </FormField>

      <FormField label="超额行为">
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <PillBtn active={form.overLimitAction === "block"} onClick={() => update({ overLimitAction: "block" })}>仅拦截</PillBtn>
          <PillBtn active={form.overLimitAction === "notify"} onClick={() => update({ overLimitAction: "notify" })}>拦截 + 发送系统通知</PillBtn>
        </div>
      </FormField>
    </div>
  );
}

/* ================================================================
   Step 4: 完成
   ================================================================ */
function Step4({
  generatedKey, copied, copyKey, codeTabs, codeTab, setCodeTab,
}: {
  generatedKey: string; copied: boolean; copyKey: () => void;
  codeTabs: TabItem[]; codeTab: string; setCodeTab: (k: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      {/* Success header */}
      <div style={{ textAlign: "center", padding: "var(--spacing-lg) 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--color-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--spacing-md)" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>
        <h2 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 var(--spacing-xs)" }}>Key 创建成功</h2>
        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-warning)", margin: 0, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> 请立即复制保存，此 Key 仅展示一次，关闭后将不再显示完整 Key。</p>
      </div>

      {/* Key display */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", padding: "var(--spacing-sm) var(--spacing-md)" }}>
        <code style={{ flex: 1, fontSize: "var(--text-body-sm)", fontFamily: "var(--font-mono)", color: "var(--color-ink)", padding: "6px 0", overflow: "hidden", textOverflow: "ellipsis" }}>{generatedKey}</code>
        <button
          onClick={copyKey}
          style={{ height: 34, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: copied ? "var(--color-success)" : "var(--color-ink)", backgroundColor: copied ? "rgba(16,185,129,0.1)" : "var(--color-surface-card)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>

      {/* Code samples */}
      <div>
        <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)" }}>快速开始 — 示例代码</h3>
        <Tabs tabs={codeTabs} activeKey={codeTab} onChange={setCodeTab} />
      </div>
    </div>
  );
}

/* ================================================================
   Shared sub-components
   ================================================================ */
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>
        {label}{required && <span style={{ color: "var(--color-error)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-sm)", fontWeight: 500,
        color: active ? "var(--color-ink)" : "var(--color-muted)",
        backgroundColor: active ? "var(--color-canvas)" : "var(--color-surface-card)",
        border: active ? "1px solid var(--color-hairline)" : "1px solid transparent",
        borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>{label}</span>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: "var(--color-surface-card)", accentColor: "var(--color-primary)", cursor: "pointer" }}
      />
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "relative", backgroundColor: "#1e1e1e", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <button
        onClick={copy}
        style={{ position: "absolute", top: 8, right: 8, height: 30, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: copied ? "#10b981" : "#a1a1aa", backgroundColor: "rgba(255,255,255,0.08)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", zIndex: 1 }}
      >
        {copied ? "已复制" : "复制"}
      </button>
      <pre style={{ margin: 0, padding: "var(--spacing-md)", overflow: "auto", fontSize: 13, lineHeight: 1.6, fontFamily: "var(--font-mono)", color: "#d4d4d4" }}>{code}</pre>
    </div>
  );
}

/* ================================================================
   Style constants
   ================================================================ */
const inputStyle: React.CSSProperties = {
  height: 40, padding: "0 var(--spacing-sm)", width: "100%",
  fontSize: "var(--text-body-sm)", color: "var(--color-ink)",
  backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)", outline: "none", boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  height: 40, padding: "0 var(--spacing-sm)", width: "100%",
  fontSize: "var(--text-body-sm)", color: "var(--color-body)",
  backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)", outline: "none", boxSizing: "border-box",
  appearance: "none", cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 32,
};

const primaryBtn: React.CSSProperties = {
  height: 40, padding: "0 var(--spacing-lg)",
  fontSize: "var(--text-button)", fontWeight: 600,
  color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)",
  border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  height: 40, padding: "0 var(--spacing-lg)",
  fontSize: "var(--text-button)", fontWeight: 600,
  color: "var(--color-ink)", backgroundColor: "var(--color-canvas)",
  border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)",
  cursor: "pointer",
};

const textBtn: React.CSSProperties = {
  height: 40, padding: "0 var(--spacing-sm)",
  fontSize: "var(--text-button)", fontWeight: 500,
  color: "var(--color-muted)", backgroundColor: "transparent",
  border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
};
