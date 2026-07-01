export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbRule {
  pattern: string;
  segments: (pathParts: string[]) => BreadcrumbItem[];
}

const root: BreadcrumbItem = { label: "控制台", href: "/dashboard" };

export const breadcrumbRules: BreadcrumbRule[] = [
  { pattern: "/dashboard", segments: () => [root] },
  { pattern: "/models", segments: () => [root, { label: "模型广场" }] },
  { pattern: "/analytics/usage", segments: () => [root, { label: "用量分析" }] },
  { pattern: "/analytics/cost", segments: () => [root, { label: "费用分析" }] },
  { pattern: "/keys/management", segments: () => [root, { label: "管理 Key 管理" }] },
  { pattern: "/keys", segments: () => [root, { label: "调用 Key 管理" }] },
  { pattern: "/keys/create", segments: () => [root, { label: "调用 Key 管理", href: "/keys" }, { label: "创建 Key" }] },
  { pattern: "/routing/auto", segments: () => [root, { label: "Auto 路由中心" }] },
  { pattern: "/billing/credits", segments: () => [root, { label: "计费中心", href: "/billing" }, { label: "充值中心" }] },
  { pattern: "/billing/records", segments: () => [root, { label: "计费中心", href: "/billing" }, { label: "流水与发票" }] },
  { pattern: "/billing", segments: () => [root, { label: "计费中心" }] },
  { pattern: "/observability", segments: () => [root, { label: "请求与保险" }] },
  { pattern: "/growth/invite", segments: () => [root, { label: "邀请裂变中心" }] },
  { pattern: "/growth/team", segments: () => [root, { label: "团队 & 员工管理" }] },
  { pattern: "/settings/security", segments: () => [root, { label: "设置", href: "/settings" }, { label: "安全与审计中心" }] },
  { pattern: "/settings", segments: () => [root, { label: "设置" }] },
  { pattern: "/notifications", segments: () => [root, { label: "通知中心" }] },
  { pattern: "/docs", segments: () => [root, { label: "开发者文档" }] },
];

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const rule = breadcrumbRules.find((r) => r.pattern === pathname);
  if (rule) return rule.segments(pathname.split("/").filter(Boolean));
  return [{ label: "控制台" }];
}
