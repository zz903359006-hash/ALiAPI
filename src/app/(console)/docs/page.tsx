"use client";

import { useState, useEffect } from "react";
import { getRouteTitle } from "@/config/titles";

interface DocNode {
  key: string;
  label: string;
  children?: DocNode[];
  slug?: string;
}

const DOC_TREE: DocNode[] = [
  { key: "quickstart", label: "快速开始", children: [
    { key: "auth", label: "鉴权说明", slug: "auth" },
    { key: "openai-compat", label: "兼容 OpenAI 接口调用", slug: "openai-compat" },
  ]},
  { key: "routing", label: "Auto 路由", children: [
    { key: "cost-priority", label: "性价比优先配置", slug: "cost-priority" },
  ]},
  { key: "models", label: "模型说明", slug: "models" },
  { key: "errors", label: "错误码对照表", slug: "errors" },
  { key: "faq", label: "常见问题 FAQ", slug: "faq" },
];

const DOC_CONTENT: Record<string, { title: string; breadcrumb: string; body: React.ReactNode }> = {
  "quickstart": {
    title: "快速开始",
    breadcrumb: "首页 / 快速开始",
    body: (
      <div>
        <p style={{ marginBottom: "var(--spacing-lg)", lineHeight: 1.8 }}>
          欢迎使用 ALiAPI 网关平台。本指南将帮助您在 5 分钟内完成首次 API 调用。
        </p>
        <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)", fontFamily: "var(--font-display)" }}>前置条件</h3>
        <ul style={{ marginBottom: "var(--spacing-lg)", paddingLeft: 20, fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 2 }}>
          <li>已注册 ALiAPI 账户</li>
          <li>账户余额大于 0</li>
          <li>已创建有效的调用 Key</li>
        </ul>
      </div>
    ),
  },
  "auth": {
    title: "鉴权说明",
    breadcrumb: "首页 / 快速开始 / 鉴权说明",
    body: (
      <div>
        <p style={{ marginBottom: "var(--spacing-lg)", lineHeight: 1.8 }}>
          ALiAPI 使用 API Key 进行身份鉴权。所有请求必须在 HTTP Header 中携带有效的 API Key。
        </p>
        <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)", fontFamily: "var(--font-display)" }}>请求头格式</h3>
        <CodeBlock code={`Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
        <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", margin: "var(--spacing-lg) 0 var(--spacing-sm)", fontFamily: "var(--font-display)" }}>Python 示例</h3>
        <CodeBlock code={`import openai\n\nclient = openai.OpenAI(\n    api_key="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",\n    base_url="https://api.aliapi.dev/v1"\n)\n\nresponse = client.chat.completions.create(\n    model="deepseek-v3",\n    messages=[{"role": "user", "content": "Hello"}]\n)\nprint(response.choices[0].message.content)`} />
      </div>
    ),
  },
  "openai-compat": {
    title: "兼容 OpenAI 接口调用",
    breadcrumb: "首页 / 快速开始 / 兼容 OpenAI 接口调用",
    body: (
      <div>
        <p style={{ marginBottom: "var(--spacing-lg)", lineHeight: 1.8 }}>
          ALiAPI 提供完全兼容 OpenAI SDK 的接口，您只需修改 base_url 即可无缝切换。
        </p>
        <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)", fontFamily: "var(--font-display)" }}>支持的端点</h3>
        <DocTable
          headers={["端点", "方法", "说明"]}
          rows={[
            ["/v1/chat/completions", "POST", "对话补全"],
            ["/v1/embeddings", "POST", "向量嵌入"],
            ["/v1/models", "GET", "模型列表"],
          ]}
        />
      </div>
    ),
  },
  "cost-priority": {
    title: "性价比优先配置",
    breadcrumb: "首页 / Auto 路由 / 性价比优先配置",
    body: (
      <div>
        <p style={{ marginBottom: "var(--spacing-lg)", lineHeight: 1.8 }}>
          Auto 路由功能可根据您配置的策略自动选择最优模型。性价比优先策略将优先选择单位成本下效果最好的模型。
        </p>
        <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)", fontFamily: "var(--font-display)" }}>配置参数</h3>
        <DocTable
          headers={["参数", "类型", "默认值", "说明"]}
          rows={[
            ["strategy", "string", "cost-first", "路由策略：cost-first / latency-first / fixed"],
            ["max_retries", "int", "3", "失败重试次数"],
            ["timeout", "int", "30", "超时时间（秒）"],
          ]}
        />
      </div>
    ),
  },
  "models": {
    title: "模型说明",
    breadcrumb: "首页 / 模型说明",
    body: (
      <div>
        <p style={{ marginBottom: "var(--spacing-lg)", lineHeight: 1.8 }}>
          ALiAPI 平台聚合了多种主流大语言模型，以下是当前支持的模型列表。
        </p>
        <DocTable
          headers={["模型名称", "提供商", "输入价格", "输出价格", "上下文"]}
          rows={[
            ["DeepSeek V3", "DeepSeek", "¥ 2/M tokens", "¥ 8/M tokens", "128K"],
            ["通义千问 Max", "阿里云", "¥ 4/M tokens", "¥ 12/M tokens", "32K"],
            ["GPT-4o", "OpenAI", "¥ 10/M tokens", "¥ 30/M tokens", "128K"],
            ["Claude 3.5 Sonnet", "Anthropic", "¥ 8/M tokens", "¥ 24/M tokens", "200K"],
          ]}
        />
      </div>
    ),
  },
  "errors": {
    title: "错误码对照表",
    breadcrumb: "首页 / 错误码对照表",
    body: (
      <div>
        <p style={{ marginBottom: "var(--spacing-lg)", lineHeight: 1.8 }}>
          调用 ALiAPI 接口时可能返回以下错误码，请根据对应说明进行排查。
        </p>
        <DocTable
          headers={["错误码", "HTTP 状态", "说明", "处理建议"]}
          rows={[
            ["401", "Unauthorized", "API Key 无效或已过期", "检查请求头 Authorization 是否正确"],
            ["402", "Payment Required", "账户余额不足", "前往计费中心充值"],
            ["429", "Too Many Requests", "请求频率超限", "降低调用频率或升级套餐"],
            ["500", "Internal Error", "模型服务内部错误", "稍后重试，如持续失败请联系客服"],
            ["503", "Service Unavailable", "模型服务暂不可用", "检查模型状态页，选择备用模型"],
          ]}
        />
      </div>
    ),
  },
  "faq": {
    title: "常见问题 FAQ",
    breadcrumb: "首页 / 常见问题 FAQ",
    body: (
      <div>
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)", fontFamily: "var(--font-display)" }}>如何获取 API Key？</h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.8 }}>登录控制台后，在「调用 Key 管理」页面创建新的 API Key，支持设置路由策略和风控限额。</p>
        </div>
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)", fontFamily: "var(--font-display)" }}>余额不足怎么办？</h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.8 }}>前往「计费中心」进行充值，支持多种支付方式。充值后额度立即生效。</p>
        </div>
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)", fontFamily: "var(--font-display)" }}>如何选择模型？</h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.8 }}>可在「模型广场」浏览所有可用模型及其定价。您也可以在创建 API Key 时配置 Auto 路由策略，系统会根据策略自动选择最优模型。</p>
        </div>
      </div>
    ),
  },
};

export default function DocsPage() {
  const [currentSlug, setCurrentSlug] = useState("auth");
  const [search, setSearch] = useState("");

  const doc = DOC_CONTENT[currentSlug] || DOC_CONTENT["auth"];
  const title = "开发者文档";

  const filterTree = (nodes: DocNode[], query: string): DocNode[] => {
    return nodes.reduce<DocNode[]>((acc, node) => {
      const match = node.label.includes(query);
      const filteredChildren = node.children ? filterTree(node.children, query) : undefined;
      if (match || (filteredChildren && filteredChildren.length > 0)) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filtered = search ? filterTree(DOC_TREE, search) : DOC_TREE;

  const findExpandedKeys = (nodes: DocNode[], target: string): Set<string> => {
    const keys = new Set<string>();
    const walk = (ns: DocNode[], parents: string[]) => {
      for (const n of ns) {
        if (n.slug === target || n.children?.some((c) => c.slug === target)) {
          parents.forEach((p) => keys.add(p));
        }
        if (n.children) walk(n.children, [...parents, n.key]);
      }
    };
    walk(nodes, []);
    return keys;
  };

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 64px)", backgroundColor: "var(--color-canvas)" }}>
      {/* Left: Sidebar */}
      <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid var(--color-hairline)", display: "flex", flexDirection: "column", backgroundColor: "var(--color-surface-soft)" }}>
        {/* Search */}
        <div style={{ padding: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div style={{ display: "flex", alignItems: "center", height: 36, padding: "0 var(--spacing-sm)", gap: "var(--spacing-xs)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-muted)", flexShrink: 0 }}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索文档..."
              style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: "var(--text-body-sm)", color: "var(--color-ink)" }}
            />
          </div>
        </div>

        {/* Tree */}
        <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-sm)" }}>
          <DocTree
            nodes={filtered}
            currentSlug={currentSlug}
            onSelect={(slug) => setCurrentSlug(slug)}
            expandedKeys={findExpandedKeys(DOC_TREE, currentSlug)}
            depth={0}
          />
        </div>
      </div>

      {/* Right: Content */}
      <div style={{ flex: 1, minWidth: 0, padding: "var(--spacing-xl)", maxWidth: 860, overflow: "auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginBottom: "var(--spacing-lg)" }}>
          {doc.breadcrumb}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "var(--spacing-xl)", letterSpacing: "-0.5px" }}>
          {doc.title}
        </h2>

        {/* Body */}
        <div>{doc.body}</div>
      </div>
    </div>
  );
}

function DocTree({ nodes, currentSlug, onSelect, expandedKeys, depth }: {
  nodes: DocNode[]; currentSlug: string; onSelect: (slug: string) => void; expandedKeys: Set<string>; depth: number;
}) {
  const [localExpanded, setLocalExpanded] = useState<Set<string>>(new Set(expandedKeys));

  useEffect(() => {
    setLocalExpanded((prev) => {
      const next = new Set(prev);
      expandedKeys.forEach((k) => next.add(k));
      return next;
    });
  }, [expandedKeys]);

  return (
    <div>
      {nodes.map((node) => {
        const hasKids = node.children && node.children.length > 0;
        const isExpanded = localExpanded.has(node.key);
        const isActive = node.slug === currentSlug;

        const toggle = () => {
          if (hasKids) {
            setLocalExpanded((prev) => {
              const next = new Set(prev);
              if (next.has(node.key)) next.delete(node.key); else next.add(node.key);
              return next;
            });
          }
        };

        return (
          <div key={node.key}>
            <div
              onClick={() => { if (node.slug) onSelect(node.slug); toggle(); }}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 8px", paddingLeft: 8 + depth * 16,
                borderRadius: "var(--radius-sm)", cursor: "pointer",
                backgroundColor: isActive ? "var(--color-surface-card)" : "transparent",
                color: isActive ? "var(--color-ink)" : "var(--color-body)",
                fontSize: "var(--text-body-sm)", fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--color-surface-soft)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {hasKids ? (
                <span style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                    <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </span>
              ) : (
                <span style={{ width: 14, flexShrink: 0 }} />
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</span>
            </div>
            {hasKids && isExpanded && (
              <DocTree nodes={node.children!} currentSlug={currentSlug} onSelect={onSelect} expandedKeys={expandedKeys} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "var(--spacing-lg)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--color-surface-soft)" }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontWeight: 600, color: "var(--color-ink)", textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--color-hairline)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--color-hairline-soft)" : "none" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "var(--spacing-sm) var(--spacing-md)", color: j === 0 ? "var(--color-ink)" : "var(--color-body)", fontWeight: j === 0 ? 600 : 400, whiteSpace: j === 3 ? "normal" : "nowrap" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ position: "relative", backgroundColor: "#1e1e1e", borderRadius: "var(--radius-lg)", padding: "var(--spacing-md)", marginBottom: "var(--spacing-lg)", overflow: "auto" }}>
      <pre style={{ fontSize: "var(--text-caption)", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#d4d4d4", lineHeight: 1.7, whiteSpace: "pre", margin: 0 }}>
        {code}
      </pre>
      <button
        onClick={handleCopy}
        style={{ position: "absolute", top: 8, right: 8, padding: "4px 10px", fontSize: "11px", fontWeight: 500, color: copied ? "#10B981" : "#a1a1aa", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
      >
        {copied ? "已复制" : "复制"}
      </button>
    </div>
  );
}
