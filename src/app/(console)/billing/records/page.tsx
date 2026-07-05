"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";

/* ================================================================
   Mock data
   ================================================================ */
interface TxRow {
  id: string;
  time: string;
  type: string;
  assetType: string;
  tokens: string;
  amount: string;
  related: string;
  status: "success" | "pending" | "failed";
  balanceBefore: string;
  balanceAfter: string;
  orderNo?: string;
  payMethod?: string;
  requestId?: string;
  apiKey?: string;
  model?: string;
  inviter?: string;
  invitee?: string;
  compensationId?: string;
  compensationReason?: string;
  completedAt?: string;
}

const MOCK_TXNS: TxRow[] = [
  {
    id: "tx-001", time: "2026-06-26 14:32:10", type: "充值", assetType: "本金", tokens: "+500,000 Tokens", amount: "+¥ 5,000.00",
    related: "订单号: ORD-0626-001", status: "success", balanceBefore: "¥ 7,340.50", balanceAfter: "¥ 12,340.50",
    orderNo: "ORD-0626-001", payMethod: "对公转账", completedAt: "2026-06-26 14:32:10",
  },
  {
    id: "tx-002", time: "2026-06-26 12:15:33", type: "调用扣费", assetType: "本金", tokens: "-12,500 Tokens", amount: "-¥ 125.00",
    related: "请求 ID: req-a1b2c3", status: "success", balanceBefore: "¥ 7,465.50", balanceAfter: "¥ 7,340.50",
    requestId: "req-a1b2c3", apiKey: "生产环境主 Key", model: "DeepSeek V3",
  },
  {
    id: "tx-003", time: "2026-06-26 10:08:22", type: "保险补偿", assetType: "补偿", tokens: "+8,400 Tokens", amount: "+¥ 84.00",
    related: "补偿记录: CMP-0032", status: "success", balanceBefore: "¥ 7,381.50", balanceAfter: "¥ 7,465.50",
    compensationId: "CMP-0032", compensationReason: "网关超时 / 熔断触发", requestId: "req-d4e5f6", apiKey: "客服机器人 Key",
  },
  {
    id: "tx-004", time: "2026-06-25 18:42:00", type: "邀请奖励", assetType: "邀请", tokens: "+50,000 Tokens", amount: "+¥ 500.00",
    related: "邀请用户: zhang@example.com", status: "success", balanceBefore: "¥ 6,881.50", balanceAfter: "¥ 7,381.50",
    inviter: "张明", invitee: "zhang@example.com", completedAt: "2026-06-25 18:42:00",
  },
  {
    id: "tx-005", time: "2026-06-25 09:15:44", type: "调用扣费", assetType: "奖励", tokens: "-4,200 Tokens", amount: "-¥ 42.00",
    related: "请求 ID: req-g7h8i9", status: "success", balanceBefore: "¥ 6,923.50", balanceAfter: "¥ 6,881.50",
    requestId: "req-g7h8i9", apiKey: "投放分析 Key", model: "通义千问 Max",
  },
  {
    id: "tx-006", time: "2026-06-24 15:30:00", type: "手工调整", assetType: "本金", tokens: "-10,000 Tokens", amount: "-¥ 100.00",
    related: "—", status: "success", balanceBefore: "¥ 7,023.50", balanceAfter: "¥ 6,923.50",
    completedAt: "2026-06-24 15:30:00",
  },
  {
    id: "tx-007", time: "2026-06-24 11:00:00", type: "充值", assetType: "本金", tokens: "+200,000 Tokens", amount: "+¥ 2,000.00",
    related: "订单号: ORD-0624-002", status: "pending", balanceBefore: "¥ 5,023.50", balanceAfter: "—",
    orderNo: "ORD-0624-002", payMethod: "支付宝",
  },
  {
    id: "tx-008", time: "2026-06-23 08:55:12", type: "奖励", assetType: "奖励", tokens: "+30,000 Tokens", amount: "+¥ 300.00",
    related: "首充赠送", status: "success", balanceBefore: "¥ 4,723.50", balanceAfter: "¥ 5,023.50",
    completedAt: "2026-06-23 08:55:12",
  },
];

/* ================================================================
   Page
   ================================================================ */
export default function BillingRecordsPage() {
  const [tab, setTab] = useState("transactions");
  const [detail, setDetail] = useState<TxRow | null>(null);
  const [invDetail, setInvDetail] = useState<typeof MOCK_INVOICES[number] | null>(null);

  const tabItems = [
    { key: "transactions", label: "交易流水", content: null },
    { key: "invoices", label: "账单 & 发票", content: null },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/billing/records")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", lineHeight: "var(--text-body-sm--line-height)", color: "var(--color-muted)" }}>
          查看所有额度变动记录，支持按类型、资产来源和支付方式筛选，用于财务对账与审计。
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Tabs tabs={tabItems} activeKey={tab} onChange={setTab} />
      </div>

      {/* Tab: 交易流水 */}
      {tab === "transactions" && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
              <Sel options={["最近 7 日", "本月", "近 30 日", "自定义"]} />
              <Sel options={["全部类型", "充值", "调用扣费", "保险补偿", "奖励", "邀请", "手工调整"]} />
              <Sel options={["全部资产", "本金", "奖励", "补偿", "邀请"]} />
              <Sel options={["全部团队", "AI 平台部", "客服中心", "产品研发", "增长与投放", "数据平台"]} />
              <Sel options={["全部方式", "微信", "支付宝", "对公", "其他"]} />
            </div>
            <button style={secondaryBtn}>导出当前筛选结果</button>
          </div>

          {/* Table */}
          <TxTable data={MOCK_TXNS} onView={setDetail} />
          <Pagi total={MOCK_TXNS.length} />
        </>
      )}

      {/* Tab: 账单 & 发票 (placeholder) */}
      {tab === "invoices" && <InvoicesTab onViewDetail={setInvDetail} />}

      {/* Detail Drawers */}
      <TxDrawer data={detail} onClose={() => setDetail(null)} />
      <InvDetailDrawer data={invDetail} onClose={() => setInvDetail(null)} />
    </div>
  );
}

/* ================================================================
   Transaction Table
   ================================================================ */
function breakDownTitle(amount: string) {
  const val = parseFloat(amount.replace(/[¥,+\-]/g, "")) || 0;
  const native = val / 1.05;
  const fee = val - native;
  return `原生成本 ¥ ${native.toFixed(4)} | 平台费 ¥ ${fee.toFixed(4)} | 总价 ¥ ${val.toFixed(4)}`;
}

function TxTable({ data, onView }: { data: TxRow[]; onView: (r: TxRow) => void }) {
  if (data.length === 0) return <EmptyState />;

  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
      <table style={{ width: "100%", minWidth: 850, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <Th>时间</Th><Th>流水类型</Th><Th>资产类型</Th><Th>金额</Th><Th>关联对象</Th><Th>状态</Th><Th right>操作</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} style={{ height: 44 }}>
              <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", whiteSpace: "nowrap" }}>{r.time}</Td>
              <Td><TxTypeBadge type={r.type} /></Td>
              <Td><AssetBadge type={r.assetType} /></Td>
              <Td>
                <div style={{ display: "flex", flexDirection: "column", position: "relative", cursor: r.type === "调用扣费" ? "help" : "default" }} title={r.type === "调用扣费" ? breakDownTitle(r.amount) : undefined}>
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: r.amount.startsWith("-") ? "var(--color-ink)" : "var(--color-success)" }}>{r.amount}</span>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 1 }}>{r.tokens}</span>
                </div>
              </Td>
              <Td style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.related}</Td>
              <Td><StatusBadge status={r.status} /></Td>
              <Td right>
                <ALink onClick={() => onView(r)}>查看详情</ALink>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Detail Drawer
   ================================================================ */
function TxDrawer({ data, onClose }: { data: TxRow | null; onClose: () => void }) {
  if (!data) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 480, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ height: 60, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div>
            <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>流水详情</div>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>
              类型：{data.type} · <StatusBadge status={data.status} /> · {data.time}
            </div>
          </div>
          <ButXn onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></ButXn>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
          {/* 基本信息 */}
          <Sect title="基本信息">
            <Fld label="流水类型"><TxTypeBadge type={data.type} /></Fld>
            <Fld label="资产类型"><AssetBadge type={data.assetType} /></Fld>
            <Fld label="状态"><StatusBadge status={data.status} /></Fld>
            <Fld label="创建时间" value={data.time} />
            {data.completedAt && <Fld label="完成时间" value={data.completedAt} />}
          </Sect>

          {/* 金额与资产变动 */}
          <Sect title="金额与资产变动">
            <Fld label="变动 Tokens" value={data.tokens} />
            <Fld label="变动金额" value={data.amount} />
            {data.type === "调用扣费" && <FeeBreakdown amount={data.amount} />}
            <Fld label="变动前余额" value={data.balanceBefore} />
            <Fld label="变动后余额" value={data.balanceAfter} muted />
          </Sect>

          {/* 关联信息 */}
          <Sect title="关联信息">
            {data.requestId && <Fld label="请求 ID" value={data.requestId} mono />}
            {data.apiKey && <Fld label="关联 Key" value={data.apiKey} />}
            {data.model && <Fld label="模型 & 供应商" value={data.model} />}
            {data.orderNo && <Fld label="订单号" value={data.orderNo} />}
            {data.payMethod && <Fld label="支付方式" value={data.payMethod} />}
            {data.inviter && <Fld label="邀请人" value={data.inviter} />}
            {data.invitee && <Fld label="邀请对象" value={data.invitee} />}
            {!data.requestId && !data.orderNo && !data.inviter && <Fld label="关联" value={data.related} />}

            {data.requestId && (
              <button style={{ ...secondaryBtn, marginTop: "var(--spacing-sm)" }}>查看请求日志 →</button>
            )}
          </Sect>

          {/* 补偿信息 (条件) */}
          {data.type === "保险补偿" && data.compensationId && (
            <Sect title="补偿详情" last>
              <Fld label="补偿记录 ID" value={data.compensationId} />
              {data.compensationReason && <Fld label="补偿原因" value={data.compensationReason} />}
              <Fld label="原始消耗" value={data.balanceBefore} muted />
              <button style={{ ...secondaryBtn, marginTop: "var(--spacing-sm)" }}>查看补偿中心记录 →</button>
            </Sect>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Invoices Tab — full implementation per spec §3.7
   ================================================================ */
const PERIOD_OPTIONS = ["2026-06", "2026-05", "2026-04", "2026-03"];
const MOCK_INVOICES = [
  { id: "inv-001", period: "2026-06", amount: "¥ 8,000.00", taxExcl: "¥ 7,079.65", tax: "¥ 920.35", type: "增值税专用发票", status: "已开票", invoiceDate: "2026-06-20", download: true },
  { id: "inv-002", period: "2026-05", amount: "¥ 6,500.00", taxExcl: "¥ 5,752.21", tax: "¥ 747.79", type: "增值税普通发票", status: "已寄出", invoiceDate: "2026-05-18", download: true },
  { id: "inv-003", period: "2026-04", amount: "¥ 4,200.00", taxExcl: "¥ 3,716.81", tax: "¥ 483.19", type: "电子发票", status: "已开票", invoiceDate: "2026-04-22", download: true },
  { id: "inv-004", period: "2026-06", amount: "¥ 1,200.00", taxExcl: "¥ 1,061.95", tax: "¥ 138.05", type: "增值税普通发票", status: "待审核", invoiceDate: "", download: false },
  { id: "inv-005", period: "2026-03", amount: "¥ 3,000.00", taxExcl: "¥ 2,654.87", tax: "¥ 345.13", type: "增值税专用发票", status: "已作废", invoiceDate: "2026-03-10", download: false },
];

function InvoicesTab({ onViewDetail }: { onViewDetail: (inv: typeof MOCK_INVOICES[number]) => void }) {
  const [period, setPeriod] = useState("2026-06");

  return (
    <div>
      {/* === Period selector row === */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-md)", flexWrap: "wrap", gap: "var(--spacing-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
          <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-body)" }}>账期</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ ...selS, width: 140 }}>
            {PERIOD_OPTIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>数据按自然月汇总</span>
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <button
            onClick={() => { const i = PERIOD_OPTIONS.indexOf(period); if (i < PERIOD_OPTIONS.length - 1) setPeriod(PERIOD_OPTIONS[i + 1]); }}
            style={secondaryBtn}>
            上一账期
          </button>
          <button
            onClick={() => { const i = PERIOD_OPTIONS.indexOf(period); if (i > 0) setPeriod(PERIOD_OPTIONS[i - 1]); }}
            style={secondaryBtn}>
            下一账期
          </button>
        </div>
      </div>

      {/* === Summary cards === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
        <Crd>
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)", display: "block" }}>该月总消费金额</span>
          <span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>¥ 12,345.67</span>
          <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 4 }}>不含税 ¥ 10,920.50 · 税额 ¥ 1,425.17</div>
        </Crd>
        <Crd>
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)", display: "block" }}>消费来源构成</span>
          <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", marginBottom: 2 }}>充值本金 ¥ 9,800.00</div>
          <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>奖励/补偿消耗 ¥ 2,545.67</div>
        </Crd>
        <Crd>
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-xs)", display: "block" }}>本账期已开票金额</span>
          <span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>¥ 8,000.00</span>
          <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 4 }}>剩余可开票金额：¥ 4,345.67</div>
        </Crd>
      </div>

      {/* === Invoice info card === */}
      <Crd>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
          <h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>发票信息</h3>
          <button style={secondaryBtn}>编辑信息</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-sm)" }}>
          <InfoRow label="默认抬头" value="某某科技有限公司" />
          <InfoRow label="税号" value="91310000XXXXXXXXXX" />
          <InfoRow label="开票邮箱" value="finance@example.com" />
          <InfoRow label="邮寄地址" value="上海市浦东新区XX路XX号XX室" />
        </div>
      </Crd>

      {/* === Invoice record toolbar === */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginTop: "var(--spacing-xl)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
          <Sel options={["全部账期", "本月", "2026-05", "2026-04", "2026-03"]} />
          <Sel options={["全部类型", "增值税专用发票", "增值税普通发票", "电子发票"]} />
          <Sel options={["全部状态", "待审核", "已开票", "已寄出", "已作废"]} />
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <button style={secondaryBtn}>导出账期账单 PDF</button>
          <button style={primaryBtn}>申请开票</button>
        </div>
      </div>

      {/* === Invoice record table === */}
      <InvoiceTable data={MOCK_INVOICES} onViewDetail={onViewDetail} />

      {/* === Cross-links === */}
      <div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-xl)", padding: "var(--spacing-md)", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
        <span>相关链接：</span>
        <TxtLink>前往 额度 & 计费中心 →</TxtLink>
        <TxtLink>查看交易流水 →</TxtLink>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", display: "block", marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{value}</span>
    </div>
  );
}

function InvoiceTable({ data, onViewDetail }: { data: typeof MOCK_INVOICES; onViewDetail: (inv: typeof MOCK_INVOICES[number]) => void }) {
  if (data.length === 0) return <InvoiceEmpty />;

  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
      <table style={{ width: "100%", minWidth: 750, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <Th>账期</Th><Th>开票金额</Th><Th>发票类型</Th><Th>状态</Th><Th>开票日期</Th><Th right>操作</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} style={{ height: 44 }}>
              <Td style={{ fontWeight: 500, color: "var(--color-ink)" }}>{r.period}</Td>
              <Td>
                <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{r.amount}</span>
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginLeft: 8 }}>不含税 {r.taxExcl}</span>
              </Td>
              <Td><InvTypeBadge type={r.type} /></Td>
              <Td><InvStatusBadge status={r.status} /></Td>
              <Td style={{ fontSize: "var(--text-caption)", color: r.invoiceDate ? "var(--color-muted)" : "var(--color-muted-soft)" }}>{r.invoiceDate || "—"}</Td>
              <Td right>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                  {r.download && <ALink>下载发票</ALink>}
                  <ALink onClick={() => onViewDetail(r)}>查看详情</ALink>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceEmpty() {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 240 }}>
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
      </div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>当前账期暂无发票记录</span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginBottom: "var(--spacing-lg)" }}>当本期消费达到开票条件后，可在此发起开票请求并查看记录。</span>
      <button style={primaryBtn}>申请开票</button>
    </div>
  );
}

function InvTypeBadge({ type }: { type: string }) {
  const m: Record<string, { fg: string; bg: string }> = {
    "增值税专用发票": { fg: "#2563EB", bg: "#EFF6FF" },
    "增值税普通发票": { fg: "#059669", bg: "#ECFDF5" },
    "电子发票": { fg: "#7C3AED", bg: "#F5F3FF" },
  };
  const c = m[type] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{type}</span>;
}

function InvStatusBadge({ status }: { status: string }) {
  const m: Record<string, { fg: string; bg: string }> = {
    "待审核": { fg: "#D97706", bg: "#FFFBEB" },
    "已开票": { fg: "#059669", bg: "#ECFDF5" },
    "已寄出": { fg: "#2563EB", bg: "#EFF6FF" },
    "已作废": { fg: "#6B7280", bg: "#F3F4F6" },
  };
  const c = m[status] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{status}</span>;
}

/* ================================================================
   Invoice Detail Drawer
   ================================================================ */
function InvDetailDrawer({ data, onClose }: { data: typeof MOCK_INVOICES[number] | null; onClose: () => void }) {
  if (!data) return null;
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 480, maxWidth: "100vw", backgroundColor: "var(--color-canvas)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between shrink-0" style={{ height: 60, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-md)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div>
            <div style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>发票详情</div>
            <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>账期 {data.period} · <InvStatusBadge status={data.status} /></div>
          </div>
          <ButXn onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></ButXn>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-lg)" }}>
          <Sect title="基本信息">
            <Fld label="发票类型"><InvTypeBadge type={data.type} /></Fld>
            <Fld label="状态"><InvStatusBadge status={data.status} /></Fld>
            <Fld label="抬头" value="某某科技有限公司" />
            <Fld label="税号" value="91310000XXXXXXXXXX" />
            <Fld label="账期" value={data.period} />
          </Sect>

          <Sect title="金额明细">
            <Fld label="开票金额" value={data.amount} />
            <Fld label="不含税" value={data.taxExcl} />
            <Fld label="税额" value={data.tax} />
          </Sect>

          <Sect title="时间与物流">
            <Fld label="开票日期" value={data.invoiceDate || "—"} />
            <Fld label="寄出日期" value={data.status === "已寄出" ? "2026-06-22" : "—"} />
            <Fld label="快递单号" value={data.status === "已寄出" ? "SF1234567890" : "—"} muted />
          </Sect>

          <Sect title="相关操作" last>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              {data.download && <button style={secondaryBtn}>下载发票 PDF</button>}
              <button style={secondaryBtn}>查看关联交易流水</button>
              <button style={secondaryBtn}>导出对账单</button>
            </div>
          </Sect>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Shared
   ================================================================ */
function EmptyState() {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-xxl)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 240 }}>
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-md)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-soft)" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
      </div>
      <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>暂无符合条件的交易流水</span>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", marginBottom: "var(--spacing-lg)" }}>尝试调整筛选条件，或前往 额度 & 计费中心 查看整体余额情况。</span>
      <button style={primaryBtn}>前往 额度 & 计费中心</button>
    </div>
  );
}

function Crd({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>{children}</div>;
}

function TxtLink({ children }: { children: React.ReactNode }) {
  return <button style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-brand-accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{children}</button>;
}

function Sel({ options }: { options: string[] }) {
  return (
    <select style={selS}>
      {options.map((o) => <option key={o} value={o === options[0] ? "" : o}>{o}</option>)}
    </select>
  );
}

function TxTypeBadge({ type }: { type: string }) {
  const m: Record<string, { fg: string; bg: string }> = {
    "充值": { fg: "#2563EB", bg: "#EFF6FF" },
    "调用扣费": { fg: "#6B7280", bg: "#F3F4F6" },
    "保险补偿": { fg: "#059669", bg: "#ECFDF5" },
    "奖励": { fg: "#D97706", bg: "#FFFBEB" },
    "邀请": { fg: "#7C3AED", bg: "#F5F3FF" },
    "手工调整": { fg: "#DB2777", bg: "#FDF2F8" },
  };
  const c = m[type] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{type}</span>;
}

function AssetBadge({ type }: { type: string }) {
  const m: Record<string, { fg: string; bg: string }> = {
    "本金": { fg: "#2563EB", bg: "#EFF6FF" },
    "奖励": { fg: "#059669", bg: "#ECFDF5" },
    "补偿": { fg: "#7C3AED", bg: "#F5F3FF" },
    "邀请": { fg: "#D97706", bg: "#FFFBEB" },
  };
  const c = m[type] ?? { fg: "#6B7280", bg: "#F3F4F6" };
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{type}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { label: string; fg: string; bg: string }> = {
    success: { label: "成功", fg: "var(--color-success)", bg: "#ECFDF5" },
    pending: { label: "进行中", fg: "#D97706", bg: "#FFFBEB" },
    failed: { label: "失败", fg: "var(--color-error)", bg: "#FEF2F2" },
  };
  const c = m[status] ?? m.failed;
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.fg, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{c.label}</span>;
}

function Pagi({ total }: { total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>
      <span>共 {total} 条记录</span>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xxs)" }}>
        <PagiBtn disabled>上一页</PagiBtn><PagiBtn active>1</PagiBtn><PagiBtn disabled>下一页</PagiBtn>
      </div>
    </div>
  );
}

function PagiBtn({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return <button disabled={disabled} style={{ height: 32, minWidth: 32, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)", backgroundColor: active ? "var(--color-primary)" : "transparent", border: active ? "none" : "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}

function ALink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap" }}>{children}</button>;
}

function Sect({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return <div style={{ marginBottom: "var(--spacing-lg)", paddingBottom: last ? 0 : "var(--spacing-lg)", borderBottom: last ? "none" : "1px solid var(--color-hairline-soft)" }}><h3 style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, lineHeight: "var(--text-title-sm--line-height)", color: "var(--color-ink)", marginBottom: "var(--spacing-md)" }}>{title}</h3>{children}</div>;
}

function Fld({ label, value, children, mono, muted }: { label: string; value?: string; children?: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)" }}>
      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)", width: 72, flexShrink: 0 }}>{label}</span>
      {children ?? <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: muted ? "var(--color-muted)" : "var(--color-ink)", fontFamily: mono ? "var(--font-mono)" : undefined }}>{value}</span>}
    </div>
  );
}

function ButXn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}>{children}</button>;
}

function FeeBreakdown({ amount }: { amount: string }) {
  const val = parseFloat(amount.replace(/[¥,+\-]/g, "")) || 0;
  const native = val / 1.05;
  const fee = val - native;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "4px 0 8px", padding: "var(--spacing-sm)", backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-sm)" }}>
      <FeeRow label="模型原价" value={native} desc="模型官方计费" />
      <FeeRow label="平台服务费" value={fee} desc="按 5% 计算" warn />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2, borderTop: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-ink)" }}>实际扣费总额</span>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 700, color: "var(--color-ink)" }}>¥ {val.toFixed(4)}</span>
      </div>
    </div>
  );
}

function FeeRow({ label, value, desc, warn }: { label: string; value: number; desc: string; warn?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-ink)" }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--color-muted)" }}>({desc})</span>
      </div>
      <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: warn ? "var(--color-warning)" : "var(--color-ink)" }}>¥ {value.toFixed(4)}</span>
    </div>
  );
}

const primaryBtn: React.CSSProperties = { height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, lineHeight: "var(--text-button--line-height)", color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };

const secondaryBtn: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-md)", paddingRight: "var(--spacing-md)", fontSize: "var(--text-button)", fontWeight: 600, lineHeight: "var(--text-button--line-height)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" };

const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
