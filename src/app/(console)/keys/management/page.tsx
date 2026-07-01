"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";

/* ================================================================
   Mock data
   ================================================================ */
interface MgmtKey {
  id: string;
  name: string;
  mask: string;
  note: string;
  permission: string;
  ipWhitelist: string[];
  status: "enabled" | "disabled";
  createdAt: string;
  createdBy: string;
}

const MOCK_KEYS: MgmtKey[] = [
  {
    id: "mgmt-a1b2c3d4",
    name: "运维主 Key",
    mask: "mgmt-****d4e5",
    note: "CI/CD 自动部署使用",
    permission: "读写",
    ipWhitelist: ["10.0.0.0/8", "172.16.0.0/12"],
    status: "enabled",
    createdAt: "2026-01-15 09:30:00",
    createdBy: "张明",
  },
  {
    id: "mgmt-e5f6a7b8",
    name: "财务只读 Key",
    mask: "mgmt-****b8c9",
    note: "账单查询与导出",
    permission: "仅查账单",
    ipWhitelist: ["192.168.1.0/24"],
    status: "enabled",
    createdAt: "2026-03-22 14:00:00",
    createdBy: "李芳",
  },
  {
    id: "mgmt-c9d0e1f2",
    name: "测试环境管理 Key",
    mask: "mgmt-****f2a3",
    note: "仅测试环境使用",
    permission: "自定义（运维 + 账单）",
    ipWhitelist: [],
    status: "disabled",
    createdAt: "2026-02-10 16:45:00",
    createdBy: "王磊",
  },
  {
    id: "mgmt-3a4b5c6d",
    name: "系统集成 Key",
    mask: "mgmt-****6d7e",
    note: "第三方监控接入",
    permission: "只读",
    ipWhitelist: ["203.0.113.0/24"],
    status: "enabled",
    createdAt: "2026-05-08 11:20:00",
    createdBy: "陈静",
  },
];

/* ================================================================
   Permission options for Drawer
   ================================================================ */
const PERMISSION_OPTIONS = ["只读", "读写", "仅查账单", "自定义"] as const;

const CUSTOM_PERMISSIONS = [
  { key: "billing", label: "查看账单 & 流水" },
  { key: "team", label: "管理团队 & 员工" },
  { key: "notify", label: "配置通知与告警" },
  { key: "keys", label: "管理 Key & 路由策略" },
] as const;

/* ================================================================
   Page
   ================================================================ */
export default function MgmtKeysPage() {
  const [detailKey, setDetailKey] = useState<MgmtKey | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  return (
    <div>
      {/* Page Header */}
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
          {getRouteTitle("/keys/management")}
        </h1>
        <p
          style={{
            marginTop: "var(--spacing-xs)",
            fontSize: "var(--text-body-sm)",
            lineHeight: "var(--text-body-sm--line-height)",
            color: "var(--color-muted)",
          }}
        >
          配置仅用于访问 ALiAPI 管理接口的密钥，不参与业务调用计费，适合运维、财务和系统集成场景。
        </p>
      </div>

      {/* Batch action bar */}
      {selectedIds.size > 0 && (
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
            <BatchBtn>批量禁用</BatchBtn>
            <BatchBtn>批量更改权限</BatchBtn>
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
          <SearchBox placeholder="搜索管理 Key 名称或 ID" />
          <SelectF options={["全部权限", "只读", "读写", "仅查账单", "自定义"]} />
          <SelectF options={["全部状态", "启用", "禁用"]} />
          <SelectF options={["全部 IP", "已配置白名单", "未配置白名单"]} />
        </div>

        <button style={primaryBtn}>新建管理 Key</button>
      </div>

      {/* Table */}
      <MgmtKeyTable
        data={MOCK_KEYS}
        selectedIds={selectedIds}
        onSelect={(id, checked) => {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id); else next.delete(id);
            return next;
          });
        }}
        onSelectAll={(checked) => {
          setSelectedIds(checked ? new Set(MOCK_KEYS.map((k) => k.id)) : new Set());
        }}
        onViewDetail={setDetailKey}
      />

      {/* Pagination */}
      <Pagi total={MOCK_KEYS.length} />

      {/* Detail Drawer */}
      <MgmtKeyDrawer keyData={detailKey} onClose={() => setDetailKey(null)} />
    </div>
  );
}

/* ================================================================
   Table — 7 columns per spec §3.3.1
   ================================================================ */
function MgmtKeyTable({
  data,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetail,
}: {
  data: MgmtKey[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onViewDetail: (k: MgmtKey) => void;
}) {
  if (data.length === 0) return <EmptyState />;

  const allSelected = data.length > 0 && data.every((k) => selectedIds.has(k.id));
  const someSelected = data.some((k) => selectedIds.has(k.id));

  return (
    <div
      style={{
        backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-lg)",
        overflow: "auto",
      }}
    >
      <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <Th w={40} center>
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                onChange={(e) => onSelectAll(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
            </Th>
            <Th>名称 / ID</Th>
            <Th>权限范围</Th>
            <Th>IP 白名单</Th>
            <Th>创建时间</Th>
            <Th>状态</Th>
            <Th right>操作</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={{ height: 44 }}>
              <Td center>
                <input
                  type="checkbox"
                  checked={selectedIds.has(row.id)}
                  onChange={(e) => onSelect(row.id, e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
              </Td>
              <Td>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>
                    {row.name}
                  </span>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>
                    ID: {row.mask}
                  </span>
                </div>
              </Td>
              <Td><PermBadge p={row.permission} /></Td>
              <Td>
                <span className="truncate" style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", maxWidth: 140, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.ipWhitelist.join(", ") || "不限 IP"}>
                  {row.ipWhitelist.length > 0
                    ? row.ipWhitelist.length === 1
                      ? row.ipWhitelist[0]
                      : `${row.ipWhitelist[0]} +${row.ipWhitelist.length - 1}`
                    : "不限 IP"}
                </span>
              </Td>
              <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                {row.createdAt}
              </Td>
              <Td><StatusBadge status={row.status} /></Td>
              <Td right>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                  <ALink onClick={() => onViewDetail(row)}>查看详情</ALink>
                  <ALink>编辑</ALink>
                  <ALink>{row.status === "enabled" ? "禁用" : "启用"}</ALink>
                  <ALink dim>重置密钥</ALink>
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
   Detail Drawer — 4 sections
   ================================================================ */
function MgmtKeyDrawer({ keyData, onClose }: { keyData: MgmtKey | null; onClose: () => void }) {
  if (!keyData) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />

      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 480,
          maxWidth: "100vw",
          backgroundColor: "var(--color-canvas)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            height: 60,
            paddingLeft: "var(--spacing-lg)",
            paddingRight: "var(--spacing-md)",
            borderBottom: "1px solid var(--color-hairline)",
          }}
        >
          <div>
            <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
              管理 Key 详情
            </div>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>
              ID: {keyData.mask} · <StatusBadge status={keyData.status} />
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>

          {/* §4.2.1 Basic info */}
          <Section title="基本信息">
            <Field label="Key 名称" value={keyData.name} />
            <Field label="备注" value={keyData.note} muted />
            <Field label="Key ID" value={keyData.mask} mono copy />
            <Field label="创建时间" value={keyData.createdAt} muted />
            <Field label="创建人" value={keyData.createdBy} muted />
            <div style={{ marginTop: "var(--spacing-sm)", display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)" }}>状态</span>
              <StatusBadge status={keyData.status} />
              <button style={secondaryBtn} onClick={() => {}}>
                {keyData.status === "enabled" ? "禁用" : "启用"}
              </button>
            </div>
          </Section>

          {/* §4.2.2 Permission */}
          <Section title="权限范围">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
              {PERMISSION_OPTIONS.map((opt) => {
                const active = keyData.permission.startsWith(opt);
                return (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", cursor: "pointer", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", padding: "2px 0" }}>
                    <input type="radio" name="permission" defaultChecked={active} style={{ cursor: "pointer" }} />
                    <span>{opt}</span>
                    <PermDesc opt={opt} />
                  </label>
                );
              })}
            </div>
            {/* Custom sub-options when 自定义 is selected */}
            {keyData.permission.startsWith("自定义") && (
              <div style={{ marginTop: "var(--spacing-sm)", marginLeft: 22, display: "flex", flexDirection: "column", gap: "var(--spacing-xxs)" }}>
                {CUSTOM_PERMISSIONS.map((cp) => (
                  <label key={cp.key} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", cursor: "pointer", fontSize: "var(--text-caption)", color: "var(--color-body)" }}>
                    <input type="checkbox" defaultChecked style={{ cursor: "pointer" }} />
                    {cp.label}
                  </label>
                ))}
              </div>
            )}
            <button style={{ ...primaryBtn, marginTop: "var(--spacing-md)" }}>保存权限</button>
          </Section>

          {/* §4.2.3 IP whitelist */}
          <Section title="IP 白名单">
            <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: 0, marginBottom: "var(--spacing-sm)" }}>
              仅允许以下 IP / 网段访问管理 API。为空时表示不限制 IP。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
              {keyData.ipWhitelist.length > 0 ? (
                keyData.ipWhitelist.map((ip, i) => (
                  <IpRow key={i} ip={ip} />
                ))
              ) : (
                <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", padding: "var(--spacing-sm) 0" }}>
                  暂无限制（允许所有 IP 访问）
                </div>
              )}
            </div>
            <button style={{ ...secondaryBtn, marginTop: "var(--spacing-sm)" }}>新增 IP</button>
          </Section>

          {/* §4.2.4 Security */}
          <Section title="安全操作">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              <div>
                <button style={secondaryBtn}>重置密钥</button>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: "4px 0 0" }}>
                  生成新的管理 Key，旧 Key 将立即失效。
                </p>
              </div>
              <div>
                <button style={dangerBtn}>吊销 Key</button>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", margin: "4px 0 0" }}>
                  彻底禁用该管理 Key，不可恢复。
                </p>
              </div>
            </div>
          </Section>

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
      <span>{placeholder}</span>
    </div>
  );
}

function SelectF({ options }: { options: string[] }) {
  return (
    <select style={selectS}>
      {options.map((opt) => (
        <option key={opt} value={opt === options[0] ? "" : opt}>{opt}</option>
      ))}
    </select>
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
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
        </svg>
      </div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>暂未创建管理 Key</span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginBottom: "var(--spacing-lg)" }}>创建管理 Key，以便对接自动化运维、账单查询和系统集成。</span>
      <button style={primaryBtn}>新建管理 Key</button>
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
    <button
      disabled={disabled}
      style={{
        height: 32, minWidth: 32,
        paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)",
        fontSize: "var(--text-body-sm)", fontWeight: 500,
        color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)",
        backgroundColor: active ? "var(--color-primary)" : "transparent",
        border: active ? "none" : "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-sm)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
      <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, lineHeight: "var(--text-title-sm--line-height)", color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value, mono, copy, muted }: { label: string; value: string; mono?: boolean; copy?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)" }}>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", width: 72, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "var(--text-body-sm)", fontWeight: muted ? 400 : 500, color: muted ? "var(--color-muted)" : "var(--color-ink)", fontFamily: mono ? "var(--font-mono)" : undefined }}>
        {value}
      </span>
      {copy && <CpBtn />}
    </div>
  );
}

function IpRow({ ip }: { ip: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
      <input
        defaultValue={ip}
        style={{
          flex: 1, height: 36,
          paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)",
          fontSize: "var(--text-body-sm)", color: "var(--color-ink)",
          backgroundColor: "var(--color-canvas)",
          border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none",
        }}
      />
      <button style={{
        width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)",
        backgroundColor: "var(--color-canvas)", color: "var(--color-muted)", cursor: "pointer",
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function PermBadge({ p }: { p: string }) {
  let fg = "#6B7280"; let bg = "#F3F4F6";
  if (p.startsWith("读写")) { fg = "#2563EB"; bg = "#EFF6FF"; }
  else if (p.startsWith("只读")) { fg = "#059669"; bg = "#ECFDF5"; }
  else if (p.startsWith("仅查账单")) { fg = "#7C3AED"; bg = "#F5F3FF"; }
  else if (p.startsWith("自定义")) { fg = "#D97706"; bg = "#FFFBEB"; }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", height: 22,
      paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)",
      fontSize: "var(--text-caption)", fontWeight: 500, lineHeight: "var(--text-caption--line-height)",
      color: fg, backgroundColor: bg, borderRadius: "var(--radius-sm)",
    }}>
      {p}
    </span>
  );
}

function PermDesc({ opt }: { opt: string }) {
  const m: Record<string, string> = {
    "只读": "仅查看配置与账单",
    "读写": "查看与修改配置",
    "仅查账单": "仅查看账单与流水",
    "自定义": "按需勾选下方权限",
  };
  return (
    <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginLeft: 4 }}>{m[opt] ?? ""}</span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const a = status === "enabled";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", height: 22,
      paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)",
      fontSize: "var(--text-caption)", fontWeight: 500, lineHeight: "var(--text-caption--line-height)",
      color: a ? "var(--color-success)" : "var(--color-muted)",
      backgroundColor: a ? "#ECFDF5" : "var(--color-surface-card)",
      borderRadius: "var(--radius-sm)",
    }}>
      {a ? "启用" : "禁用"}
    </span>
  );
}

function CpBtn() {
  return (
    <button style={{
      width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
      border: "none", backgroundColor: "transparent", cursor: "pointer",
      color: "var(--color-muted)", borderRadius: "var(--radius-xs)", padding: 0, flexShrink: 0,
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

function ALink({ children, dim, onClick }: { children: React.ReactNode; dim?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: "var(--text-body-sm)", fontWeight: 500,
        color: dim ? "var(--color-muted)" : "var(--color-ink)",
        backgroundColor: "transparent", border: "none", cursor: "pointer",
        padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-card)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {children}
    </button>
  );
}

function BatchBtn({ children }: { children: React.ReactNode }) {
  return (
    <button style={{
      height: 30, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)",
      fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)",
      backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)",
      borderRadius: "var(--radius-sm)", cursor: "pointer",
    }}>
      {children}
    </button>
  );
}

/* ================================================================
   Table cell helpers
   ================================================================ */
function Th({ children, w, center, right }: { children: React.ReactNode; w?: number; center?: boolean; right?: boolean }) {
  return (
    <th style={{
      padding: "var(--spacing-sm) var(--spacing-md)",
      fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)",
      textAlign: center ? "center" : right ? "right" : "left",
      whiteSpace: "nowrap", width: w,
    }}>
      {children}
    </th>
  );
}

function Td({ children, center, right, style }: { children: React.ReactNode; center?: boolean; right?: boolean; style?: React.CSSProperties }) {
  return (
    <td style={{
      padding: "var(--spacing-sm) var(--spacing-md)",
      fontSize: "var(--text-body-sm)", lineHeight: 1.4,
      borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle",
      textAlign: center ? "center" : right ? "right" : "left",
      ...style,
    }}>
      {children}
    </td>
  );
}

/* ================================================================
   Style constants
   ================================================================ */
const primaryBtn: React.CSSProperties = {
  height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)",
  fontSize: "var(--text-button)", fontWeight: 600, lineHeight: "var(--text-button--line-height)",
  color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)",
  border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap",
};

const secondaryBtn: React.CSSProperties = {
  height: 36, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)",
  fontSize: "var(--text-button)", fontWeight: 600, lineHeight: "var(--text-button--line-height)",
  color: "var(--color-ink)", backgroundColor: "var(--color-canvas)",
  border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  height: 36, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)",
  fontSize: "var(--text-button)", fontWeight: 600, lineHeight: "var(--text-button--line-height)",
  color: "var(--color-error)", backgroundColor: "#FEF2F2",
  border: "1px solid var(--color-error)", borderRadius: "var(--radius-md)", cursor: "pointer",
};

const closeBtn: React.CSSProperties = {
  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: "var(--radius-full)", border: "none", backgroundColor: "transparent",
  color: "var(--color-muted)", cursor: "pointer",
};

const selectS: React.CSSProperties = {
  height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32,
  fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)",
  backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
};
