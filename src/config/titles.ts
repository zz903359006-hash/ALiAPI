export const routeTitleMap: Record<string, string> = {
  "/dashboard": "控制台总览",
  "/models": "模型广场",
  "/analytics/usage": "用量分析",
  "/analytics/cost": "费用分析",
  "/keys": "调用 Key 管理",
  "/keys/create": "创建调用 Key",
  "/keys/management": "管理 Key 管理",
  "/routing/auto": "Auto 路由中心",
  "/billing": "计费中心",
  "/billing/records": "流水与发票",
  "/billing/budget": "预算与计费管理",
  "/observability": "请求与保险",
  "/growth/invite": "邀请裂变中心",
  "/growth/team": "团队 & 员工管理",
  "/settings": "设置",
  "/settings/security": "安全与审计中心",
  "/notifications": "通知中心",
};

export function getRouteTitle(pathname: string): string {
  return routeTitleMap[pathname] ?? "ALiAPI 控制台";
}
