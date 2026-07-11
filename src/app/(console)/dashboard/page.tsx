"use client";

import { useRouter } from "next/navigation";
import { userRole, isEmployee, currentUser } from "@/lib/role";
import { useEffect } from "react";

const EMPLOYEE_MEMBER_DATA = {
  keys: [
    { name: "生产环境主 Key", status: "normal" as const },
    { name: "测试环境 Key", status: "paused" as const },
  ],
  balance: 374.50,
  budget: 500.00,
  consumed: 125.50,
};

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    if (!role) router.replace("/login");
  }, [router]);

  if (isEmployee) return <EmployeeDashboard router={router} />;
  return <AdminDashboard router={router} />;
}

function EmployeeDashboard({ router }: { router: ReturnType<typeof useRouter> }) {
  const data = EMPLOYEE_MEMBER_DATA;
  const remaining = data.balance;
  const pct = Math.min(100, (data.consumed / data.budget) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Block 1: Account overview */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginBottom: 8 }}>当前可用余额</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: remaining < 10 ? "#dc2626" : "#111", letterSpacing: "-0.03em" }}>¥ {remaining.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, maxWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>本月消耗进度</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{pct.toFixed(0)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "#000" }} />
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 10, fontSize: 12, color: "#6b7280" }}>
            <span>已消耗 <b style={{ color: "#111" }}>¥{data.consumed.toFixed(2)}</b></span>
            <span>剩余 <b style={{ color: "#111" }}>¥{remaining.toFixed(2)}</b></span>
            <span>月度预算 <b style={{ color: "#111" }}>¥{data.budget.toFixed(2)}</b></span>
          </div>
        </div>
        <button onClick={() => router.push(data.keys.length === 0 ? "/keys" : "/playground")}
          style={{ height: 40, padding: "0 20px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#111", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {data.keys.length === 0 ? "领取 Key" : "去在线测试"}
        </button>
      </div>

      {/* Block 2: My keys */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111", margin: "0 0 16px" }}>我的凭证</h2>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          {data.keys.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 16px" }}>还没有 Key</p>
              <button onClick={() => router.push("/keys")} style={{ height: 40, padding: "0 20px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#111", border: "none", borderRadius: 8, cursor: "pointer" }}>立即领取</button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "left", borderBottom: "1px solid #f3f4f6" }}>Key 名称</th>
                  <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "left", borderBottom: "1px solid #f3f4f6" }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {data.keys.map((k) => (
                  <tr key={k.name}>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#111", borderBottom: "1px solid #f3f4f6" }}>{k.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", fontSize: 11, fontWeight: 600, borderRadius: 999, background: k.status === "normal" ? "#ecfdf5" : "#f3f4f6", color: k.status === "normal" ? "#087a55" : "#6b7280" }}>
                        {k.status === "normal" ? "启用" : "停用"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Block 3: Quick entries */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "在线测试", path: "/playground" },
          { label: "用量分析", path: "/analytics/usage" },
          { label: "模型广场", path: "/models" },
        ].map((item) => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{ height: 80, fontSize: 15, fontWeight: 600, color: "#111", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, cursor: "pointer", transition: "box-shadow 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Block 1: Company overview */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginBottom: 8 }}>公司可用余额</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#111", letterSpacing: "-0.03em" }}>¥ 12,345.60</div>
          </div>
          <button onClick={() => router.push("/admin/billing")} style={{ height: 40, padding: "0 20px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#111", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" }}>
            立即充值
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}><span>本月总充值</span><span style={{ fontWeight: 600, color: "#111" }}>¥ 15,000</span></div>
            <div style={{ height: 6, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 999, background: "#000" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}><span>本月总消耗</span><span style={{ fontWeight: 600, color: "#111" }}>¥ 8,200</span></div>
            <div style={{ height: 6, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
              <div style={{ width: "55%", height: "100%", borderRadius: 999, background: "#333" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Block 2: Member consumption */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111", margin: 0 }}>成员消耗</h2>
          <button onClick={() => router.push("/admin/members")} style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}>
            查看全部 →
          </button>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "left", borderBottom: "1px solid #f3f4f6" }}>成员</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "left", borderBottom: "1px solid #f3f4f6" }}>已消耗</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "left", borderBottom: "1px solid #f3f4f6" }}>预算</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "right", borderBottom: "1px solid #f3f4f6" }}>进度</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "张明", consumed: 345.60, budget: 500 },
                { name: "李芳", consumed: 89.20, budget: 300 },
                { name: "王磊", consumed: 4.50, budget: 200 },
              ].map((m) => {
                const p = Math.min(100, (m.consumed / m.budget) * 100);
                return (
                  <tr key={m.name}>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#111", borderBottom: "1px solid #f3f4f6" }}>{m.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>¥{m.consumed.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>¥{m.budget.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 4, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
                          <div style={{ width: `${p}%`, height: "100%", borderRadius: 999, background: "#000" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>{p.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
