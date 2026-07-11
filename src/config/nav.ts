import type { ReactNode } from "react";

export type NavItem = {
  key: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  children?: NavItem[];
};

/*
 * Sidebar nav — core workspace + admin section:
 *   Group 1: Common items (all roles)
 *   Group 2: Admin items (Admin role only, rendered below divider)
 */
export const navGroups: NavItem[][] = [
  [
    { key: "api-keys", label: "Key 管理", path: "/keys" },
    { key: "analytics-usage", label: "用量分析", path: "/analytics/usage" },
    { key: "playground", label: "在线测试", path: "/playground" },
    { key: "models", label: "模型广场", path: "/models" },
  ],
  [
    { key: "admin-members", label: "成员", path: "/admin/members" },
    { key: "admin-billing", label: "财务", path: "/admin/billing" },
    { key: "admin-settings", label: "设置", path: "/admin/settings" },
  ],
];

export const navItems: NavItem[] = navGroups.flat();
