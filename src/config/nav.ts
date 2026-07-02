import type { ReactNode } from "react";

export type NavItem = {
  key: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  children?: NavItem[];
};

/*
 * Sidebar nav — 5 groups following user lifecycle:
 * 发现 → 接入 → 观测 → 财务 → 管理
 * Group headers are NOT rendered. Adjacent groups are separated by a divider line.
 */
export const navGroups: NavItem[][] = [
  // Group 1: 大盘与发现
  [
    { key: "dashboard", label: "控制台总览", path: "/dashboard" },
    { key: "models", label: "模型广场", path: "/models" },
  ],
  // Group 2: 核心调度（接入层）
  [
    { key: "api-keys", label: "API Key 管理", path: "/keys" },
    { key: "auto-routing", label: "Auto 路由中心", path: "/routing/auto" },
  ],
  // Group 3: 监控与观测（观测层）
  [
    { key: "request-insurance", label: "请求与保险", path: "/observability" },
    { key: "rankings", label: "模型排行榜", path: "/rankings" },
    { key: "usage-analytics", label: "用量分析", path: "/analytics/usage" },
    { key: "cost-analytics", label: "费用分析", path: "/analytics/cost" },
  ],
  // Group 4: 资产与账单（财务层）
  [
    { key: "billing-center", label: "计费中心", path: "/billing" },
    { key: "billing-records", label: "流水与发票", path: "/billing/records" },
  ],
  // Group 5: 组织与增长（管理层）
  [
    { key: "team", label: "团队员工管理", path: "/growth/team" },
    { key: "invite", label: "邀请裂变中心", path: "/growth/invite" },
  ],
];

// Legacy flat list for components that still expect it.
export const navItems: NavItem[] = navGroups.flat();
