import type { ReactNode } from "react";

export type NavItem = {
  key: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  children?: NavItem[];
};

/*
 * Flat nav with divider groups — Cal.com style.
 * Group headers are NOT rendered. adjacent groups are separated by a divider line.
 */
export const navGroups: NavItem[][] = [
  // Group 1: Overview & Analytics
  [
    { key: "dashboard", label: "控制台总览", path: "/dashboard" },
    { key: "models", label: "模型广场", path: "/models" },
    { key: "usage-analytics", label: "用量分析", path: "/analytics/usage" },
    { key: "cost-analytics", label: "费用分析", path: "/analytics/cost" },
  ],
  // Group 2: Keys & Routing
  [
    { key: "api-keys", label: "调用 Key 管理", path: "/keys" },
    { key: "mgmt-keys", label: "管理 Key 管理", path: "/keys/management" },
    { key: "auto-routing", label: "Auto 路由中心", path: "/routing/auto" },
  ],
  // Group 3: Billing
  [
    { key: "billing-center", label: "计费中心", path: "/billing" },
    { key: "billing-records", label: "流水与发票", path: "/billing/records" },
  ],
  // Group 4: Monitoring
  [
    { key: "request-insurance", label: "请求与保险", path: "/observability" },
  ],
  // Group 5: Growth
  [
    { key: "invite", label: "邀请裂变中心", path: "/growth/invite" },
    { key: "team", label: "团队管理", path: "/growth/team" },
  ],
];

// Legacy flat list for components that still expect it.
export const navItems: NavItem[] = navGroups.flat();
