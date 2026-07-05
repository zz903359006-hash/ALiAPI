"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const MOCK_HISTORY = [
  { id: "h1", title: "测试 GPT-4 代码能力", time: "5 分钟前" },
  { id: "h2", title: "Qwen 数据分析", time: "1 小时前" },
  { id: "h3", title: "Claude 长文本总结", time: "昨天" },
];

const MOCK_MODELS = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", providerColor: "#10A37F", inputPrice: "¥0.035", outputPrice: "¥0.105", ctxLen: "128K", maxOutput: "16K", description: "OpenAI 最新多模态旗舰模型，支持文本、图像、音频输入输出。" },
  { id: "claude-3.5", label: "Claude 3.5 Sonnet", provider: "Anthropic", providerColor: "#D4A574", inputPrice: "¥0.042", outputPrice: "¥0.126", ctxLen: "200K", maxOutput: "8K", description: "Anthropic 的高性能模型，擅长长文本理解、代码生成和复杂推理。" },
  { id: "qwen-max", label: "通义千问 Max", provider: "阿里云", providerColor: "#FF6A00", inputPrice: "¥0.028", outputPrice: "¥0.084", ctxLen: "32K", maxOutput: "8K", description: "阿里云通义系列最强模型，中文能力领先，性价比极高。" },
  { id: "deepseek-v3", label: "DeepSeek V3", nameId: "deepseek-v3-0324", provider: "DeepSeek", providerColor: "#4F46E5", inputPrice: "¥0.005", outputPrice: "¥0.015", ctxLen: "64K", maxOutput: "8K", description: "DeepSeek 最新旗舰模型，极低价格，优秀的中文和代码能力。" },
];

function mockStreamResponse(modelName: string, prompt: string): string {
  const seeds = [
    `当前您正在测试 ${modelName}，回复内容仅供参考。\n\n针对您的提问，以下是分析结果：\n\n1. **核心结论**：根据输入内容，可以归纳出以下几个关键点。\n\n2. **详细分析**：\n   - 首先，需要理解问题的上下文和背景。\n   - 其次，模型会从训练数据中检索相关知识。\n   - 最后，综合推理生成最合理的回答。\n\n3. **建议**：如果需要更精确的结果，建议提供更多上下文或调整参数设置。\n\n\`\`\`python\n# 示例代码\nprint("Hello from ${modelName} via AliAPI")\n\`\`\`\n\n这是一段模拟流式输出，实际部署时将通过 SSE 推送真实响应。`,
    `当前您正在测试 ${modelName}，回复内容仅供参考。\n\n根据您的提问，回复如下：\n\n> 这是一个引用的示例格式。\n\n**主要回答：**\n\n在这里展示模型生成的主要内容。您可以继续追问以获取更详细的解答。\n\n| 维度 | 值 |\n|------|-----|\n| 相关性 | 高 |\n| 准确性 | 优 |\n| 完整性 | 中 |\n\n更多详情请继续对话。`,
    `当前您正在测试 ${modelName}，回复内容仅供参考。\n\n好的，我来回答这个问题。\n\n---\n\n**第一步：理解问题**\n首先分析用户输入的意图和关键信息。\n\n**第二步：知识检索**\n在训练数据中查找相关知识点。\n\n**第三步：生成回复**\n\`\`\`\n综合考虑以上分析，得出以下结论。\n\`\`\`\n\n---\n\n*以上内容由 ${modelName} 生成，仅供参考。*`,
  ];
  return seeds[Math.floor(prompt.length) % seeds.length];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function PlaygroundPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState("h1");
  const [selectedModel, setSelectedModel] = useState("deepseek-v3");
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("model");
    if (m) setSelectedModel(m);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setPopoverOpen(false);
    }
  }, []);

  useEffect(() => {
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [popoverOpen, handleClickOutside]);

  const model = MOCK_MODELS.find((m) => m.id === selectedModel);
  const canSend = selectedModel && prompt.trim() && !sending;

  const sendMessage = () => {
    if (!canSend) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: prompt.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setSending(true);

    const aiId = `a-${Date.now()}`;
    const fullResponse = mockStreamResponse(model?.label || "DeepSeek", userMsg.content);
    const aiMsg: ChatMessage = { id: aiId, role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, aiMsg]);
    if (activeId === "h1") setActiveId("");

    let idx = 0;
    const interval = setInterval(() => {
      idx += 4;
      if (idx >= fullResponse.length) {
        clearInterval(interval);
        setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: fullResponse, streaming: false } : m));
        setSending(false);
        return;
      }
      setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: fullResponse.slice(0, idx) } : m));
    }, 30);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSend) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex" style={{ height: "calc(100vh - 64px)", backgroundColor: "var(--color-canvas)" }}>
      {/* Left: History sidebar */}
      {sidebarOpen && (
        <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid var(--color-hairline)", display: "flex", flexDirection: "column", backgroundColor: "var(--color-canvas)" }}>
          <div style={{ padding: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline-soft)", display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            <button onClick={() => { setMessages([]); setActiveId(""); }} style={{ flex: 1, height: 36, padding: "0 var(--spacing-md)", fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              新建对话
            </button>
            <button onClick={() => setSidebarOpen(false)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-xs)" }}>
            {MOCK_HISTORY.map((item) => {
              const active = item.id === activeId;
              return (
                <button key={item.id} onClick={() => setActiveId(item.id)} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, padding: "10px var(--spacing-sm)", backgroundColor: active ? "var(--color-surface-card)" : "transparent", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => { if (active) return; e.currentTarget.style.backgroundColor = "var(--color-surface-soft)"; }}
                  onMouseLeave={(e) => { if (active) return; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{item.time}</span>
                </button>
              );
            })}
          </div>
          <div style={{ padding: "var(--spacing-sm) var(--spacing-md)", borderTop: "1px solid var(--color-hairline-soft)", fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>共 {MOCK_HISTORY.length} 条对话记录</div>
        </div>
      )}

      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", flexShrink: 0, marginTop: "var(--spacing-md)", marginLeft: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      {/* Right: Main chat area */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        {/* Top control bar */}
        <div style={{ height: 56, flexShrink: 0, borderBottom: "1px solid var(--color-hairline-soft)", display: "flex", alignItems: "center", padding: "0 var(--spacing-lg)", gap: "var(--spacing-sm)" }}>
          <select value={selectedModel} onChange={(e) => { setSelectedModel(e.target.value); setMessages([]); }}
            style={{ height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", minWidth: 180 }}>
            {MOCK_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <div className="flex-1" />
          <div ref={popoverRef} style={{ position: "relative" }}>
            <button onClick={() => setPopoverOpen(!popoverOpen)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", borderRadius: "var(--radius-md)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-card)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
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

        {/* Middle: chat area */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
          {messages.length === 0 && model ? (
            /* Empty state: model info card */
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
              <div style={{ width: 400, maxWidth: "100%" }}>
                <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)" }}>
                    <span style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", backgroundColor: model.providerColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{model.provider.charAt(0)}</span>
                    <div>
                      <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{model.label}</div>
                      <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>{model.provider}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", lineHeight: 1.6, margin: "0 0 var(--spacing-md)" }}>{model.description}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-sm)", padding: "var(--spacing-sm) 0", borderTop: "1px solid var(--color-hairline-soft)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
                    <div><div style={{ fontSize: 10, color: "var(--color-muted)", marginBottom: 1 }}>输入价格</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-success)" }}>{model.inputPrice}</div><div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>上下文</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)" }}>{model.ctxLen}</div></div>
                    <div><div style={{ fontSize: 10, color: "var(--color-muted)", marginBottom: 1 }}>输出价格</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-success)" }}>{model.outputPrice}</div><div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>最大输出</div><div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)" }}>{model.maxOutput}</div></div>
                  </div>
                  <div style={{ marginTop: "var(--spacing-md)", fontSize: "var(--text-caption)", color: "var(--color-muted)", textAlign: "center" }}>在下方输入框开始对话测试</div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat bubbles */
            <div style={{ display: "flex", flexDirection: "column" }}>
              {messages.map((msg) => (
                msg.role === "user" ? (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", padding: "0 var(--spacing-lg)" }}>
                    <div style={{ maxWidth: "60%", width: "fit-content", padding: "var(--spacing-sm) var(--spacing-md)", backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-md) var(--radius-md) 0 var(--radius-md)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
                    <div style={{ fontSize: "var(--text-body-sm)", lineHeight: 1.8, color: "var(--color-ink)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {msg.content.split("```").map((part, i) => i % 2 === 1 ? (
                          <pre key={i} style={{ margin: 0, padding: "var(--spacing-sm)", backgroundColor: "#1e1e1e", color: "#d4d4d4", borderRadius: "var(--radius-sm)", fontSize: 12.5, fontFamily: "var(--font-mono)", overflow: "auto", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{part}</pre>
                        ) : (
                          <span key={i}>{part}</span>
                        ))}
                        {msg.streaming && <span style={{ display: "inline-block", width: 7, height: 14, backgroundColor: "var(--color-success)", animation: "pulse 1s infinite", verticalAlign: "text-bottom" }} />}
                      </div>
                    </div>
                  </div>
                )
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Bottom input area — fixed at bottom */}
        <div style={{ flexShrink: 0, borderTop: "1px solid var(--color-hairline-soft)", padding: "var(--spacing-md) var(--spacing-lg)", backgroundColor: "var(--color-canvas)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--spacing-sm)", backgroundColor: "var(--color-canvas)", border: "1.5px solid var(--color-hairline)", borderRadius: 16, padding: "8px 8px 8px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "border-color 0.15s, box-shadow 0.15s" }}
              onMouseEnter={(e) => { if (!sending) { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}}
              onMouseLeave={(e) => { if (!sending) { e.currentTarget.style.borderColor = "var(--color-hairline)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}}
            >
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="开始新的对话... (Shift + Enter 换行)" rows={1}
                style={{ flex: 1, minHeight: 24, maxHeight: 144, padding: "8px 0", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }}
                onInput={(e) => { e.currentTarget.style.height = "auto"; e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 144) + "px"; }}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button onClick={sendMessage} disabled={!canSend} style={{ height: 36, width: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 10, cursor: canSend ? "pointer" : "not-allowed", flexShrink: 0, color: canSend ? "var(--color-on-primary)" : "#9CA3AF", backgroundColor: canSend ? "var(--color-primary)" : "var(--color-surface-card)", transition: "all 0.15s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
