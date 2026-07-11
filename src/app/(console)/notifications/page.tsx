"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRouteTitle } from "@/config/titles";

/* ================================================================
   Mock data
   ================================================================ */
interface Notification {
  id: string; time: string; title: string; summary: string; type: string; read: boolean;
  detail: string; actionLabel: string; actionLink: string;
}

const MOCK: Notification[] = [
  { id: "n1", time: "2026-06-26 14:32", title: "账户余额不足预警", summary: "您的账户余额已低于 ¥1,000，请及时充值以免影响业务调用。", type: "额度预警", read: false, detail: "截至 2026-06-26 14:32，账户可用余额为 ¥856.30，已低于设定预警阈值 ¥1,000。建议立即充值以确保业务连续性。当前日均消耗约 ¥200，预计剩余额度可支撑约 4 天。", actionLabel: "前往充值", actionLink: "/billing" },
  { id: "n2", time: "2026-06-26 10:15", title: "保险补偿已到账", summary: "因网关超时产生的保险补偿 ¥68.00 已返还至您的账户。", type: "补偿到账", read: false, detail: "补偿记录详情：\n补偿记录 ID：CMP-0042\n补偿原因：网关超时\n原始消耗：2,450 Tokens / ¥0.068\n补偿额度：¥68.00 / 6,800 Tokens\n补偿方式：额度返还\n到账时间：2026-06-26 10:15", actionLabel: "查看补偿记录", actionLink: "/observability" },
  { id: "n3", time: "2026-06-25 18:00", title: "系统公告：v2.3.0 版本更新", summary: "limAPI v2.3.0 已发布，新增 Auto 路由权重配置、HLE 自定义评测等功能。", type: "公告", read: true, detail: "更新内容：\n1. Auto 路由中心新增权重配置\n2. HLE 质量检测新增手动评测入口\n3. 模型广场上线\n4. 预算与计费管理页面开放\n5. 修复了若干已知问题", actionLabel: "查看更新日志", actionLink: "#" },
  { id: "n4", time: "2026-06-25 09:00", title: "自动充值失败提醒", summary: "6 月 25 日的自动充值失败，原因：对公转账未到账，请检查付款状态。", type: "自动充值", read: true, detail: "计划充值金额：¥2,000\n计划触发时间：2026-06-25 09:00\n失败原因：对公转账未在 24 小时内到账\n当前余额：¥856.30\n建议处理方式：手动发起充值或更换支付方式。", actionLabel: "查看设置", actionLink: "/billing/budget" },
  { id: "n5", time: "2026-06-24 15:20", title: "奖励额度即将过期", summary: "您的 ¥320.00 首充奖励额度将于 7 月 15 日过期，请尽快使用。", type: "临期额度", read: true, detail: "额度类型：首充奖励\n剩余额度：¥320.00 / 32,000 Tokens\n到期时间：2026-07-15\n适用范围：仅调用费用\n建议尽早使用即将过期的奖励额度，避免浪费。", actionLabel: "查看额度明细", actionLink: "/billing" },
  { id: "n6", time: "2026-06-23 11:00", title: "调用 Key 即将过期", summary: "调用 Key「测试环境 Key」将在 7 天后过期，请及时续期或创建新 Key。", type: "其他", read: true, detail: "Key 名称：测试环境 Key\nKey ID：sk-7c1a5f3e\n过期时间：2026-07-01\n状态：已暂停\n请前往调用 Key 管理页面进行续期操作。", actionLabel: "前往 Key 管理", actionLink: "/keys" },
];

const TYPES = ["全部类型", "公告", "额度预警", "补偿到账", "自动充值", "临期额度", "其他"];

/* ================================================================
   Page
   ================================================================ */
export default function NotificationsPage() {
  const [type, setType] = useState("全部类型");
  const [status, setStatus] = useState("全部");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Notification | null>(null);
  const [data, setData] = useState(MOCK);

  const markAllRead = () => setData((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setData((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  let filtered = data;
  if (type !== "全部类型") filtered = filtered.filter((n) => n.type === type);
  if (status === "未读") filtered = filtered.filter((n) => !n.read);
  if (status === "已读") filtered = filtered.filter((n) => n.read);
  if (search) filtered = filtered.filter((n) => n.title.includes(search));

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={h1Style}>{getRouteTitle("/notifications")}</h1>
        <p style={subStyle}>查看系统通知与告警，及时处理额度预警、充值提醒等重要信息。</p>
      </div>

      <div style={toolbarStyle}>
        <div style={filterGroupStyle}>
          <Sel value={type} onChange={setType} options={TYPES} />
          <Sel value={status} onChange={setStatus} options={["全部", "未读", "已读"]} />
          <div style={searchBoxStyle}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索标题关键词" style={searchInputStyle} />
          </div>
        </div>
        <button onClick={markAllRead} style={secBtn}>全部标为已读</button>
      </div>

      {filtered.length === 0 ? (
        <div style={emptyStyle}>暂无符合条件的通知</div>
      ) : (
        <div style={listContainerStyle}>
          {filtered.map((n) => (
            <div key={n.id}
              onClick={() => { if (!n.read) markRead(n.id); setDetail(n); }}
              style={{ ...rowBaseStyle, backgroundColor: n.read ? "transparent" : CSS_SURFACE_SOFT }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = n.read ? CSS_SURFACE_SOFT : "#EEF0F2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.read ? "transparent" : CSS_SURFACE_SOFT; }}
            >
              <div style={{ ...unreadDotStyle, backgroundColor: n.read ? "transparent" : CSS_BRAND }} />
              <div style={flex1Style}>
                <div style={titleRowStyle}>
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: n.read ? 500 : 600, color: "var(--color-ink)" }}>{n.title}</span>
                  <TypeTag type={n.type} />
                </div>
                <div style={summaryStyle}>{n.summary}</div>
              </div>
              <span style={timeStyle}>{n.time}</span>
            </div>
          ))}
        </div>
      )}

      <Pagi total={filtered.length} />
      <DetailDrawer data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ================================================================
   Detail Drawer
   ================================================================ */
function DetailDrawer({ data, onClose }: { data: Notification | null; onClose: () => void }) {
  const router = useRouter();
  if (!data) return null;
  return (
    <>
      <div className="fixed inset-0 z-50" style={backdropStyle} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={drawerStyle}>
        <div className="flex items-center justify-between shrink-0" style={drawerHeaderStyle}>
          <span style={drawerTitleStyle}>通知详情</span>
          <button onClick={onClose} style={closeBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={drawerBodyStyle}>
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <h2 style={detailTitleStyle}>{data.title}</h2>
            <div style={detailMetaStyle}>
              <TypeTag type={data.type} />
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{data.time}</span>
            </div>
          </div>
          <div style={detailContentStyle}>{data.detail}</div>
          <button onClick={() => { onClose(); router.push(data.actionLink); }} style={{ ...prBtn, width: "100%" }}>{data.actionLabel}</button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Shared
   ================================================================ */
function TypeTag({ type }: { type: string }) {
  const m: Record<string, string> = {
    "公告": "#2563EB", "额度预警": "#D97706", "补偿到账": "#059669",
    "自动充值": "#7C3AED", "临期额度": "#EC4899", "其他": "#6B7280",
  };
  const fg = m[type] ?? "#6B7280";
  const bg = fg + "18";
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: fg, backgroundColor: bg, borderRadius: "var(--radius-sm)", whiteSpace: "nowrap" }}>{type}</span>;
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={selS}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}

function Pagi({ total }: { total: number }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}><span>共 {total} 条通知</span><div style={{ display: "flex", gap: "var(--spacing-xxs)" }}><PageBtn disabled>上一页</PageBtn><PageBtn active>1</PageBtn><PageBtn disabled>下一页</PageBtn></div></div>;
}

function PageBtn({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return <button disabled={disabled} style={{ height: 32, minWidth: 32, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)", backgroundColor: active ? "var(--color-primary)" : "transparent", border: active ? "none" : "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}

/* Style constants */
const CSS_SURFACE_SOFT = "#F8F9FA";
const CSS_BRAND = "var(--color-brand-accent)";

const h1Style: React.CSSProperties = { fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" };
const subStyle: React.CSSProperties = { marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" };
const toolbarStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" };
const filterGroupStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" };
const searchBoxStyle: React.CSSProperties = { display: "flex", alignItems: "center", height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", gap: "var(--spacing-xs)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", minWidth: 180 };
const searchInputStyle: React.CSSProperties = { border: "none", background: "none", outline: "none", flex: 1, fontSize: "var(--text-body-sm)", color: "var(--color-ink)" };
const emptyStyle: React.CSSProperties = { backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", textAlign: "center", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" };
const listContainerStyle: React.CSSProperties = { backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" };
const rowBaseStyle: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: "var(--spacing-md)", padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)", cursor: "pointer", transition: "background 0.1s" };
const unreadDotStyle: React.CSSProperties = { width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6 };
const flex1Style: React.CSSProperties = { flex: 1, minWidth: 0 };
const titleRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: 4 };
const summaryStyle: React.CSSProperties = { fontSize: "var(--text-caption)", color: "var(--color-muted)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const timeStyle: React.CSSProperties = { fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 };

const backdropStyle: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.2)" };
const drawerStyle: React.CSSProperties = { width: 480, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" };
const drawerHeaderStyle: React.CSSProperties = { height: 60, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" };
const drawerTitleStyle: React.CSSProperties = { fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" };
const drawerBodyStyle: React.CSSProperties = { padding: "var(--spacing-lg)" };
const detailTitleStyle: React.CSSProperties = { fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-sm)" };
const detailMetaStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "var(--spacing-sm)" };
const detailContentStyle: React.CSSProperties = { fontSize: "var(--text-body-sm)", color: "var(--color-body)", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: "var(--spacing-xl)" };
const closeBtnStyle: React.CSSProperties = { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" };

const prBtn: React.CSSProperties = { height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };
const secBtn: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };
const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
