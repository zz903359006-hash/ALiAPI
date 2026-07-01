"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";

/* ================================================================
   Mock data — 策略列表
   ================================================================ */
interface Strategy {
  id: string;
  name: string;
  desc: string;
  type: string;
  scope: string;
  scopeDetail: string;
  keyCount: number;
  status: "active" | "inactive";
  updatedAt: string;
  weights: { cost: number; quality: number; latency: number; availability: number };
  modelBlacklist: string[];
  vendorBlacklist: string[];
  preferredVendors: string[];
  autoFailover: boolean;
  failoverThreshold: number;
  failoverStrategy: string;
  previews: { scenario: string; decision: string; reason: string }[];
}

const MOCK_STRATEGIES: Strategy[] = [
  {
    id: "str-001", name: "默认性价比策略", desc: "平衡价格与质量，适用于通用对话场景",
    type: "性价比优先", scope: "global", scopeDetail: "全局默认", keyCount: 124,
    status: "active", updatedAt: "2026-06-20 15:30:00",
    weights: { cost: 0.4, quality: 0.3, latency: 0.15, availability: 0.15 },
    modelBlacklist: ["GPT-4.1"], vendorBlacklist: [], preferredVendors: ["OpenAI", "通义千问", "DeepSeek"],
    autoFailover: true, failoverThreshold: 3, failoverStrategy: "switch_vendor",
    previews: [
      { scenario: "通用对话，高实时要求", decision: "优先 DeepSeek · 备选 通义千问", reason: "DeepSeek 延迟最低，综合性价比得分最高" },
      { scenario: "长文本生成，质量优先", decision: "优先 OpenAI · 备选 Anthropic", reason: "质量权重更高，OpenAI GPT-4o 综合质量得分领先" },
    ],
  },
  {
    id: "str-002", name: "最低成本策略", desc: "优先选择成本最低的模型与供应商",
    type: "最低成本", scope: "keys", scopeDetail: "绑定 8 个调用 Key", keyCount: 8,
    status: "active", updatedAt: "2026-06-18 10:15:00",
    weights: { cost: 0.7, quality: 0.1, latency: 0.1, availability: 0.1 },
    modelBlacklist: ["GPT-4o", "Claude 3.5"], vendorBlacklist: [], preferredVendors: ["DeepSeek", "通义千问"],
    autoFailover: false, failoverThreshold: 5, failoverStrategy: "switch_vendor",
    previews: [
      { scenario: "批量文本分析，低实时要求", decision: "优先 DeepSeek · 备选 通义千问", reason: "成本权重 0.7，DeepSeek 单价最低" },
    ],
  },
  {
    id: "str-003", name: "最高质量策略", desc: "用于对准确性要求极高的场景",
    type: "最高质量", scope: "keys", scopeDetail: "绑定 3 个调用 Key", keyCount: 3,
    status: "active", updatedAt: "2026-06-15 08:45:00",
    weights: { cost: 0.05, quality: 0.7, latency: 0.1, availability: 0.15 },
    modelBlacklist: [], vendorBlacklist: [], preferredVendors: ["OpenAI", "Anthropic"],
    autoFailover: true, failoverThreshold: 2, failoverStrategy: "switch_model",
    previews: [
      { scenario: "医疗报告生成", decision: "优先 Anthropic Claude · 备选 OpenAI GPT-4o", reason: "质量权重 0.7，Claude 在医疗领域 HLE 评分最高" },
    ],
  },
  {
    id: "str-004", name: "低延迟策略", desc: "实时对话场景，毫秒级响应优先",
    type: "最低延迟", scope: "team", scopeDetail: "团队：市场部", keyCount: 15,
    status: "inactive", updatedAt: "2026-06-12 17:20:00",
    weights: { cost: 0.1, quality: 0.2, latency: 0.6, availability: 0.1 },
    modelBlacklist: [], vendorBlacklist: ["Anthropic"], preferredVendors: ["DeepSeek", "OpenAI"],
    autoFailover: true, failoverThreshold: 2, failoverStrategy: "switch_vendor",
    previews: [
      { scenario: "实时客服对话", decision: "优先 DeepSeek · 备选 OpenAI", reason: "延迟权重 0.6，DeepSeek API 平均响应 <200ms" },
    ],
  },
];

/* ================================================================
   Mock data — 路由决策日志
   ================================================================ */
interface RouteLog {
  id: string;
  time: string;
  requestId: string;
  keyName: string;
  user: string;
  modelCategory: string;
  modelVendor: string;
  degraded: boolean;
  degradeReason: string;
  weights: { cost: number; quality: number; latency: number; availability: number };
}

const MOCK_LOGS: RouteLog[] = [
  { id: "log-01", time: "2026-06-26 14:32:10", requestId: "req-a1b2c3", keyName: "生产环境主 Key", user: "AI 平台部 · 张明", modelCategory: "通用对话", modelVendor: "DeepSeek · V3", degraded: false, degradeReason: "", weights: { cost: 0.4, quality: 0.3, latency: 0.15, availability: 0.15 } },
  { id: "log-02", time: "2026-06-26 14:31:55", requestId: "req-d4e5f6", keyName: "客服机器人 Key", user: "客服中心 · 李芳", modelCategory: "通用对话", modelVendor: "OpenAI · GPT-4o", degraded: true, degradeReason: "原选供应商延迟过高", weights: { cost: 0.4, quality: 0.3, latency: 0.15, availability: 0.15 } },
  { id: "log-03", time: "2026-06-26 14:30:22", requestId: "req-g7h8i9", keyName: "投放分析 Key", user: "增长与投放 · 陈静", modelCategory: "文本生成", modelVendor: "通义千问 · Max", degraded: false, degradeReason: "", weights: { cost: 0.7, quality: 0.1, latency: 0.1, availability: 0.1 } },
  { id: "log-04", time: "2026-06-26 14:29:40", requestId: "req-j0k1l2", keyName: "数据导出 Key", user: "数据平台 · 赵强", modelCategory: "代码", modelVendor: "OpenAI · GPT-4o", degraded: true, degradeReason: "连续错误超过阈值", weights: { cost: 0.05, quality: 0.7, latency: 0.1, availability: 0.15 } },
  { id: "log-05", time: "2026-06-26 14:28:05", requestId: "req-m3n4o5", keyName: "生产环境主 Key", user: "AI 平台部 · 张明", modelCategory: "多模态", modelVendor: "Anthropic · Claude 3.5", degraded: false, degradeReason: "", weights: { cost: 0.1, quality: 0.7, latency: 0.1, availability: 0.1 } },
];

/* ================================================================
   Page
   ================================================================ */
export default function AutoRoutingPage() {
  const [tab, setTab] = useState("strategies");
  const [detailStrategy, setDetailStrategy] = useState<Strategy | null>(null);
  const [detailLog, setDetailLog] = useState<RouteLog | null>(null);

  const tabItems = [
    { key: "strategies", label: "策略列表", content: null },
    { key: "logs", label: "路由决策日志", content: null },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/routing/auto")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", lineHeight: "var(--text-body-sm--line-height)", color: "var(--color-muted)" }}>
          配置多模型多供应商的智能路由策略，按成本、质量、延迟等权重自动选择最佳模型。
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Tabs tabs={tabItems} activeKey={tab} onChange={setTab} />
      </div>

      {/* Tab: 策略列表 */}
      {tab === "strategies" && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
              <SearchBox placeholder="搜索策略名称" />
              <SelectF options={["全部类型", "性价比优先", "最低成本", "最高质量", "最低延迟", "自定义"]} />
              <SelectF options={["全部状态", "生效中", "已停用"]} />
              <SelectF options={["全部范围", "全局", "指定 Key", "指定团队"]} />
            </div>
            <button style={primaryBtn}>新建路由策略</button>
          </div>

          {/* Table */}
          <StrategyTable data={MOCK_STRATEGIES} onView={setDetailStrategy} />

          <Pagi total={MOCK_STRATEGIES.length} />
        </>
      )}

      {/* Tab: 路由决策日志 */}
      {tab === "logs" && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
              <SearchBox placeholder="搜索请求 ID 或 Key 名称" />
              <SelectF options={["全部 Key", "生产环境主 Key", "客服机器人 Key", "投放分析 Key"]} />
              <SelectF options={["全部需求", "通用对话", "文本生成", "代码", "多模态"]} />
              <SelectF options={["全部", "已降级", "未降级"]} />
            </div>
            <button style={secondaryBtn}>导出日志</button>
          </div>

          {/* Table */}
          <LogTable data={MOCK_LOGS} onView={setDetailLog} />

          <Pagi total={MOCK_LOGS.length} />
        </>
      )}

      {/* Strategy Detail Drawer */}
      <StrategyDrawer data={detailStrategy} onClose={() => setDetailStrategy(null)} />

      {/* Log Detail Drawer */}
      <LogDetailDrawer data={detailLog} onClose={() => setDetailLog(null)} />
    </div>
  );
}

/* ================================================================
   Strategy Table
   ================================================================ */
function StrategyTable({ data, onView }: { data: Strategy[]; onView: (s: Strategy) => void }) {
  if (data.length === 0) return <EmptyState title="暂未创建路由策略" desc="创建第一个路由策略，开始自动选择最优模型。" btn="新建路由策略" />;

  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
      <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <Th>策略名称</Th><Th>策略类型</Th><Th>适用范围</Th><Th>生效状态</Th><Th>绑定 Key</Th><Th>最近修改</Th><Th right>操作</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} style={{ height: 44 }}>
              <Td>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{r.name}</span>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</span>
                </div>
              </Td>
              <Td><TypeBadge type={r.type} /></Td>
              <Td>
                <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.scopeDetail}</span>
              </Td>
              <Td><StatusBadge active={r.status === "active"} labels={["生效中", "已停用"]} /></Td>
              <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", textAlign: "center" as const }}>
                {r.keyCount} <span style={{ color: "var(--color-muted)", fontSize: "var(--text-caption)" }}>个 Key</span>
              </Td>
              <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{r.updatedAt}</Td>
              <Td right>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                  <ALink onClick={() => onView(r)}>查看</ALink>
                  <ALink>编辑</ALink>
                  <ALink>复制</ALink>
                  <ALink>{r.status === "active" ? "停用" : "启用"}</ALink>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Log Table
   ================================================================ */
function LogTable({ data, onView }: { data: RouteLog[]; onView: (l: RouteLog) => void }) {
  if (data.length === 0) return <EmptyState title="暂无路由决策日志" desc="当有 API 请求通过 Auto 路由时，决策日志将显示在这里。" />;

  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
      <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <Th>时间</Th><Th>请求 ID</Th><Th>关联 Key</Th><Th>用户 / 团队</Th><Th>模型需求</Th><Th>选择模型</Th><Th>降级</Th><Th right>操作</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} style={{ height: 44 }}>
              <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{r.time}</Td>
              <Td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-body)" }}>{r.requestId}</Td>
              <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", fontWeight: 500 }}>{r.keyName}</Td>
              <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.user}</Td>
              <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{r.modelCategory}</Td>
              <Td style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{r.modelVendor}</Td>
              <Td>
                {r.degraded ? (
                  <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-warning)", backgroundColor: "#FFFBEB", borderRadius: "var(--radius-sm)" }}>已降级</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-success)", backgroundColor: "#ECFDF5", borderRadius: "var(--radius-sm)" }}>正常</span>
                )}
              </Td>
              <Td right>
                <ALink onClick={() => onView(r)}>查看决策详情</ALink>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Strategy Detail Drawer — 7 sections
   ================================================================ */
function StrategyDrawer({ data, onClose }: { data: Strategy | null; onClose: () => void }) {
  if (!data) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 520, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ height: 60, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div>
            <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>路由策略详情</div>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>类型：{data.type} · <StatusBadge active={data.status === "active"} labels={["生效中", "已停用"]} /></div>
          </div>
          <ButXn onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></ButXn>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
          {/* §3.2 基本设置 */}
          <Sect title="基本设置">
            <Fld label="策略名称"><input defaultValue={data.name} style={inp} /></Fld>
            <Fld label="策略描述"><input defaultValue={data.desc} style={inp} /></Fld>
            <Fld label="策略类型"><span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{data.type}</span></Fld>
          </Sect>

          {/* §3.3 应用范围 */}
          <Sect title="应用范围">
            <label style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", cursor: "pointer", marginBottom: "var(--spacing-sm)" }}>
              <input type="checkbox" defaultChecked={data.scope === "global"} style={{ cursor: "pointer" }} />
              设为全局默认策略
            </label>
            {data.scope !== "global" && (
              <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
                当前已绑定 {data.keyCount} 个 Key
              </div>
            )}
          </Sect>

          {/* §3.4 优先规则 */}
          <Sect title="优先规则">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              <WeightRow label="成本权重" desc="优先选择单价更低的模型" val={data.weights.cost} />
              <WeightRow label="质量权重" desc="基于 HLE 评分优先选择高质量模型" val={data.weights.quality} />
              <WeightRow label="延迟权重" desc="优先选择响应更快的供应商" val={data.weights.latency} />
              <WeightRow label="可用率权重" desc="优先选择 SLA 更高的供应商" val={data.weights.availability} />
            </div>
          </Sect>

          {/* §3.5 黑/白名单 */}
          <Sect title="模型 & 供应商黑/白名单">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)" }}>
              <div>
                <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", display: "block", marginBottom: "var(--spacing-xs)" }}>模型黑名单</span>
                {data.modelBlacklist.length > 0 ? data.modelBlacklist.map((m, i) => <Tag key={i}>{m}</Tag>) : <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>无</span>}
              </div>
              <div>
                <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", display: "block", marginBottom: "var(--spacing-xs)" }}>供应商黑名单</span>
                {data.vendorBlacklist.length > 0 ? data.vendorBlacklist.map((v, i) => <Tag key={i}>{v}</Tag>) : <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>无</span>}
              </div>
            </div>
            <div style={{ marginTop: "var(--spacing-md)" }}>
              <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", display: "block", marginBottom: "var(--spacing-xs)" }}>首选供应商优先级</span>
              {data.preferredVendors.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", padding: "var(--spacing-xxs) 0", fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>
                  <span style={{ color: "var(--color-muted)", fontSize: "var(--text-caption)", width: 16 }}>{i + 1}.</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </Sect>

          {/* §3.6 故障自动降级 */}
          <Sect title="故障自动降级">
            <label style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", cursor: "pointer", marginBottom: "var(--spacing-sm)" }}>
              <input type="checkbox" defaultChecked={data.autoFailover} style={{ cursor: "pointer" }} />
              启用自动降级
            </label>
            <Fld label="连续失败阈值"><input defaultValue={data.failoverThreshold} style={{ ...inp, width: 80 }} /></Fld>
            <Fld label="切换策略">
              <select defaultValue={data.failoverStrategy} style={selS}>
                <option value="switch_vendor">切换同模型其他供应商</option>
                <option value="switch_model">切换到备用模型</option>
              </select>
            </Fld>
          </Sect>

          {/* §3.7 预览 */}
          <Sect title="决策预览" last>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              {data.previews.map((p, i) => (
                <div key={i} style={{ padding: "var(--spacing-sm)", border: "1px solid var(--color-hairline-soft)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-soft)" }}>
                  <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 2 }}>{p.scenario}</div>
                  <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: 2 }}>{p.decision}</div>
                  <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{p.reason}</div>
                </div>
              ))}
            </div>
          </Sect>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Log Detail Drawer
   ================================================================ */
function LogDetailDrawer({ data, onClose }: { data: RouteLog | null; onClose: () => void }) {
  if (!data) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 480, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between shrink-0" style={{ height: 60, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>决策详情</div>
          <ButXn onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></ButXn>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
          <Sect title="基本信息">
            <Fld label="时间" value={data.time} />
            <Fld label="请求 ID" value={data.requestId} mono />
            <Fld label="关联 Key" value={data.keyName} />
            <Fld label="用户 / 团队" value={data.user} />
            <Fld label="模型需求" value={data.modelCategory} />
          </Sect>

          <Sect title="路由决策">
            <Fld label="选择模型" value={data.modelVendor} />
            <div style={{ marginTop: "var(--spacing-sm)", display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>降级状态</span>
              {data.degraded ? (
                <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-warning)", backgroundColor: "#FFFBEB", borderRadius: "var(--radius-sm)" }}>已降级</span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-success)", backgroundColor: "#ECFDF5", borderRadius: "var(--radius-sm)" }}>正常</span>
              )}
            </div>
            {data.degraded && (
              <Fld label="触发原因" value={data.degradeReason} />
            )}
          </Sect>

          <Sect title="权重计算明细" last>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
              <WeightDetail label="成本" val={data.weights.cost} />
              <WeightDetail label="质量" val={data.weights.quality} />
              <WeightDetail label="延迟" val={data.weights.latency} />
              <WeightDetail label="可用率" val={data.weights.availability} />
            </div>
            <div style={{ marginTop: "var(--spacing-sm)", padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)" }}>
                综合得分: {(data.weights.cost * 100 + data.weights.quality * 100 + data.weights.latency * 100 + data.weights.availability * 100).toFixed(0)} / 400
              </span>
            </div>
          </Sect>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Shared helpers
   ================================================================ */
function SearchBox({ placeholder }: { placeholder: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", gap: "var(--spacing-xs)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", minWidth: 180 }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      <span>{placeholder}</span>
    </div>
  );
}

function SelectF({ options }: { options: string[] }) {
  return (
    <select style={selS}>
      {options.map((o) => <option key={o} value={o === options[0] ? "" : o}>{o}</option>)}
    </select>
  );
}

function EmptyState({ title, desc, btn }: { title: string; desc: string; btn?: string }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 240 }}>
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
      </div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>{title}</span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginBottom: btn ? "var(--spacing-lg)" : 0 }}>{desc}</span>
      {btn && <button style={primaryBtn}>{btn}</button>}
    </div>
  );
}

function Pagi({ total }: { total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
      <span>共 {total} 条</span>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xxs)" }}>
        <PagiBtn disabled>上一页</PagiBtn>
        <PagiBtn active>1</PagiBtn>
        <PagiBtn disabled>下一页</PagiBtn>
      </div>
    </div>
  );
}

function PagiBtn({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <button disabled={disabled} style={{ height: 32, minWidth: 32, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)", backgroundColor: active ? "var(--color-primary)" : "transparent", border: active ? "none" : "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}

function TypeBadge({ type }: { type: string }) {
  const m: Record<string, string> = { "性价比优先": "#2563EB", "最低成本": "#059669", "最高质量": "#7C3AED", "最低延迟": "#D97706", "自定义": "#6B7280" };
  const c = m[type] ?? "#6B7280";
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c, backgroundColor: `${c}18`, borderRadius: "var(--radius-sm)" }}>{type}</span>;
}

function StatusBadge({ active, labels }: { active: boolean; labels: [string, string] }) {
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: active ? "var(--color-success)" : "var(--color-muted)", backgroundColor: active ? "#ECFDF5" : "var(--color-surface-card)", borderRadius: "var(--radius-sm)" }}>{active ? labels[0] : labels[1]}</span>;
}

function ALink({ children, dim, onClick }: { children: React.ReactNode; dim?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: dim ? "var(--color-muted)" : "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap" }}>{children}</button>;
}

function Sect({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return <div style={{ marginBottom: "var(--spacing-lg)", paddingBottom: last ? 0 : "var(--spacing-lg)", borderBottom: last ? "none" : "1px solid var(--color-hairline-soft)" }}><h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, lineHeight: "var(--text-title-sm--line-height)", color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>{title}</h3>{children}</div>;
}

function Fld({ label, value, children, mono }: { label: string; value?: string; children?: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)" }}>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", width: 80, flexShrink: 0 }}>{label}</span>
      {children ?? <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", fontFamily: mono ? "var(--font-mono)" : undefined }}>{value}</span>}
    </div>
  );
}

function WeightRow({ label, desc, val }: { label: string; desc: string; val: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
      <div style={{ width: 80, flexShrink: 0 }}>
        <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{label}</div>
        <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{desc}</div>
      </div>
      <div style={{ flex: 1, height: 8, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
        <div style={{ width: `${val * 100}%`, height: "100%", backgroundColor: "var(--color-brand-accent)", borderRadius: "var(--radius-full)" }} />
      </div>
      <span style={{ width: 40, textAlign: "right", fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}>{(val * 100).toFixed(0)}%</span>
    </div>
  );
}

function WeightDetail({ label, val }: { label: string; val: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", width: 48 }}>{label}</span>
      <div style={{ flex: 1, height: 6, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
        <div style={{ width: `${val * 100}%`, height: "100%", backgroundColor: "var(--color-brand-accent)", borderRadius: "var(--radius-full)" }} />
      </div>
      <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)" }}>{(val * 100).toFixed(0)}%</span>
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)", margin: "0 var(--spacing-xxs) var(--spacing-xxs) 0" }}>{children}</span>;
}

function ButXn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}>{children}</button>;
}

/* Style constants */
const primaryBtn: React.CSSProperties = { height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, lineHeight: "var(--text-button--line-height)", color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };

const secondaryBtn: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, lineHeight: "var(--text-button--line-height)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" };

const inp: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none", width: "100%" };

const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
