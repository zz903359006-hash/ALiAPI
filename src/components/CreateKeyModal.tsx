"use client";

import { useState, useEffect } from "react";
import Tabs from "@/components/layout/Tabs";
import type { TabItem } from "@/components/layout/Tabs";

export default function CreateKeyModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (name: string, key: string) => void }) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [name, setName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [codeTab, setCodeTab] = useState("curl");

  useEffect(() => {
    if (open) {
      setStep("form");
      setName("");
      setGeneratedKey("sk-ali-" + Array.from({ length: 32 }, () => "abcdef0123456789"[Math.floor(Math.random() * 16)]).join(""));
      setCopiedKey(false);
      setCodeTab("curl");
    }
  }, [open]);

  if (!open) return null;
  const displayName = name.trim() || "Default Key";

  const modelId = "gpt-4o-mini";

  const curl = `curl https://api.limAPI.dev/v1/chat/completions \\\n  -H "Authorization: Bearer ${generatedKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "${modelId}",\n    "messages": [{"role": "user", "content": "Hello"}]\n  }'`;
  const python = `import openai\n\nclient = openai.OpenAI(\n    base_url="https://api.limAPI.dev/v1",\n    api_key="${generatedKey}"\n)\n\nresponse = client.chat.completions.create(\n    model="${modelId}",\n    messages=[{"role": "user", "content": "Hello"}]\n)\nprint(response.choices[0].message.content)`;
  const node = `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://api.limAPI.dev/v1",\n  apiKey: "${generatedKey}",\n});\n\nconst response = await client.chat.completions.create({\n  model: "${modelId}",\n  messages: [{ role: "user", content: "Hello" }],\n});\n\nconsole.log(response.choices[0].message.content);`;

  const codeTabs: TabItem[] = [
    { key: "curl", label: "cURL", content: <CodeBox code={curl} /> },
    { key: "python", label: "Python", content: <CodeBox code={python} /> },
    { key: "node", label: "Node.js", content: <CodeBox code={node} /> },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[70]" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed inset-0 z-[70]" style={{ display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto", width: 520, maxWidth: "calc(100vw - 32px)", maxHeight: "90vh", backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
            <h2 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: 0, fontFamily: "var(--font-display)" }}>
              {step === "form" ? "创建 Key" : "Key 创建成功"}
            </h2>
            <button onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4L12 12M12 4L4 12" /></svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
            {step === "form" ? (
              <div>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", margin: "0 0 var(--spacing-lg)" }}>
                  创建后系统将自动绑定性价比优先策略与不限流配置，无需额外设置。
                </p>
                <label style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", display: "block", marginBottom: "var(--spacing-xs)" }}>Key 名称 (选填)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Default Key"
                  style={{ width: "100%", height: 40, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-hairline)"; }}
                  autoFocus
                />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
                {/* Success + warning */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "var(--color-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{displayName} 创建成功</span>
                </div>
                <div style={{ padding: "var(--spacing-sm)", backgroundColor: "#FFFBEB", borderRadius: "var(--radius-md)", display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-warning)", fontWeight: 500 }}>请立即复制并妥善保管，关闭后将无法再次查看完整密钥。</span>
                </div>

                {/* Key display */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-sm) var(--spacing-md)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-md)" }}>
                  <code style={{ flex: 1, fontSize: "var(--text-body-sm)", fontFamily: "var(--font-mono)", color: "var(--color-ink)", wordBreak: "break-all" }}>{generatedKey}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(generatedKey); setCopiedKey(true); }}
                    style={{ height: 32, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: copiedKey ? "var(--color-success)" : "var(--color-muted)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    {copiedKey ? "已复制" : "复制"}
                  </button>
                </div>

                {/* Code tabs */}
                <div>
                  <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-sm)" }}>快速开始 — 复制以下代码即可调用</div>
                  <Tabs tabs={codeTabs} activeKey={codeTab} onChange={setCodeTab} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", padding: "var(--spacing-md) var(--spacing-lg)", borderTop: "1px solid var(--color-hairline-soft)" }}>
            {step === "form" ? (
              <>
                <button onClick={onClose} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>取消</button>
                <button onClick={() => setStep("done")} style={{ height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>生成 Key</button>
              </>
            ) : (
              <button onClick={() => onSuccess(displayName, generatedKey)} style={{ height: 36, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>我已保存，进入控制台</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative", backgroundColor: "#1e1e1e", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ position: "absolute", top: 8, right: 8, zIndex: 1, height: 30, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: copied ? "#10b981" : "#a1a1aa", backgroundColor: "rgba(255,255,255,0.08)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>{copied ? "已复制" : "复制"}</button>
      <pre style={{ margin: 0, padding: "var(--spacing-md)", overflow: "auto", fontSize: 13, lineHeight: 1.6, fontFamily: "var(--font-mono)", color: "#d4d4d4", whiteSpace: "pre-wrap" }}>{code}</pre>
    </div>
  );
}
