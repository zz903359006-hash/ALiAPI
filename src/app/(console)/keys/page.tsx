"use client";

import { useState, useEffect } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";
import { isEmployee } from "@/lib/role";

/* ================================================================
   Mock data — 9-column structure per interaction spec §3.2.2
   ================================================================ */
interface CallKey {
  id: string;
  name: string;
  mask: string;
  fullKey: string;
  note: string;
  team: string;
  member: string;
  routing: string;
  rateLimit: string;
  status: "normal" | "paused" | "frozen";
  lastUsed: string;
  usage: string;
  cost: string;
  qualityScore: number;
  errorRate: string;
  costTrend: string;
}

const MOCK_KEYS: CallKey[] = [
  {
    id: "sk-4a7b9c8f",
    name: "生产环境主 Key",
    mask: "sk-****8f2c", fullKey: "sk-4a7b9c8f2c1d3e5a7b9c0d2e4f6a8b0",
    note: "核心业务调用",
    team: "AI 平台部",
    member: "张明",
    routing: "性价比优先",
    rateLimit: "QPS 30 · 日调用 100k · 日额度 1M Tokens",
    status: "normal",
    lastUsed: "2026-06-26 14:32:10",
    usage: "89.2k Tokens",
    cost: "¥ 345.60", qualityScore: 94, errorRate: "0.12%", costTrend: "+12.3%",
  },
  {
    id: "sk-2f3e8d1a",
    name: "客服机器人 Key",
    mask: "sk-****1a9b", fullKey: "sk-2f3e8d1a9b7c5d3e1f2a4b6c8d0e2f4a",
    note: "自动应答与导购",
    team: "客服中心",
    member: "李芳",
    routing: "最低成本",
    rateLimit: "QPS 10 · 日调用 50k · 日额度 500k Tokens",
    status: "normal",
    lastUsed: "2026-06-26 14:28:05",
    usage: "42.1k Tokens",
    cost: "¥ 89.20", qualityScore: 88, errorRate: "0.45%", costTrend: "-5.2%",
  },
  {
    id: "sk-7c1a5f3e",
    name: "测试环境 Key",
    mask: "sk-****3e2d", fullKey: "sk-7c1a5f3e2d4f6a8b0c2d4e6f8a0b2c4",
    note: "非生产调用",
    team: "产品研发",
    member: "王磊",
    routing: "Auto 路由中心",
    rateLimit: "QPS 5 · 日调用 10k · 无额度限制",
    status: "paused",
    lastUsed: "2026-06-20 09:15:43",
    usage: "1.2k Tokens",
    cost: "¥ 4.50", qualityScore: 72, errorRate: "2.31%", costTrend: "-",
  },
  {
    id: "sk-9b6d2e7a",
    name: "投放分析 Key",
    mask: "sk-****7a4f", fullKey: "sk-9b6d2e7a4f8c0e2a4b6d8f0c2e4a6b8",
    note: "广告素材分析",
    team: "增长与投放",
    member: "陈静",
    routing: "性价比优先",
    rateLimit: "QPS 20 · 日调用 80k · 日额度 800k Tokens",
    status: "normal",
    lastUsed: "2026-06-26 14:35:22",
    usage: "67.8k Tokens",
    cost: "¥ 234.10", qualityScore: 85, errorRate: "0.89%", costTrend: "+8.1%",
  },
  {
    id: "sk-3e8f1a6b",
    name: "数据导出 Key",
    mask: "sk-****6b0c", fullKey: "sk-3e8f1a6b0c2d4e6f8a0b2c4d6e8f0a2",
    note: "定时批处理",
    team: "数据平台",
    member: "赵强",
    routing: "最低成本",
    rateLimit: "QPS 15 · 日调用 200k · 日额度 2M Tokens",
    status: "frozen",
    lastUsed: "2026-06-18 03:00:00",
    usage: "156.3k Tokens",
    cost: "¥ 612.00", qualityScore: 60, errorRate: "4.78%", costTrend: "+22.1%",
  },
];

/* ================================================================
   Page
   ================================================================ */
export default function KeysPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [detailKey, setDetailKey] = useState<CallKey | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimDone, setClaimDone] = useState(false);
  const [toast, setToast] = useState("");
  const [keys, setKeys] = useState<CallKey[]>(MOCK_KEYS);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const toggleKeyStatus = (id: string) => {
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, status: k.status === "normal" ? "paused" : "normal" } : k));
  };

  const resetKey = (id: string) => {
    showToast("Key 已重置，新配置将在 30 秒后生效");
  };

  const deleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("redirectReason");
    if (reason) {
      showToast(decodeURIComponent(reason));
      window.history.replaceState({}, "", "/keys");
    }
  }, []);

  const handleClaim = () => {
    setClaimLoading(true);
    setTimeout(() => {
      const newKey: CallKey = {
        id: "sk-default-" + Date.now().toString(36),
        name: "Default-Assigned-Key-01",
        mask: "sk-****" + Date.now().toString(36).slice(-4),
        fullKey: "sk-default-" + Array.from({ length: 40 }, () => Math.random().toString(36)[2]).join(""),
        note: "员工领取默认 Key",
        team: "当前团队",
        member: "我",
        routing: "性价比优先",
        rateLimit: "QPS 30 · 日调用 100k",
        status: "normal",
        lastUsed: "-",
        usage: "0 Tokens",
        cost: "¥ 0.00",
        qualityScore: 85,
        errorRate: "0%",
        costTrend: "-",
      };
      setKeys((prev) => [newKey, ...prev]);
      sessionStorage.setItem("hasClaimedKey", "true");
      setClaimLoading(false);
      setClaimDone(true);
      showToast("领取成功！请在下方列表查看并复制使用。");
    }, 1000);
  };

  const tabItems = [
    { key: "list", label: "调用 Key 列表", content: null },
    { key: "groups", label: "Key 分组视图", content: null },
  ];

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* ================================================================
          Page Header
          ================================================================ */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1
          style={{
            fontSize: "var(--text-display-md)",
            fontWeight: 600,
            lineHeight: "var(--text-display-md--line-height)",
            letterSpacing: "var(--text-display-md--letter-spacing)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-display)",
          }}
        >
          {getRouteTitle("/keys")}
        </h1>
        <p
          style={{
            marginTop: "var(--spacing-xs)",
            fontSize: "var(--text-body-sm)",
            lineHeight: "var(--text-body-sm--line-height)",
            color: "var(--color-muted)",
          }}
        >
          管理可用于业务调用的 API Key，支持限速、路由策略绑定、禁用与统计。
        </p>
      </div>

      {/* ================================================================
          Tabs
          ================================================================ */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Tabs tabs={tabItems} activeKey={activeTab} onChange={setActiveTab} />
      </div>

      {/* ================================================================
          Tab: 调用 Key 列表
          ================================================================ */}
      {activeTab === "list" && (
        <>
          {/* Batch action bar — hidden for employees */}
          {!isEmployee && selectedIds.size > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--spacing-sm) var(--spacing-md)",
                marginBottom: "var(--spacing-sm)",
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-body-sm)",
                color: "var(--color-ink)",
              }}
            >
              <span>已选择 {selectedIds.size} 项</span>
              <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                <BatchBtn>批量暂停</BatchBtn>
                <BatchBtn>批量更换策略</BatchBtn>
                <BatchBtn danger>批量冻结</BatchBtn>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  style={{
                    fontSize: "var(--text-body-sm)",
                    fontWeight: 500,
                    color: "var(--color-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "var(--spacing-xs)",
                  }}
                >
                  取消选择
                </button>
              </div>
            </div>
          )}

          {/* Employee: Claim card */}
          {isEmployee && !claimDone && (
            <div style={{ marginBottom: "var(--spacing-lg)", backgroundColor: "var(--color-surface-soft)", border: "2px dashed var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", backgroundColor: "var(--color-canvas)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>领取 API 凭证</div>
                <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginTop: 2 }}>系统将自动分配一个 API Key 供您日常调用使用，免去填写复杂配置。</div>
              </div>
              <button onClick={handleClaim} disabled={claimLoading} style={{ height: 40, padding: "0 var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: claimLoading ? "#9CA3AF" : "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: claimLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                {claimLoading ? "分配中..." : "立即领取"}
              </button>
            </div>
          )}

          {/* Employee: Claim success */}
          {isEmployee && claimDone && (
            <div style={{ marginBottom: "var(--spacing-lg)", padding: "var(--spacing-sm) var(--spacing-md)", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>🎉</span>
              <span style={{ flex: 1, fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>领取成功！请复制下方列表中的 Key 开始使用。</span>
              <button onClick={() => setClaimDone(false)} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4L12 12M12 4L4 12" /></svg>
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-sm)",
              marginBottom: "var(--spacing-md)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
              {/* Search */}
              <SearchInput />
              {/* Status filter */}
              <SelectFilter options={["全部状态", "正常", "暂停", "冻结"]} />
              {!isEmployee && <SelectFilter options={["全部团队", "AI 平台部", "客服中心", "产品研发", "增长与投放", "数据平台"]} />}
              {!isEmployee && <SelectFilter options={["全部策略", "性价比优先", "最低成本", "Auto 路由中心"]} />}
            </div>

            {!isEmployee && <button style={primaryBtnStyle} onClick={() => window.location.href = "/keys/create"}>新建调用 Key</button>}
          </div>

          {/* Table */}
          <CallKeyTable
            data={keys}
            selectedIds={selectedIds}
            isEmployee={isEmployee}
            onSelect={(id, checked) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (checked) next.add(id); else next.delete(id);
                return next;
              });
            }}
            onSelectAll={(checked) => {
              setSelectedIds(checked ? new Set(keys.map((k) => k.id)) : new Set());
            }}
            onViewDetail={setDetailKey}
            onToggleStatus={toggleKeyStatus}
            onResetKey={resetKey}
            onDeleteKey={deleteKey}
          />

          {/* Pagination */}
          <Pagination total={MOCK_KEYS.length} />
        </>
      )}

      {/* ================================================================
          Tab: Key 分组视图 (placeholder)
          ================================================================ */}
      {activeTab === "groups" && (
        <EmptyPlaceholder
          title="Key 分组视图"
          desc="按团队/项目分组展示 Key，方便批量管理。后续补充。"
        />
      )}

      {/* ================================================================
          Key Detail Drawer
          ================================================================ */}
      <KeyDetailDrawer
        keyData={detailKey}
        onClose={() => setDetailKey(null)}
        isEmployee={isEmployee}
      />
    </div>
  );
}

/* ================================================================
   Call Key Table — 9 columns per spec §3.2.2
   ================================================================ */
function CallKeyTable({
  data,
  selectedIds,
  isEmployee,
  onSelect,
  onSelectAll,
  onViewDetail,
  onToggleStatus,
  onResetKey,
  onDeleteKey,
}: {
  data: CallKey[];
  selectedIds: Set<string>;
  isEmployee?: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onViewDetail: (key: CallKey) => void;
  onToggleStatus: (id: string) => void;
  onResetKey: (id: string) => void;
  onDeleteKey: (id: string) => void;
}) {
  if (data.length === 0) {
    return <EmptyState />;
  }

  const allSelected = data.length > 0 && data.every((k) => selectedIds.has(k.id));
  const someSelected = data.some((k) => selectedIds.has(k.id));

  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden", overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth: isEmployee ? 650 : 1300, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            {isEmployee ? (
              <>
                <Th>Key 名称</Th>
                <Th>Key ID</Th>
                <Th>状态</Th>
                <Th>用量/限额</Th>
                <Th style={{ textAlign: "right" }}>操作</Th>
              </>
            ) : (
              <>
                <Th style={{ width: 40, textAlign: "center" }}>
                  <input type="checkbox" checked={allSelected} ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }} onChange={(e) => onSelectAll(e.target.checked)} style={{ cursor: "pointer" }} />
                </Th>
                <Th>Key 名称 / ID</Th>
                <Th>团队 · 员工</Th>
                <Th>绑定路由策略</Th>
                <Th>限速概要</Th>
                <Th>状态</Th>
                <Th>质量</Th>
                <Th>错误率</Th>
                <Th>最近使用</Th>
                <Th>当期用量 / 费用</Th>
                <Th style={{ textAlign: "right" }}>操作</Th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={{ height: 44 }}>
              {isEmployee ? (
                <>
                  <Td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{row.name}</span>
                      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>{row.note}</span>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
                      <span style={{ fontSize: "var(--text-caption)", fontFamily: "var(--font-mono)", color: "var(--color-body)" }}>{row.mask}</span>
                      <CopyButton />
                    </div>
                  </Td>
                  <Td><StatusBadge status={row.status} /></Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-body)" }}>{row.usage}</span>
                      <div style={{ width: 120, height: 4, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, parseFloat(row.usage) / 1000)}%`, height: "100%", backgroundColor: "var(--color-success)", borderRadius: "var(--radius-full)" }} />
                      </div>
                    </div>
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                      {row.status === "normal" ? (
                        <>
                          <ActionLink onClick={() => onResetKey(row.id)}>重置</ActionLink>
                          <ActionLink onClick={() => onToggleStatus(row.id)}>停用</ActionLink>
                        </>
                      ) : (
                        <>
                          <ActionLink onClick={() => onToggleStatus(row.id)}>启用</ActionLink>
                          <ActionLink dim onClick={() => onDeleteKey(row.id)}>删除</ActionLink>
                        </>
                      )}
                    </div>
                  </Td>
                </>
              ) : (
                <>
                  <Td style={{ textAlign: "center" }}>
                    <input type="checkbox" checked={selectedIds.has(row.id)} onChange={(e) => onSelect(row.id, e.target.checked)} style={{ cursor: "pointer" }} />
                  </Td>
                  <Td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{row.name}</span>
                      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>ID: {row.mask}</span>
                    </div>
                  </Td>
                  <Td style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>{row.team} · {row.member}</Td>
                  <Td><span className="truncate" style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", maxWidth: 110, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.routing}>{row.routing}</span></Td>
                  <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", maxWidth: 200, lineHeight: 1.5 }}>{row.rateLimit}</Td>
                  <Td><StatusBadge status={row.status} /></Td>
                  <Td><QualityBadge score={row.qualityScore} /></Td>
                  <Td><ErrorBadge rate={row.errorRate} /></Td>
                  <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{row.lastUsed}</Td>
                  <Td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-body)" }}>{row.usage}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{row.cost}</span>
                        {row.costTrend && row.costTrend !== "-" && <span style={{ fontSize: 11, color: row.costTrend.startsWith("+") ? "var(--color-error)" : "var(--color-success)", fontWeight: 500 }}>{row.costTrend}</span>}
                      </div>
                    </div>
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                      <ActionLink onClick={() => onViewDetail(row)}>查看详情</ActionLink>
                      <ActionLink>编辑</ActionLink>
                      <ActionLink>{row.status === "normal" ? "暂停" : "启用"}</ActionLink>
                      <ActionLink dim>更换</ActionLink>
                    </div>
                  </Td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Key Detail Drawer — 5 sections per spec §3.2.3
   ================================================================ */
function KeyDetailDrawer({ keyData, onClose, isEmployee }: { keyData: CallKey | null; onClose: () => void; isEmployee?: boolean }) {
  const [showFullKey, setShowFullKey] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  if (!keyData) return null;

  const copyFullKey = () => {
    navigator.clipboard.writeText(keyData.fullKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 480,
          maxWidth: "100vw",
          backgroundColor: "var(--color-canvas)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            height: 60,
            paddingLeft: "var(--spacing-lg)",
            paddingRight: "var(--spacing-md)",
            borderBottom: "1px solid var(--color-hairline)",
          }}
        >
          <span style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
            Key 详情
          </span>
          <button onClick={onClose} style={closeBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>

          {/* §5.1 Basic info */}
          <DrawerSection title="基本信息">
            <DrawerField label="Key 名称" value={keyData.name} />
            <DrawerField label="Key ID" value={keyData.mask} mono copyable />
            <div style={{ marginBottom: "var(--spacing-sm)", display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <button
                onClick={() => setShowFullKey(!showFullKey)}
                style={{ height: 30, padding: "0 var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                {showFullKey ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
                {showFullKey ? "隐藏" : "查看"}
              </button>
            </div>
            {showFullKey && (
              <div style={{ marginBottom: "var(--spacing-sm)" }}>
                <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>完整 Key</div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", padding: "6px var(--spacing-sm)" }}>
                  <code style={{ flex: 1, fontSize: "var(--text-caption)", fontFamily: "var(--font-mono)", color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis" }}>{keyData.fullKey}</code>
                  <button onClick={copyFullKey} style={{ height: 28, padding: "0 var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: keyCopied ? "var(--color-success)" : "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap" }}>{keyCopied ? "已复制" : "复制"}</button>
                </div>
              </div>
            )}
            <DrawerField label="归属" value={`${keyData.team} · ${keyData.member}`} />
            <DrawerField label="创建时间" value="2026-05-12 10:30:00" muted />
            <div style={{ marginTop: "var(--spacing-sm)", display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>状态</span>
              <StatusBadge status={keyData.status} />
              {!isEmployee && <button style={{ ...secondaryBtnStyle, marginLeft: "auto" }}>
                {keyData.status === "normal" ? "暂停" : "启用"}
              </button>}
            </div>
          </DrawerSection>

          {/* §5.2 Routing strategy — hidden for employees */}
          {!isEmployee && (
          <DrawerSection title="路由策略">
            <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: 4 }}>
              {keyData.routing}
            </div>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginBottom: "var(--spacing-sm)" }}>
              性价比优先 · 屏蔽 GPT-4.1 / Qwen-Max
            </div>
            <button style={secondaryBtnStyle}>更换策略</button>
          </DrawerSection>
          )}

          {/* §5.3 Rate limit — hidden for employees */}
          {!isEmployee && (
          <DrawerSection title="限速与风控">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              <FormRow label="QPS 上限" placeholder="30" />
              <FormRow label="日调用次数上限" placeholder="100000" />
              <FormRow label="日消耗额度上限 (Tokens)" placeholder="1000000" />
              <div>
                <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", display: "block", marginBottom: "var(--spacing-xs)" }}>超限行为</span>
                <div style={{ display: "flex", gap: "var(--spacing-lg)" }}>
                  <label style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", display: "flex", alignItems: "center", gap: "var(--spacing-xxs)", cursor: "pointer" }}>
                    <input type="radio" name="overlimit" defaultChecked style={{ cursor: "pointer" }} /> 仅拦截
                  </label>
                  <label style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", display: "flex", alignItems: "center", gap: "var(--spacing-xxs)", cursor: "pointer" }}>
                    <input type="radio" name="overlimit" style={{ cursor: "pointer" }} /> 拦截并发送通知
                  </label>
                </div>
              </div>
              <button style={{ ...primaryBtnStyle, alignSelf: "flex-start" }}>保存限速设置</button>
            </div>
          </DrawerSection>
          )}

          {/* §5.4 Statistics */}
          <DrawerSection title="统计概览">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
              <MiniStat label="近 7 天用量" value={keyData.usage} sub="+12.3%" up />
              <MiniStat label="近 7 天费用" value={keyData.cost} sub={keyData.costTrend} up={keyData.costTrend.startsWith("-")} />
              <MiniStat label="质量评分" value={`${keyData.qualityScore} 分`} sub="HLE 综合" />
              <MiniStat label="错误率" value={keyData.errorRate} sub={parseFloat(keyData.errorRate) < 1 ? "正常" : "偏高"} />
            </div>
            <div
              style={{
                marginTop: "var(--spacing-md)",
                height: 60,
                backgroundColor: "var(--color-surface-card)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-caption)",
                color: "var(--color-muted)",
              }}
            >
              用量趋势 Sparkline（占位）
            </div>
          </DrawerSection>

          {/* §5.5 Security actions — hidden for employees */}
          {!isEmployee && (
          <DrawerSection title="安全操作">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              <button style={secondaryBtnStyle}>更换</button>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: 0 }}>
                生成新 Key，旧 Key 在 24 小时后失效。
              </p>
              <button style={dangerBtnStyle}>立即失效旧 Key</button>
            </div>
          </DrawerSection>
          )}

        </div>
      </div>
    </>
  );
}

/* ================================================================
   Shared subcomponents
   ================================================================ */
function SearchInput() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 36,
        paddingLeft: "var(--spacing-sm)",
        paddingRight: "var(--spacing-sm)",
        gap: "var(--spacing-xs)",
        backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-body-sm)",
        color: "var(--color-muted)",
        minWidth: 200,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>搜索 Key 名称或 ID</span>
    </div>
  );
}

function SelectFilter({ options }: { options: string[] }) {
  return (
    <select style={selectStyle}>
      {options.map((opt) => (
        <option key={opt} value={opt === options[0] ? "" : opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: "var(--spacing-lg)",
        paddingBottom: "var(--spacing-lg)",
        borderBottom: "1px solid var(--color-hairline-soft)",
      }}
    >
      <h3
        style={{
          fontSize: "var(--text-title-sm)",
          fontWeight: 600,
          lineHeight: "var(--text-title-sm--line-height)",
          color: "var(--color-ink)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function DrawerField({
  label,
  value,
  mono,
  copyable,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)" }}>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", width: 72, flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: "var(--text-body-sm)",
          fontWeight: muted ? 400 : 500,
          color: muted ? "var(--color-muted)" : "var(--color-ink)",
          fontFamily: mono ? "var(--font-mono)" : undefined,
        }}
      >
        {value}
      </span>
      {copyable && <CopyButton />}
    </div>
  );
}

function FormRow({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", width: 160, flexShrink: 0 }}>{label}</span>
      <input
        placeholder={placeholder}
        style={{
          flex: 1,
          height: 36,
          paddingLeft: "var(--spacing-sm)",
          paddingRight: "var(--spacing-sm)",
          fontSize: "var(--text-body-sm)",
          color: "var(--color-ink)",
          backgroundColor: "var(--color-canvas)",
          border: "1px solid var(--color-hairline)",
          borderRadius: "var(--radius-md)",
          outline: "none",
        }}
      />
    </div>
  );
}

function MiniStat({ label, value, sub, up }: { label: string; value: string; sub: string; up?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{value}</div>
      <div style={{ fontSize: "var(--text-caption)", color: up !== undefined ? (up ? "var(--color-success)" : "var(--color-error)") : "var(--color-muted)", marginTop: 2 }}>
        {up !== undefined && (up ? "↑ " : "↓ ")}{sub}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-xxl)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: 240,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--color-surface-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      </div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>
        暂未创建调用 Key
      </span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginBottom: "var(--spacing-lg)" }}>
        创建第一个调用 Key，开始通过 AliAPI 接入模型调用。
      </span>
      <button style={primaryBtnStyle} onClick={() => window.location.href = "/keys/create"}>新建调用 Key</button>
    </div>
  );
}

function EmptyPlaceholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-xxl)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: 240,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--color-surface-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>{title}</span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>{desc}</span>
    </div>
  );
}

function Pagination({ total }: { total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
      <span>共 {total} 条</span>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xxs)" }}>
        <PageBtn disabled>上一页</PageBtn>
        <PageBtn active>1</PageBtn>
        <PageBtn disabled>下一页</PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      style={{
        height: 32,
        minWidth: 32,
        paddingLeft: "var(--spacing-xs)",
        paddingRight: "var(--spacing-xs)",
        fontSize: "var(--text-body-sm)",
        fontWeight: 500,
        color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)",
        backgroundColor: active ? "var(--color-primary)" : "transparent",
        border: active ? "none" : "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        padding: "var(--spacing-sm) var(--spacing-md)",
        fontSize: "var(--text-caption)",
        fontWeight: 500,
        color: "var(--color-muted)",
        textAlign: "left",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td
      style={{
        padding: "var(--spacing-sm) var(--spacing-md)",
        fontSize: "var(--text-body-sm)",
        lineHeight: 1.4,
        borderBottom: "1px solid var(--color-hairline-soft)",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; fg: string; bg: string }> = {
    normal: { label: "正常", fg: "var(--color-success)", bg: "#ECFDF5" },
    paused: { label: "暂停", fg: "var(--color-muted)", bg: "var(--color-surface-card)" },
    frozen: { label: "冻结", fg: "var(--color-error)", bg: "#FEF2F2" },
  };
  const s = map[status] ?? map.paused;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingLeft: "var(--spacing-xs)",
        paddingRight: "var(--spacing-xs)",
        fontSize: "var(--text-caption)",
        fontWeight: 500,
        lineHeight: "var(--text-caption--line-height)",
        color: s.fg,
        backgroundColor: s.bg,
        borderRadius: "var(--radius-sm)",
      }}
    >
      {s.label}
    </span>
  );
}

function QualityBadge({ score }: { score: number }) {
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
  const fg = score >= 90 ? "#047857" : score >= 80 ? "var(--color-success)" : score >= 70 ? "var(--color-warning)" : "var(--color-error)";
  const bg = score >= 90 ? "#ECFDF5" : score >= 80 ? "#F0FDF4" : score >= 70 ? "#FEF3C7" : "#FEF2F2";
  return (
    <span
      title={`质量评分 ${score}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 22,
        paddingLeft: "var(--spacing-xs)",
        paddingRight: "var(--spacing-xs)",
        fontSize: "var(--text-caption)",
        fontWeight: 600,
        color: fg,
        backgroundColor: bg,
        borderRadius: "var(--radius-sm)",
      }}
    >
      <span style={{ fontSize: 11 }}>{grade}</span>
      <span style={{ fontSize: 11, opacity: 0.7 }}>·</span>
      <span style={{ fontSize: 11, fontWeight: 500 }}>{score}</span>
    </span>
  );
}

function ErrorBadge({ rate }: { rate: string }) {
  const num = parseFloat(rate);
  const level = num < 0.5 ? "good" : num < 1.5 ? "ok" : "bad";
  const fg = level === "good" ? "var(--color-success)" : level === "ok" ? "var(--color-warning)" : "var(--color-error)";
  const bg = level === "good" ? "#ECFDF5" : level === "ok" ? "#FEF3C7" : "#FEF2F2";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingLeft: "var(--spacing-xs)",
        paddingRight: "var(--spacing-xs)",
        fontSize: "var(--text-caption)",
        fontWeight: 500,
        color: fg,
        backgroundColor: bg,
        borderRadius: "var(--radius-sm)",
        whiteSpace: "nowrap",
      }}
    >
      {rate}
    </span>
  );
}

function CopyButton() {
  return (
    <button
      style={{
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        color: "var(--color-muted)",
        borderRadius: "var(--radius-xs)",
        padding: 0,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-card)"; e.currentTarget.style.color = "var(--color-ink)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-muted)"; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

function ActionLink({ children, dim, onClick }: { children: React.ReactNode; dim?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: "var(--text-body-sm)",
        fontWeight: 500,
        color: dim ? "var(--color-muted)" : "var(--color-ink)",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "2px 4px",
        borderRadius: "var(--radius-xs)",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-card)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {children}
    </button>
  );
}

function BatchBtn({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      style={{
        height: 30,
        paddingLeft: "var(--spacing-sm)",
        paddingRight: "var(--spacing-sm)",
        fontSize: "var(--text-caption)",
        fontWeight: 500,
        color: danger ? "var(--color-error)" : "var(--color-ink)",
        backgroundColor: "var(--color-canvas)",
        border: `1px solid ${danger ? "var(--color-error)" : "var(--color-hairline)"}`,
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ================================================================
   Shared style constants
   ================================================================ */
const primaryBtnStyle: React.CSSProperties = {
  height: 40,
  paddingLeft: "var(--spacing-lg)",
  paddingRight: "var(--spacing-lg)",
  fontSize: "var(--text-button)",
  fontWeight: 600,
  lineHeight: "var(--text-button--line-height)",
  color: "var(--color-on-primary)",
  backgroundColor: "var(--color-primary)",
  border: "none",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const secondaryBtnStyle: React.CSSProperties = {
  height: 36,
  paddingLeft: "var(--spacing-md)",
  paddingRight: "var(--spacing-md)",
  fontSize: "var(--text-button)",
  fontWeight: 600,
  lineHeight: "var(--text-button--line-height)",
  color: "var(--color-ink)",
  backgroundColor: "var(--color-canvas)",
  border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
};

const dangerBtnStyle: React.CSSProperties = {
  height: 36,
  paddingLeft: "var(--spacing-md)",
  paddingRight: "var(--spacing-md)",
  fontSize: "var(--text-button)",
  fontWeight: 600,
  lineHeight: "var(--text-button--line-height)",
  color: "var(--color-error)",
  backgroundColor: "#FEF2F2",
  border: "1px solid var(--color-error)",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
};

const closeBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-full)",
  border: "none",
  backgroundColor: "transparent",
  color: "var(--color-muted)",
  cursor: "pointer",
};

const selectStyle: React.CSSProperties = {
  height: 36,
  paddingLeft: "var(--spacing-sm)",
  paddingRight: 32,
  fontSize: "var(--text-body-sm)",
  fontWeight: 400,
  color: "var(--color-body)",
  backgroundColor: "var(--color-canvas)",
  border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
};
