import type { ReactNode } from "react";

export type NavItem = {
  key: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  children?: NavItem[];
};

/*
 * Sidebar nav — 2 groups:
 *   Group 1: Workspace business (控制台总览, API Key 管理, Auto 路由中心, 请求与保险)
 *   Group 2: Account & billing (计费中心, 流水与发票, 团队, 邀请, 设置)
 * Group headers are NOT rendered. Groups separated by divider + "ACCOUNT" label.
 */
export const navGroups: NavItem[][] = [
  [
    { key: "dashboard", label: "控制台总览", path: "/dashboard" },
    { key: "api-keys", label: "API Key 管理", path: "/keys" },
    { key: "auto-routing", label: "Auto 路由中心", path: "/routing/auto" },
    { key: "request-insurance", label: "请求与保险", path: "/observability" },
  ],
  [
    { key: "billing-center", label: "计费中心", path: "/billing" },
    { key: "billing-records", label: "流水与发票", path: "/billing/records" },
    { key: "team", label: "团队员工管理", path: "/growth/team" },
    { key: "invite", label: "邀请裂变中心", path: "/growth/invite" },
    { key: "settings", label: "设置", path: "/settings" },
  ],
];

export const navItems: NavItem[] = navGroups.flat();
