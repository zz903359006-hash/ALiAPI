"use client";

const TRUST_ITEMS = [
  "阿里云百炼核心合作伙伴",
  "企业级 SLA 99.9% 可用性",
  "数据隐私保护协议",
];

const FEATURES = [
  {
    id: "unified",
    title: "统一接入与极简商务",
    desc: "一个接口无缝调用全球主流大模型，免去与多家厂商分别签合同。",
    visual: "gateway",
  },
  {
    id: "budget",
    title: "企业级预算管控",
    desc: "按部门分配额度，设置月度预算上限与自动熔断机制，杜绝天价账单。",
    visual: "dashboard",
  },
  {
    id: "security",
    title: "安全与合规审计",
    desc: "调用日志脱敏留存，满足企业财务与数据安全审计。",
    visual: "shield",
  },
];

const AGENT_APPS = [
  { id: "content", initial: "内", name: "智能内容工厂", subtitle: "多平台营销文案批量生成", tag: "营销增长" },
  { id: "insight", initial: "客", name: "精准客户洞察", subtitle: "意图识别与个性化触达策略", tag: "营销增长" },
  { id: "ad", initial: "投", name: "智能投放优化", subtitle: "竞价策略调整与素材智能组合", tag: "营销增长" },
  { id: "knowledge", initial: "知", name: "智能知识管理", subtitle: "企业文档自动标签与秒级智能问答", tag: "内部提效" },
  { id: "flow", initial: "流", name: "自动化流程引擎", subtitle: "审核审批与数据录入自动化处理", tag: "内部提效" },
  { id: "dev", initial: "研", name: "智能研发助手", subtitle: "Code Review 与 Bug 智能诊断", tag: "内部提效" },
];

function GatewayVisual() {
  return (
    <div style={{ width: "100%", height: 240, background: "var(--color-surface-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: 20, flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--color-muted)" }}>DS</div>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>DeepSeek</span>
      </div>
      <svg width="40" height="10" viewBox="0 0 40 10" fill="none"><path d="M0 5h30m0 0l-4-4m4 4l-4 4" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "var(--color-primary)", color: "var(--color-on-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, lineHeight: 1.3, textAlign: "center", padding: 8 }}>AliAPI<br/>统一网关</div>
      <svg width="40" height="10" viewBox="0 0 40 10" fill="none"><path d="M0 5h30m0 0l-4-4m4 4l-4 4" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--color-muted)" }}>GPT</div>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>GPT-4o</span>
      </div>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div style={{ width: "100%", height: 240, background: "var(--color-surface-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-hairline)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>本月预算消耗</span>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>¥ 12,480 / ¥ 20,000</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--color-hairline)", overflow: "hidden" }}>
        <div style={{ width: "62%", height: "100%", borderRadius: 4, background: "var(--color-primary)" }} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
        {["研发部", "市场部", "客服部"].map((dept, idx) => (
          <div key={dept} style={{ flex: 1, background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", padding: 10 }}>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginBottom: 4 }}>{dept}</div>
            <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{[4800, 3200, 1500][idx].toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <div style={{ width: "100%", height: 240, background: "var(--color-surface-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, padding: 20 }}>
      <div style={{ width: 80, height: 96, borderRadius: "var(--radius-lg)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {["调用日志脱敏", "操作可追溯", "审计报表导出"].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-body-sm)", color: "var(--color-ink)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Visual({ type }: { type: string }) {
  if (type === "gateway") return <GatewayVisual />;
  if (type === "dashboard") return <DashboardVisual />;
  return <ShieldVisual />;
}

export default function EnterprisePage() {
  return (
    <div style={{ minHeight: "100%", background: "var(--color-canvas)" }}>
      {/* Hero */}
      <section style={{ background: "var(--color-canvas)", padding: "var(--spacing-section) var(--spacing-lg)", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", letterSpacing: "0.05em", display: "block", marginBottom: "var(--spacing-sm)" }}>
            Enterprise AI One-Stop Service
          </span>
          <h1 style={{ fontFamily: "Inter, sans-serif", fontSize: 40, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.04em", margin: "0 0 var(--spacing-md) 0", color: "var(--color-ink)" }}>
            企业 AI 一站式服务
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "var(--text-body-md)", color: "var(--color-body)", maxWidth: 720, margin: "0 auto", lineHeight: 1.6 }}>
            从底层 Token 调度到上层业务应用，提供全栈 AI 落地双引擎
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <div style={{ background: "var(--color-surface-soft)", borderTop: "1px solid var(--color-hairline-soft)", borderBottom: "1px solid var(--color-hairline-soft)", padding: "var(--spacing-md) var(--spacing-lg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
            {TRUST_ITEMS.map((item) => (
              <span key={item} style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{item}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: 0.45 }}>
            {["阿里云", "DeepSeek", "OpenAI", "Anthropic"].map((name) => (
              <span key={name} style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", whiteSpace: "nowrap" }}>{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Block 1: Token Management */}
      <section style={{ padding: "var(--spacing-section) var(--spacing-lg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-section)" }}>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--color-ink)", margin: "0 0 var(--spacing-sm) 0" }}>
              大模型统一管控服务
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "var(--text-body-md)", color: "var(--color-body)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
              告别多头商务对接与账单混乱，一站式管好全公司的 AI 预算与合规。
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-section)" }}>
            {FEATURES.map((feature, idx) => (
              <div key={feature.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xl)", flexDirection: idx % 2 === 0 ? "row" : "row-reverse" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)", fontFamily: "Geist Mono, ui-monospace, monospace", letterSpacing: "0.05em" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: "var(--text-title-lg)", fontWeight: 600, lineHeight: 1.3, color: "var(--color-ink)", margin: "0 0 var(--spacing-sm) 0" }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "var(--text-body-md)", color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>
                    {feature.desc}
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Visual type={feature.visual} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Block 2: Agent App Platform */}
      <section style={{ background: "var(--color-surface-soft)", padding: "var(--spacing-section) var(--spacing-lg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "var(--spacing-section)" }}>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--color-ink)", margin: "0 0 var(--spacing-sm) 0" }}>
              AI 数字员工 Agent 平台
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "var(--text-body-md)", color: "var(--color-body)", maxWidth: 720, lineHeight: 1.6 }}>
              提供各种业务场景的 AI 解决方案 APP，员工即开即用，将 AI 真正融入业务肌理。
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
            {AGENT_APPS.map((app) => (
              <div key={app.id} style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-sm)" }}>
                  <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: "var(--text-title-md)", fontWeight: 600, lineHeight: 1.4, color: "var(--color-ink)", margin: 0 }}>{app.name}</h3>
                  <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", whiteSpace: "nowrap", padding: "2px 8px", background: "var(--color-surface-soft)", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-hairline-soft)" }}>{app.tag}</span>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.6, margin: 0, flex: 1 }}>{app.subtitle}</p>
                <button style={{ alignSelf: "flex-start", height: 32, padding: "0 var(--spacing-sm)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  使用此应用 →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Block 3: Bottom CTA */}
      <section style={{ background: "var(--color-canvas)", padding: "var(--spacing-section) var(--spacing-lg)", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--color-ink)", margin: "0 0 var(--spacing-lg) 0" }}>
            让 AI 真正赋能您的业务
          </h2>
          <button style={{ height: 44, padding: "0 var(--spacing-xl)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", background: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            获取企业级 AI 解决方案
          </button>
        </div>
      </section>
    </div>
  );
}
