import type { ReactNode } from "react";

export type NavItem = {
  key: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  children?: NavItem[];
};

/*
 * Sidebar nav — core workspace only:
 *   Group 1: API Key 管理, 用量分析, 在线测试, 模型广场, 充值缴费余额管理
 * Other enterprise modules are kept in code but removed from sidebar rendering.
 */
export const navGroups: NavItem[][] = [
  [
    { key: "api-keys", label: "API Key 管理", path: "/keys" },
    { key: "analytics-usage", label: "用量分析", path: "/analytics/usage" },
    { key: "playground", label: "在线测试", path: "/playground" },
    { key: "models", label: "模型广场", path: "/models" },
    { key: "billing-center", label: "余额管理", path: "/billing" },
  ],
];

export const navItems: NavItem[] = navGroups.flat();
