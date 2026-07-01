"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";

/* ================================================================
   Mock data
   ================================================================ */
const AUDIT_LOGS = [
  { id: "audit-01", time: "2026-06-26 14:32:10", team: "AI 平台部", sub: "张明", endpoint: "/v1/chat/completions", requestId: "req-a1b2c3d4", summary: "用户问题：***在***城市的订单情况（已脱敏）", status: "success", risk: "低" },
  { id: "audit-02", time: "2026-06-26 14:31:55", team: "客服中心", sub: "李芳", endpoint: "/v1/chat/completions", requestId: "req-e5f6a7b8", summary: "用户：我的订单什么时候发货？（已脱敏）", status: "gateway_error", risk: "中" },
  { id: "audit-03", time: "2026-06-26 14:30:22", team: "增长与投放", sub: "陈静", endpoint: "/v1/embeddings", requestId: "req-c9d0e1f2", summary: "请求内容：批量文本向量化处理（已脱敏）", status: "success", risk: "低" },
  { id: "audit-04", time: "2026-06-26 14:29:40", team: "数据平台", sub: "赵强", endpoint: "/v1/chat/completions", requestId: "req-3a4b5c6d", summary: "上下文含敏感字段已脱敏，查询语句已提取（已脱敏）", status: "success", risk: "高" },
  { id: "audit-05", time: "2026-06-26 14:28:05", team: "AI 平台部", sub: "张明", endpoint: "/v1/chat/completions", requestId: "req-7e8f9a0b", summary: "多模态请求：图片描述生成（已脱敏）", status: "success", risk: "低" },
];

const BLOCK_LOGS = [
  { id: "block-01", time: "2026-06-26 14:25:00", team: "客服中心", sub: "客服机器人", endpoint: "/v1/chat/completions", type: "频率超限", rule: "超过单 IP 每分钟 100 次限制", risk: "中", ip: "203.0.113.45" },
  { id: "block-02", time: "2026-06-26 13:10:00", team: "数据平台", sub: "数据导出服务", endpoint: "/v1/embeddings", type: "IP 黑名单", rule: "来自黑名单 IP 段 10.0.0.0/24", risk: "高", ip: "10.0.0.15" },
  { id: "block-03", time: "2026-06-25 22:05:00", team: "产品研发", sub: "王磊", endpoint: "/v1/chat/completions", type: "未授权调用", rule: "使用已禁用的模型 GPT-4.1", risk: "中", ip: "192.168.1.100" },
  { id: "block-04", time: "2026-06-25 18:30:00", team: "AI 平台部", sub: "模型推理服务", endpoint: "/v1/chat/completions", type: "其他策略", rule: "疑似爬虫行为，请求模式异常", risk: "高", ip: "45.33.32.156" },
];

/* ================================================================
   Page
   ================================================================ */
export default function SecurityPage() {
  const [tab, setTab] = useState("audit");
  const [auditDetail, setAuditDetail] = useState<typeof AUDIT_LOGS[number] | null>(null);
  const [blockDetail, setBlockDetail] = useState<typeof BLOCK_LOGS[number] | null>(null);

  const tabItems = [
    { key: "audit", label: "审计日志", content: null },
    { key: "block", label: "异常拦截记录", content: null },
    { key: "policy", label: "安全策略配置", content: null },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/settings/security")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", lineHeight: "var(--text-body-sm--line-height)", color: "var(--color-muted)" }}>
          集中查看脱敏后的调用审计日志与异常拦截记录，配置安全策略，满足企业安全合规与审计要求。
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-md)" }}>
        <Kpi label="审计日志留存时长" value="≥ 6 个月" sub="当前配置：保留 180 天以上" />
        <Kpi label="近 30 日异常拦截" value="23 次" sub="含高风险 IP、异常调用频次等" />
        <Kpi label="最近风险告警" value="2026-06-25 14:32" sub="来自：市场部-子账号" />
      </div>

      {/* Notice */}
      <div style={{ padding: "var(--spacing-sm) var(--spacing-md)", marginBottom: "var(--spacing-lg)", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>
        所有审计日志中的敏感信息（如手机号、邮箱、身份证号）已在存储前进行脱敏处理，仅保留用于追溯的必要字段。
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Tabs tabs={tabItems} activeKey={tab} onChange={setTab} />
      </div>

      {/* Tab: 审计日志 */}
      {tab === "audit" && (
        <>
          <Toolbar>
            <Sel options={["最近 24 小时", "最近 7 日", "最近 30 日", "自定义"]} />
            <Sel options={["全部部门", "AI 平台部", "客服中心", "增长与投放", "数据平台", "产品研发"]} />
            <Sel options={["全部子账号", "张明", "李芳", "陈静", "赵强"]} />
            <Sel options={["全部结果", "成功", "业务错误", "网关错误"]} />
            <Sel options={["全部风险", "低", "中", "高"]} />
            <input placeholder="搜索 请求ID / 路径 / Trace ID" style={inpS} />
            <button style={secondaryBtn}>导出审计日志</button>
          </Toolbar>

          <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
            <table style={{ width: "100%", minWidth: 850, borderCollapse: "collapse" }}>
              <thead><tr style={{ backgroundColor: "#F9FAFB" }}><Th>时间</Th><Th>团队·子账号</Th><Th>调用入口</Th><Th>请求 ID</Th><Th>脱敏摘要</Th><Th>结果</Th><Th>风险</Th><Th right>操作</Th></tr></thead>
              <tbody>
                {AUDIT_LOGS.map((r) => (
                  <tr key={r.id} style={{ height: 44 }}>
                    <Td muted>{r.time}</Td>
                    <Td style={{ color: "var(--color-body)" }}>{r.team} · {r.sub}</Td>
                    <Td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-body)" }}>{r.endpoint}</Td>
                    <Td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{r.requestId.slice(0, 10)}...</Td>
                    <Td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--color-muted)" }}>{r.summary}</Td>
                    <Td><SBadge s={r.status} /></Td>
                    <Td><RBadge level={r.risk} /></Td>
                    <Td right><AL onClick={() => setAuditDetail(r)}>查看详情</AL></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagi total={AUDIT_LOGS.length} />
        </>
      )}

      {/* Tab: 异常拦截记录 */}
      {tab === "block" && (
        <>
          <Toolbar>
            <Sel options={["最近 24 小时", "最近 7 日", "最近 30 日", "自定义"]} />
            <Sel options={["全部类型", "频率超限", "IP 黑名单", "未授权调用", "其他策略"]} />
            <Sel options={["全部风险", "低", "中", "高"]} />
            <Sel options={["全部部门", "AI 平台部", "客服中心", "增长与投放", "产品研发"]} />
            <input placeholder="搜索 IP / 请求 ID" style={inpS} />
          </Toolbar>

          <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
            <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse" }}>
              <thead><tr style={{ backgroundColor: "#F9FAFB" }}><Th>时间</Th><Th>团队·子账号</Th><Th>调用入口</Th><Th>拦截类型</Th><Th>触发规则</Th><Th>风险</Th><Th>源 IP</Th><Th right>操作</Th></tr></thead>
              <tbody>
                {BLOCK_LOGS.map((r) => (
                  <tr key={r.id} style={{ height: 44 }}>
                    <Td muted>{r.time}</Td>
                    <Td style={{ color: "var(--color-body)" }}>{r.team} · {r.sub}</Td>
                    <Td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-body)" }}>{r.endpoint}</Td>
                    <Td><BTypeBadge type={r.type} /></Td>
                    <Td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--color-muted)", fontSize: "var(--text-caption)" }}>{r.rule}</Td>
                    <Td><RBadge level={r.risk} /></Td>
                    <Td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-body)" }}>{r.ip}</Td>
                    <Td right><AL onClick={() => setBlockDetail(r)}>查看详情</AL></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagi total={BLOCK_LOGS.length} />
        </>
      )}

      {/* Tab: 安全策略配置 */}
      {tab === "policy" && <PolicyTab />}

      {/* Drawers */}
      <AuditDrawer data={auditDetail} onClose={() => setAuditDetail(null)} />
      <BlockDrawer data={blockDetail} onClose={() => setBlockDetail(null)} />
    </div>
  );
}

/* ================================================================
   Policy Tab
   ================================================================ */
function PolicyTab() {
  const rules = [
    { name: "全局频率限制", type: "频率限制", scope: "账户级", status: "active", lastTrigger: "2026-06-26 14:25" },
    { name: "IP 黑名单策略", type: "IP 黑名单", scope: "账户级", status: "active", lastTrigger: "2026-06-26 13:10" },
    { name: "AI 平台部模型限制", type: "模型限制", scope: "AI 平台部", status: "active", lastTrigger: "2026-06-25 22:05" },
  ];

  return (
    <div>
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)" }}>安全策略配置</h3>
        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", margin: 0 }}>配置全局频率限制、IP 白名单/黑名单等策略，防止恶意调用和数据滥用。</p>
      </div>

      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
          <thead><tr style={{ backgroundColor: "#F9FAFB" }}><Th>规则名称</Th><Th>类型</Th><Th>作用范围</Th><Th>状态</Th><Th>最近触发</Th><Th right>操作</Th></tr></thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.name} style={{ height: 44 }}>
                <Td style={{ fontWeight: 500, color: "var(--color-ink)" }}>{r.name}</Td>
                <Td><BTypeBadge type={r.type} /></Td>
                <Td style={{ color: "var(--color-body)" }}>{r.scope}</Td>
                <Td><Badge a={r.status === "active"} l={["启用", "停用"]} /></Td>
                <Td muted>{r.lastTrigger}</Td>
                <Td right><div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}><AL>编辑</AL><AL>{r.status === "active" ? "停用" : "启用"}</AL></div></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagi total={rules.length} />
    </div>
  );
}

/* ================================================================
   Audit Detail Drawer
   ================================================================ */
function AuditDrawer({ data, onClose }: { data: typeof AUDIT_LOGS[number] | null; onClose: () => void }) {
  if (!data) return null;
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 520, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <DrawerH title="审计日志详情" sub={`${data.requestId} · ${data.time}`} onClose={onClose} />
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
          <Sec t="基本信息">
            <Fld l="时间" v={data.time} />
            <Fld l="团队/子账号" v={`${data.team} · ${data.sub}`} />
            <Fld l="请求 ID" v={data.requestId} mono />
            <Fld l="调用入口" v={data.endpoint} />
            <Fld l="模型 & 供应商" v="GPT-4o · OpenAI" />
            <Fld l="来源 IP" v="203.0.113.42" />
          </Sec>
          <Sec t="调用上下文">
            <Fld l="接口路径" v={data.endpoint} mono />
            <Fld l="HTTP 方法" v="POST" />
            <Fld l="响应状态" label={<SBadge s={data.status} />} />
            <Fld l="用量" v="3,579 Tokens · ¥ 0.123" />
          </Sec>
          <Sec t="请求内容（已脱敏）">
            <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: "0 0 8px" }}>以下内容已按企业安全策略进行脱敏，仅保留审计必要信息。</p>
            <CodeBlock label="Prompt" text={"请分析以下用户反馈：\n用户反馈: 产品很好用，但加载速度有***问题\n用户ID: ***\n联系电话: ***"} />
            <CodeBlock label="Response" text={"根据分析：\n1. 满意度：***\n2. 存在问题：***\n3. 建议：优化前端***环节"} />
          </Sec>
          <Sec t="操作轨迹" last>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
              <span>2026-06-26 15:00 — admin@company.com — 查看详情</span>
              <span>2026-06-26 16:30 — auditor@company.com — 导出审计日志</span>
            </div>
          </Sec>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Block Detail Drawer
   ================================================================ */
function BlockDrawer({ data, onClose }: { data: typeof BLOCK_LOGS[number] | null; onClose: () => void }) {
  if (!data) return null;
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 520, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <DrawerH title="异常拦截详情" sub={`${data.type} · ${data.time}`} onClose={onClose} />
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
          <Sec t="基本信息">
            <Fld l="时间" v={data.time} />
            <Fld l="团队/子账号" v={`${data.team} · ${data.sub}`} />
            <Fld l="调用入口" v={data.endpoint} mono />
          </Sec>
          <Sec t="拦截原因">
            <Fld l="拦截类型" label={<BTypeBadge type={data.type} />} />
            <Fld l="触发规则" v={data.rule} />
            <Fld l="风险级别" label={<RBadge level={data.risk} />} />
          </Sec>
          <Sec t="源信息">
            <Fld l="源 IP" v={data.ip} mono />
            <Fld l="User-Agent" v="Mozilla/5.0 (compatible; Bot/1.0)" muted />
            <Fld l="地理位置" v="中国 上海" muted />
          </Sec>
          <Sec t="处理建议" last>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", margin: "0 0 12px" }}>如该请求来自可信来源，可在 IP 白名单中进行配置；否则建议保留当前拦截策略。</p>
            <button style={{ ...secondaryBtn, marginTop: 0 }}>在组织与权限管控中管理 IP 白名单 →</button>
          </Sec>
        </div>
      </div>
    </>
  );
}

function CodeBlock({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: "var(--spacing-sm)" }}>
      <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>{label}</span>
      <pre style={{ fontSize: "var(--text-caption)", fontFamily: "var(--font-mono)", backgroundColor: "var(--color-surface-card)", padding: "var(--spacing-sm)", borderRadius: "var(--radius-md)", color: "var(--color-body)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto" }}>{text}</pre>
    </div>
  );
}

/* ================================================================
   Shared
   ================================================================ */
function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 96 }}><span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>{label}</span><span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, letterSpacing: "var(--text-display-sm--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{value}</span>{sub && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 4 }}>{sub}</span>}</div>;
}

function SBadge({ s }: { s: string }) {
  const m: Record<string, { l: string; fg: string; bg: string }> = { success: { l: "成功", fg: "var(--color-success)", bg: "#ECFDF5" }, biz_error: { l: "业务错误", fg: "var(--color-error)", bg: "#FEF2F2" }, gateway_error: { l: "网关错误", fg: "var(--color-error)", bg: "#FEF2F2" } };
  const c = m[s] ?? { l: s, fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{c.l}</span>;
}

function RBadge({ level }: { level: string }) {
  const m: Record<string, { fg: string; bg: string }> = { "低": { fg: "var(--color-success)", bg: "#ECFDF5" }, "中": { fg: "#D97706", bg: "#FFFBEB" }, "高": { fg: "var(--color-error)", bg: "#FEF2F2" } };
  const c = m[level] ?? m["中"];
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{level}</span>;
}

function BTypeBadge({ type }: { type: string }) {
  const m: Record<string, { fg: string; bg: string }> = { "频率超限": { fg: "#D97706", bg: "#FFFBEB" }, "IP 黑名单": { fg: "var(--color-error)", bg: "#FEF2F2" }, "未授权调用": { fg: "#7C3AED", bg: "#F5F3FF" }, "其他策略": { fg: "#6B7280", bg: "#F3F4F6" }, "频率限制": { fg: "#2563EB", bg: "#EFF6FF" }, "模型限制": { fg: "#7C3AED", bg: "#F5F3FF" } };
  const c = m[type] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{type}</span>;
}

function Badge({ a, l }: { a: boolean; l: [string, string] }) {
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: a ? "var(--color-success)" : "var(--color-muted)", backgroundColor: a ? "#ECFDF5" : "var(--color-surface-card)", borderRadius: "var(--radius-sm)" }}>{a ? l[0] : l[1]}</span>;
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>{children}</div>;
}

function Sel({ options }: { options: string[] }) {
  return <select style={selS}>{options.map((o) => <option key={o} value={o === options[0] ? "" : o}>{o}</option>)}</select>;
}

function Sec({ t, children, last }: { t: string; children: React.ReactNode; last?: boolean }) {
  return <div style={{ marginBottom: "var(--spacing-lg)", paddingBottom: last ? 0 : "var(--spacing-lg)", borderBottom: last ? "none" : "1px solid var(--color-hairline-soft)" }}><h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>{t}</h3>{children}</div>;
}

function Fld({ l, v, label, children, mono, muted }: { l: string; v?: string; label?: React.ReactNode; children?: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)" }}><span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", width: 80, flexShrink: 0 }}>{l}</span>{label ?? <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: muted ? "var(--color-muted)" : "var(--color-ink)", fontFamily: mono ? "var(--font-mono)" : undefined }}>{v}</span>}{children}</div>;
}

function DrawerH({ title, sub, onClose }: { title: string; sub: string; onClose: () => void }) {
  return <div className="flex items-center justify-between shrink-0" style={{ height: 60, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" }}><div><div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{title}</div><div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>{sub}</div></div><button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button></div>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children, style, right, muted }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean; muted?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", color: muted ? "var(--color-muted)" : undefined, ...style }}>{children}</td>;
}

function AL({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap" }}>{children}</button>;
}

function Pagi({ total }: { total: number }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}><span>共 {total} 条</span><div style={{ display: "flex", gap: "var(--spacing-xxs)" }}><PageBtn disabled>上一页</PageBtn><PageBtn active>1</PageBtn><PageBtn disabled>下一页</PageBtn></div></div>;
}

function PageBtn({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return <button disabled={disabled} style={{ height: 32, minWidth: 32, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)", backgroundColor: active ? "var(--color-primary)" : "transparent", border: active ? "none" : "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}

const secondaryBtn: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };

const inpS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: 180 };

const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
