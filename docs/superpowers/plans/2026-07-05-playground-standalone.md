# Playground Standalone Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Playground component from models page and create a full-screen standalone testing page at `/playground?model=xxx`

**Architecture:** Extract existing Playground function to shared component; create new route page that reads model from query and renders model info header + Playground; add entry button in model Drawer.

**Tech Stack:** Next.js App Router, inline styles, existing Tabs/CodeSnippet components

## Global Constraints

- Do NOT modify Playground component's internal behavior (streaming, params, toast)
- Playground component interface must remain identical
- Sidebar nav config stays unchanged
- Employee role checks already in place via `@/lib/role`

---

### Task 1: Extract Playground to shared component

**Files:**
- Create: `src/components/Playground.tsx`
- Modify: `src/app/(console)/models/page.tsx` (remove inline Playground, add import)

**Interfaces:**
- Consumes: existing Playground function body from models/page.tsx:511-563
- Produces: `<Playground modelName apiKeyId setApiKeyId prompt setPrompt ... />`

- [ ] **Step 1: Create Playground.tsx**

Copy the entire `Playground` function (including `useRef`, `useEffect`, and all logic) from `models/page.tsx` into a new file `src/components/Playground.tsx`. Export it as default. The function signature and all props remain identical.

```typescript
"use client";

import { useState, useEffect, useRef } from "react";

const MOCK_KEYS = [
  { id: "k1", name: "生产环境 Key", key: "sk-prod-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6", masked: "sk-prod-****...z6" },
  { id: "k2", name: "测试环境 Key", key: "sk-test-m9n8o7p6q5r4s3t2u1v0w9x8y7z6a5b4c3d2e1f0g1h2i3j4k5l6m7", masked: "sk-test-****...m7" },
  { id: "k3", name: "开发调试", key: "sk-dev-q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0x1c2v3b4n5m6", masked: "sk-dev-****...m6" },
];

export default function Playground({ modelName, apiKeyId, setApiKeyId, prompt, setPrompt, response, setResponse, streaming, setStreaming, temperature, setTemperature, maxTokens, setMaxTokens, popoverOpen, setPopoverOpen, stats, setStats, showToast }: {
  modelName: string;
  apiKeyId: string; setApiKeyId: (v: string) => void;
  prompt: string; setPrompt: (v: string) => void;
  response: string; setResponse: (v: string) => void;
  streaming: boolean; setStreaming: (v: boolean) => void;
  temperature: number; setTemperature: (v: number) => void;
  maxTokens: number; setMaxTokens: (v: number) => void;
  popoverOpen: boolean; setPopoverOpen: (v: boolean) => void;
  stats: { latency: string; tokens: number; cost: string } | null; setStats: (v: { latency: string; tokens: number; cost: string } | null) => void;
  showToast: (m: string) => void;
}) {
  // ... exact same body as models/page.tsx's Playground function (lines 511-563)
}
```

Paste the full function body from models/page.tsx lines 511-563. Keep `MOCK_KEYS` array above the component (same as in models page).

- [ ] **Step 2: Update models/page.tsx**

Replace the inline `Playground` function with an import:

```typescript
import Playground from "@/components/Playground";
```

Remove the old `function Playground(...)` block (lines 511-563 in the current file).

- [ ] **Step 3: Verify TypeScript**

Run `npx tsc --noEmit` — expect zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Playground.tsx src/app/\(console\)/models/page.tsx
git commit -m "refactor: extract Playground to shared component"
```

---

### Task 2: Create standalone Playground page

**Files:**
- Create: `src/app/(console)/playground/page.tsx`

**Interfaces:**
- Consumes: `Playground` component from Task 1, `ModelItem` from models/page (need to define minimal data fetch)
- Produces: Full-screen testing page at `/playground`

- [ ] **Step 1: Create the page**

```typescript
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Playground from "@/components/Playground";

// Reuse MOCK data from models page (or a minimal subset)
const MOCK_MODELS = [
  { nameId: "gpt-4o-2024-08-06", name: "GPT-4o", inputPrice: "¥0.035", outputPrice: "¥0.105", ctxLen: "128K", provider: "OpenAI" },
  { nameId: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet", inputPrice: "¥0.042", outputPrice: "¥0.126", ctxLen: "200K", provider: "Anthropic" },
  { nameId: "qwen-max-2025", name: "通义千问 Max", inputPrice: "¥0.028", outputPrice: "¥0.084", ctxLen: "32K", provider: "阿里云" },
  { nameId: "deepseek-v3-0324", name: "DeepSeek V3", inputPrice: "¥0.005", outputPrice: "¥0.015", ctxLen: "64K", provider: "DeepSeek" },
  { nameId: "gpt-4o-code", name: "GPT-4o (代码)", inputPrice: "¥0.035", outputPrice: "¥0.105", ctxLen: "128K", provider: "OpenAI" },
  { nameId: "dalle-3", name: "DALL·E 3", inputPrice: "¥0.080", outputPrice: "—", ctxLen: "—", provider: "OpenAI" },
];

export default function PlaygroundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("model") || "";
  const model = MOCK_MODELS.find((m) => m.nameId === modelId);

  // Playground state
  const [pgKeyId, setPgKeyId] = useState("");
  const [pgPrompt, setPgPrompt] = useState("");
  const [pgResponse, setPgResponse] = useState("");
  const [pgStreaming, setPgStreaming] = useState(false);
  const [pgTemperature, setPgTemperature] = useState(0.7);
  const [pgMaxTokens, setPgMaxTokens] = useState(2048);
  const [pgPopoverOpen, setPgPopoverOpen] = useState(false);
  const [pgStats, setPgStats] = useState<{ latency: string; tokens: number; cost: string } | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };

  if (!model) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-muted)" }}>
        <p>未找到模型，请从模型广场选择。</p>
        <button onClick={() => router.push("/models")} style={{ marginTop: 16, height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>前往模型广场</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--spacing-xl)" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Back link + title */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <button onClick={() => router.back()} style={{ height: 32, padding: 0, fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          返回
        </button>
      </div>

      {/* Model info card */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", margin: 0, fontFamily: "var(--font-display)" }}>{model.name}</h1>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: "2px 0 0" }}>{model.provider} · {model.nameId}</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF", backgroundColor: "var(--color-surface-card)", padding: "2px 8px", borderRadius: 4 }}>全屏测试台</span>
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-md)", fontSize: "var(--text-caption)" }}>
          <span style={{ color: "var(--color-muted)" }}>输入 <strong style={{ color: "var(--color-success)", fontWeight: 600 }}>{model.inputPrice}</strong></span>
          <span style={{ color: "var(--color-muted)" }}>输出 <strong style={{ color: "var(--color-success)", fontWeight: 600 }}>{model.outputPrice}</strong></span>
          <span style={{ color: "var(--color-muted)" }}>上下文 <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>{model.ctxLen}</strong></span>
        </div>
      </div>

      {/* Playground */}
      <Playground
        modelName={model.name}
        apiKeyId={pgKeyId}
        setApiKeyId={setPgKeyId}
        prompt={pgPrompt}
        setPrompt={setPgPrompt}
        response={pgResponse}
        setResponse={setPgResponse}
        streaming={pgStreaming}
        setStreaming={setPgStreaming}
        temperature={pgTemperature}
        setTemperature={setPgTemperature}
        maxTokens={pgMaxTokens}
        setMaxTokens={setPgMaxTokens}
        popoverOpen={pgPopoverOpen}
        setPopoverOpen={setPgPopoverOpen}
        stats={pgStats}
        setStats={setPgStats}
        showToast={showToast}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run `npx tsc --noEmit` — expect zero errors.

- [ ] **Step 3: Verify at runtime**

Visit `/playground?model=gpt-4o-2024-08-06` in browser — expect model info card + Playground rendering.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(console\)/playground/page.tsx
git commit -m "feat: create standalone playground page at /playground"
```

---

### Task 3: Add entry button in model Drawer

**Files:**
- Modify: `src/app/(console)/models/page.tsx` (Drawer footer)

**Interfaces:**
- Consumes: `useRouter` from `next/navigation` (already imported)

- [ ] **Step 1: Update Drawer footer for employees**

In the employee bottom bar (around line 428-430), change the "关闭" button to include a "全屏测试" button:

```typescript
{isEmployee ? (
  <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
    <button onClick={() => { onClose(); }} style={{ flex: 1, height: 40, fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>关闭</button>
    <button onClick={() => { onClose(); window.location.href = `/playground?model=${data.nameId}`; }} style={{ flex: 1, height: 40, fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" }}>全屏测试</button>
  </div>
) : (...)}
```

Also add a "全屏测试" button for non-employees in the same footer area (alongside existing buttons).

- [ ] **Step 2: Verify TypeScript**

Run `npx tsc --noEmit` — expect zero errors.

- [ ] **Step 3: Verify at runtime**

Open any model Drawer, click "全屏测试" — expect redirect to `/playground?model=xxx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(console\)/models/page.tsx
git commit -m "feat: add fullscreen test button in model drawer"
```
