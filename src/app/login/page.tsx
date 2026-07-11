"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site-config";

const MOCK_ACCOUNTS: Record<string, { role: "Admin" | "Employee"; name: string }> = {
  "admin@aliapi.com": { role: "Admin", name: "管理员" },
  "employee@aliapi.com": { role: "Employee", name: "张明" },
};

export default function LoginPage() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!account.trim() || !password.trim()) {
      setError("请填写账号和密码");
      return;
    }
    const user = MOCK_ACCOUNTS[account.trim()];
    if (!user || password !== "123456") {
      setError("账号或密码错误");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem("userRole", user.role);
      sessionStorage.setItem("currentUser", user.name);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", padding: 24 }}>
      <div style={{ width: 400, maxWidth: "100%", background: "#fff", borderRadius: 16, padding: 40, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 34, height: 34, display: "block", borderRadius: 10, border: "1px solid #cfd9e6", background: "#f8fbff", overflow: "hidden", position: "relative" }}>
              <span style={{ position: "absolute", inset: 0, backgroundImage: "url(/limapilogo.jpg)", backgroundSize: "129px 129px", backgroundPosition: "-18px -31px", backgroundRepeat: "no-repeat" }} />
            </span>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#0c2d55", letterSpacing: "-0.04em" }}>{siteConfig.productName}</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#111", margin: "0 0 4px", letterSpacing: "-0.03em" }}>登录</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>登录你的 limAPI 账户</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 6 }}>手机号或邮箱</label>
            <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="employee@aliapi.com"
              style={{ width: "100%", height: 44, padding: "0 14px", fontSize: 14, color: "#111", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = "#111"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 6 }}>密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123456"
              style={{ width: "100%", height: 44, padding: "0 14px", fontSize: 14, color: "#111", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = "#111"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>

          {error && <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{error}</div>}

          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", height: 44, fontSize: 15, fontWeight: 600, color: "#fff", background: loading ? "#9ca3af" : "#111", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#242424"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#111"; }}>
            {loading ? "登录中..." : "登录"}
          </button>

          <p style={{ fontSize: 12, color: "#898989", textAlign: "center", margin: "8px 0 0" }}>首次使用请联系管理员开通账号</p>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 8px", textAlign: "center" }}>测试账号</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setAccount("admin@aliapi.com"); setPassword("123456"); }}
              style={{ flex: 1, height: 36, fontSize: 12, color: "#374151", background: "#f3f4f6", border: "none", borderRadius: 6, cursor: "pointer" }}>
              管理员
            </button>
            <button onClick={() => { setAccount("employee@aliapi.com"); setPassword("123456"); }}
              style={{ flex: 1, height: 36, fontSize: 12, color: "#374151", background: "#f3f4f6", border: "none", borderRadius: 6, cursor: "pointer" }}>
              员工
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
