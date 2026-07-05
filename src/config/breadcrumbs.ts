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
  { pattern: "/models", segments: () => [root] },
  { pattern: "/analytics/usage", segments: () => [root] },
  { pattern: "/analytics/cost", segments: () => [root] },
  { pattern: "/keys/management", segments: () => [root, { label: "调用 Key 管理", href: "/keys" }, { label: "管理 Key 管理" }] },
  { pattern: "/keys", segments: () => [root] },
  { pattern: "/keys/create", segments: () => [root, { label: "调用 Key 管理", href: "/keys" }, { label: "创建 Key" }] },
  { pattern: "/routing/auto", segments: () => [root] },
  { pattern: "/billing/credits", segments: () => [root, { label: "充值缴费余额管理", href: "/billing" }, { label: "充值中心" }] },
  { pattern: "/billing/records", segments: () => [root, { label: "充值缴费余额管理", href: "/billing" }, { label: "流水与发票" }] },
  { pattern: "/billing", segments: () => [root] },
  { pattern: "/observability", segments: () => [root] },
  { pattern: "/growth/invite", segments: () => [root] },
  { pattern: "/growth/team", segments: () => [root] },
  { pattern: "/settings/security", segments: () => [root, { label: "设置", href: "/settings" }, { label: "安全与审计中心" }] },
  { pattern: "/settings", segments: () => [root] },
  { pattern: "/notifications", segments: () => [root] },
  { pattern: "/docs", segments: () => [root] },
];

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const rule = breadcrumbRules.find((r) => r.pattern === pathname);
  if (rule) return rule.segments(pathname.split("/").filter(Boolean));
  return [{ label: "控制台" }];
}
