"use client";

import { useState } from "react";
import { getRouteTitle } from "@/config/titles";
import Tabs from "@/components/layout/Tabs";

interface TeamNode { id: string; name: string; type: "dept" | "project"; children?: TeamNode[]; memberCount: number; quota: string; used: string; dailyLimit: string; monthlyLimit: string; }
const TREE: TeamNode = { id: "root", name: "limAPI", type: "dept", memberCount: 48, quota: "¥ 50,000", used: "¥ 17,500", dailyLimit: "¥ 500", monthlyLimit: "¥ 5,000",
  children: [
    { id: "ai", name: "AI 平台部", type: "dept", memberCount: 15, quota: "¥ 15,000", used: "¥ 5,400", dailyLimit: "¥ 200", monthlyLimit: "¥ 2,000", children: [{ id: "prj-ml", name: "模型平台项目", type: "project", memberCount: 8, quota: "¥ 8,000", used: "¥ 3,800", dailyLimit: "¥ 100", monthlyLimit: "¥ 1,200" }] },
    { id: "cs", name: "客服中心", type: "dept", memberCount: 10, quota: "¥ 8,000", used: "¥ 2,100", dailyLimit: "¥ 150", monthlyLimit: "¥ 1,500" },
    { id: "growth", name: "增长与投放", type: "dept", memberCount: 8, quota: "¥ 10,000", used: "¥ 3,200", dailyLimit: "¥ 200", monthlyLimit: "¥ 2,000" },
  ],
};

type MemberStatus = "active" | "invited" | "disabled";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  team: string;
  dailyLimit: string;
  monthlyLimit: string;
  used: string;
  usedPct: number;
  status: MemberStatus;
}

const initialMembers: Member[] = [
  { id: "m1", name: "张明", email: "zhang@example.com", phone: "13912345678", role: "管理员", team: "AI 平台部", dailyLimit: "¥ 200", monthlyLimit: "¥ 2,000", used: "¥ 1,200", usedPct: 60, status: "active" },
  { id: "m2", name: "李芳", email: "lifang@example.com", phone: "13898765432", role: "员工", team: "客服中心", dailyLimit: "¥ 100", monthlyLimit: "¥ 1,000", used: "¥ 350", usedPct: 35, status: "active" },
  { id: "m3", name: "王磊", email: "wanglei@example.com", phone: "13755667788", role: "员工", team: "AI 平台部", dailyLimit: "¥ 150", monthlyLimit: "¥ 1,500", used: "¥ 1,450", usedPct: 97, status: "disabled" },
  { id: "m4", name: "陈静", email: "chenjing@example.com", phone: "13611223344", role: "管理员", team: "增长与投放", dailyLimit: "¥ 200", monthlyLimit: "¥ 2,000", used: "¥ 890", usedPct: 44, status: "active" },
  { id: "m5", name: "赵强", email: "zhaoqiang@example.com", phone: "13599887766", role: "员工", team: "客服中心", dailyLimit: "¥ 80", monthlyLimit: "¥ 800", used: "¥ 120", usedPct: 15, status: "active" },
];

const BADGE_LABELS: Record<MemberStatus, string> = { active: "正常", invited: "待加入", disabled: "已禁用" };
const BADGE_COLORS: Record<MemberStatus, { text: string; bg: string }> = {
  active: { text: "var(--color-success)", bg: "#ECFDF5" },
  invited: { text: "var(--color-warning)", bg: "#FFFBEB" },
  disabled: { text: "var(--color-muted)", bg: "var(--color-surface-card)" },
};

const TEAMS = ["AI 平台部", "客服中心", "增长与投放", "模型平台项目"];

export default function TeamPage() {
  const [tab, setTab] = useState("members");
  const [selectedNode, setSelectedNode] = useState<TeamNode>(TREE);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "var(--spacing-sm) var(--spacing-lg)", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: "var(--text-body-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "var(--text-display-md)", fontWeight: 600, lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)", color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {getRouteTitle("/growth/team")}
        </h1>
        <p style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>管理团队结构与成员，分配调用额度与权限，查看对账报表。</p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Tabs tabs={[{ key: "members", label: "成员列表", content: null }, { key: "structure", label: "团队结构", content: null }]} activeKey={tab} onChange={setTab} />
      </div>

      {tab === "members" && <MembersTab members={members} onEdit={setEditMember} onInvite={() => setInviteOpen(true)} />}
      {tab === "structure" && <StructureTab node={selectedNode} onSelect={setSelectedNode} />}

      {/* Edit Quota Modal */}
      {editMember && <EditModal data={editMember} onClose={() => setEditMember(null)} />}

      {/* Invite Member Modal */}
      {inviteOpen && <InviteMemberModal
        onClose={() => setInviteOpen(false)}
        onSuccess={(m: Member) => { setMembers((prev) => [...prev, m]); setInviteOpen(false); showToast("邀请短信已发送，员工加入后将自动出现在列表中"); }}
      />}
    </div>
  );
}

/* ================================================================
   Tab1: 成员列表
   ================================================================ */
function MembersTab({ members, onEdit, onInvite }: { members: Member[]; onEdit: (m: Member) => void; onInvite: () => void }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = members.filter((m) => {
    if (search && !m.name.includes(search) && !m.email.includes(search) && !m.phone.includes(search)) return false;
    if (roleFilter && m.role !== roleFilter) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", height: 36, padding: "0 var(--spacing-sm)", gap: "var(--spacing-xs)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", minWidth: 200 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input
              placeholder="搜索姓名/邮箱/手机号"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", background: "none", flex: 1, fontSize: "var(--text-body-sm)", color: "var(--color-ink)" }}
            />
          </div>
          <Sel options={["全部角色", "管理员", "员工"]} value={roleFilter} onChange={setRoleFilter} />
          <Sel options={["全部状态", "active", "invited", "disabled"]} labels={{ active: "正常", invited: "待加入", disabled: "已禁用" }} value={statusFilter} onChange={setStatusFilter} />
        </div>
        <button onClick={onInvite} style={prBtn}>邀请员工</button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
        <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}>
          <thead><tr style={{ backgroundColor: "#F9FAFB" }}>
            <Th2>成员</Th2><Th2>手机号</Th2><Th2>角色</Th2><Th2>状态</Th2><Th2>分配额度</Th2><Th2>操作</Th2>
          </tr></thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} style={{ height: 44 }}>
                <Td2>
                  <div>
                    <span style={{ fontWeight: 500, color: "var(--color-ink)" }}>{m.name}</span>
                    <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginLeft: 8 }}>{m.email}</span>
                  </div>
                </Td2>
                <Td2 style={{ color: "var(--color-body)" }}>{m.phone}</Td2>
                <Td2 style={{ color: "var(--color-body)" }}>{m.role}</Td2>
                <Td2><Badge2 status={m.status} /></Td2>
                <Td2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
                      已用 {m.used} / {m.monthlyLimit}
                    </span>
                    <PctBar pct={m.usedPct} label="" />
                  </div>
                </Td2>
                <Td2 right>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-xxs)" }}>
                    <AL onClick={() => onEdit(m)}>编辑额度</AL>
                    <AL>{m.status === "disabled" ? "启用" : "禁用调用"}</AL>
                    {m.status === "invited" && <AL>重新发送邀请</AL>}
                  </div>
                </Td2>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagi total={filtered.length} />
    </div>
  );
}

/* ================================================================
   Invite Member Modal
   ================================================================ */
function InviteMemberModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (m: Member) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("员工");
  const [loading, setLoading] = useState(false);

  const validatePhone = (v: string) => {
    if (!v.trim()) return "手机号不能为空";
    if (!/^1[3-9]\d{9}$/.test(v.trim())) return "请输入正确的手机号格式";
    return "";
  };

  const handleSubmit = () => {
    const err = validatePhone(phone);
    if (err) { setPhoneErr(err); return; }
    setLoading(true);
    setTimeout(() => {
      const newMember: Member = {
        id: `m${Date.now()}`,
        name: name.trim() || phone.slice(-4),
        email: `${phone}@invite.pending`,
        phone: phone.trim(),
        role,
        team: team || "未分配",
        dailyLimit: "¥ 100",
        monthlyLimit: "¥ 1,000",
        used: "¥ 0",
        usedPct: 0,
        status: "invited",
      };
      setLoading(false);
      onSuccess(newMember);
    }, 800);
  };

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 440, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "var(--spacing-xl)" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-lg)" }}>
            <div>
              <span style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>邀请新员工</span>
              <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>通过手机短信发送邀请链接</div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>员工姓名 <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>(选填)</span></span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入员工姓名" style={{ ...inpS, width: "100%" }} />
            </div>

            <div>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>手机号 <span style={{ color: "var(--color-error)" }}>*</span></span>
              <div style={{ position: "relative" }}>
                <input value={phone} onChange={(e) => { setPhone(e.target.value); if (phoneErr) setPhoneErr(""); }} placeholder="请输入手机号" style={{ ...inpS, width: "100%", borderColor: phoneErr ? "var(--color-error)" : "var(--color-hairline)" }} />
              </div>
              {phoneErr && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-error)", marginTop: 4, display: "block" }}>{phoneErr}</span>}
            </div>

            <div>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>所属团队 <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>(选填)</span></span>
              <select value={team} onChange={(e) => setTeam(e.target.value)} style={{ ...selS, width: "100%" }}>
                <option value="">请选择团队</option>
                {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)", display: "block", marginBottom: 4 }}>角色权限</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...selS, width: "100%" }}>
                <option value="员工">员工</option>
                <option value="管理员">管理员</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-sm)", marginTop: "var(--spacing-xl)" }}>
            <button onClick={onClose} style={secBtn}>取消</button>
            <button onClick={handleSubmit} disabled={loading} style={{ ...prBtn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {loading && <Spinner />}
              发送短信邀请
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

/* ================================================================
   Tab2: 团队结构 (unchanged)
   ================================================================ */
function StructureTab({ node, onSelect }: { node: TeamNode; onSelect: (n: TeamNode) => void }) {
  return (
    <div style={{ display: "flex", gap: "var(--spacing-lg)", alignItems: "flex-start" }}>
      <div style={{ width: 240, flexShrink: 0, backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>团队树</span>
          <div style={{ display: "flex", gap: 4 }}>
            <TxtSm>新建团队</TxtSm>
            <TxtSm>新建项目</TxtSm>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-sm)" }}>
          <TNode n={TREE} selected={node.id} onSelect={onSelect} depth={0} />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--spacing-md)", marginBottom: "var(--spacing-lg)" }}>
          <Kpi label="成员数" value={String(node.memberCount)} />
          <Kpi label="团队可用额度" value={node.quota} sub={`已用 ${node.used}`} />
          <Kpi label="日限额" value={node.dailyLimit} />
          <Kpi label="月限额" value={node.monthlyLimit} />
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-md)" }}>
          <Btn2>批量添加成员</Btn2>
          <Btn2>批量分配额度</Btn2>
          <Btn2>导出对账报表</Btn2>
        </div>

        <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", overflow: "auto" }}>
          <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse" }}>
            <thead><tr style={{ backgroundColor: "#F9FAFB" }}><Th2>成员</Th2><Th2>角色</Th2><Th2>日限额</Th2><Th2>月限额</Th2><Th2>已用</Th2><Th2>状态</Th2></tr></thead>
            <tbody>
              {initialMembers.filter((m) => m.team === node.name || node.name === "limAPI").map((m) => (
                <tr key={m.id} style={{ height: 44 }}>
                  <Td2><div><span style={{ fontWeight: 500, color: "var(--color-ink)" }}>{m.name}</span><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginLeft: 8 }}>{m.email}</span></div></Td2>
                  <Td2 style={{ color: "var(--color-body)" }}>{m.role}</Td2>
                  <Td2 style={{ color: "var(--color-body)" }}>{m.dailyLimit}</Td2>
                  <Td2 style={{ color: "var(--color-body)" }}>{m.monthlyLimit}</Td2>
                  <Td2><PctBar pct={m.usedPct} label={m.used} /></Td2>
                  <Td2><Badge2 status={m.status} /></Td2>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TNode({ n, selected, onSelect, depth }: { n: TeamNode; selected: string; onSelect: (n: TeamNode) => void; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isSel = n.id === selected;
  const hasKids = n.children && n.children.length > 0;
  return (
    <div>
      <div onClick={() => onSelect(n)}
        style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", padding: "6px 8px", paddingLeft: 8 + depth * 16, borderRadius: "var(--radius-sm)", cursor: "pointer", backgroundColor: isSel ? "var(--color-surface-card)" : "transparent", color: isSel ? "var(--color-ink)" : "var(--color-body)", fontSize: "var(--text-body-sm)", fontWeight: isSel ? 600 : 400 }}
        onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = "var(--color-surface-soft)"; }}
        onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = "transparent"; }}>
        {hasKids ? <span onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}><path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span> : <span style={{ width: 16, flexShrink: 0 }} />}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", flexShrink: 0 }}>{n.memberCount}</span>
      </div>
      {expanded && hasKids && n.children!.map((c) => <TNode key={c.id} n={c} selected={selected} onSelect={onSelect} depth={depth + 1} />)}
    </div>
  );
}

/* ================================================================
   Edit Quota Modal
   ================================================================ */
function EditModal({ data, onClose }: { data: Member; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 400, backgroundColor: "var(--color-canvas)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "var(--spacing-xl)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
            <div>
              <span style={{ fontSize: "var(--text-title-md)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>编辑额度 — {data.name}</span>
              <div style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>{data.email} · {data.team}</div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", display: "block", marginBottom: 4 }}>日调用额度上限</span>
              <input defaultValue={parseInt(data.dailyLimit.replace(/[^0-9]/g, ""))} style={{ ...inpS, width: "100%" }} />
            </div>
            <div>
              <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-body)", display: "block", marginBottom: 4 }}>月调用额度上限</span>
              <input defaultValue={parseInt(data.monthlyLimit.replace(/[^0-9]/g, ""))} style={{ ...inpS, width: "100%" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--spacing-lg)" }}>
            <button style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-error)", background: "none", border: "none", cursor: "pointer" }}>回收剩余额度</button>
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <button onClick={onClose} style={secBtn}>取消</button>
              <button onClick={onClose} style={prBtn}>保存</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Shared
   ================================================================ */
function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-md)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 80 }}><span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: 2 }}>{label}</span><span style={{ fontSize: "var(--text-title-lg)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{value}</span>{sub && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", marginTop: 2 }}>{sub}</span>}</div>;
}

function PctBar({ pct, label }: { pct: number; label: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}><div style={{ width: 56, height: 6, backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-full)", overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#000000", borderRadius: "var(--radius-full)" }} /></div>{label && <><span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)" }}>{pct}%</span><span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{label}</span></>}</div>;
}

function Badge2({ status }: { status: MemberStatus }) {
  const c = BADGE_COLORS[status];
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-caption)", fontWeight: 500, color: c.text, backgroundColor: c.bg, borderRadius: "var(--radius-sm)" }}>{BADGE_LABELS[status]}</span>;
}

function TxtSm({ children }: { children: React.ReactNode }) {
  return <button style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-brand-accent)", background: "none", border: "none", cursor: "pointer" }}>{children}</button>;
}

function Btn2({ children }: { children: React.ReactNode }) {
  return <button style={{ height: 32, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>;
}

function Sel({ options, value, onChange, labels }: { options: string[]; value?: string; onChange?: (v: string) => void; labels?: Record<string, string> }) {
  return (
    <select value={value || ""} onChange={(e) => onChange?.(e.target.value)} style={selS}>
      {options.map((o) => {
        const isPlaceholder = o === options[0] && (!value || value === "");
        const display = labels ? (labels[o] || o) : o;
        return <option key={o} value={isPlaceholder ? "" : o}>{display}</option>;
      })}
    </select>
  );
}

function Th2({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td2({ children, style, right }: { children: React.ReactNode; style?: React.CSSProperties; right?: boolean }) {
  return <td style={{ padding: "var(--spacing-sm) var(--spacing-md)", fontSize: "var(--text-body-sm)", lineHeight: 1.4, borderBottom: "1px solid var(--color-hairline-soft)", verticalAlign: "middle", textAlign: right ? "right" : "left", ...style }}>{children}</td>;
}

function AL({ children, dim, onClick }: { children: React.ReactNode; dim?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: dim ? "var(--color-muted)" : "var(--color-ink)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "var(--radius-xs)", whiteSpace: "nowrap" }}>{children}</button>;
}

function Pagi({ total }: { total: number }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}><span>共 {total} 条</span><div style={{ display: "flex", gap: "var(--spacing-xxs)" }}><PageBtn disabled>上一页</PageBtn><PageBtn active>1</PageBtn><PageBtn disabled>下一页</PageBtn></div></div>;
}

function PageBtn({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return <button disabled={disabled} style={{ height: 32, minWidth: 32, paddingLeft: "var(--spacing-xs)", paddingRight: "var(--spacing-xs)", fontSize: "var(--text-body-sm)", fontWeight: 500, color: active ? "var(--color-on-primary)" : disabled ? "var(--color-muted-soft)" : "var(--color-body)", backgroundColor: active ? "var(--color-primary)" : "transparent", border: active ? "none" : "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}

const prBtn: React.CSSProperties = { height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap" };
const secBtn: React.CSSProperties = { height: 40, paddingLeft: "var(--spacing-lg)", paddingRight: "var(--spacing-lg)", fontSize: "var(--text-button)", fontWeight: 600, color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer" };
const inpS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: "var(--spacing-sm)", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", outline: "none" };
const selS: React.CSSProperties = { height: 36, paddingLeft: "var(--spacing-sm)", paddingRight: 32, fontSize: "var(--text-body-sm)", fontWeight: 400, color: "var(--color-body)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
