# Dashboard 二次重构设计文档

## 背景
对 ALiAPI 控制台总览页面进行二次重构，核心目标：
1. 修正新手引导流程（去掉选模型，改为充值优先）
2. 区分个人版、组织管理员版、员工版三种视角下的 Dashboard 展示

## 改动范围
- 仅修改 `src/app/(console)/dashboard/page.tsx`
- 新增 `src/app/(console)/billing/credits/page.tsx`
- 不修改全局样式体系（Topbar、Sidebar、H1、Button、Card 等）
- 不修改 MetricCard、Card、RiskCard 等组件结构

## 方案

### 1. 身份判定
使用 `useState` mock 三种身份：
- `"personal"` — 个人账户
- `"org-admin"` — 组织管理员
- `"employee"` — 员工

通过双击标题展开的 Dev Toggle 切换身份。

### 2. 新版新手引导（三步漏斗）
触发条件：`!hasKeys || !hasRecentRequests`（仅 personal 和 org-admin 模式）

三步：
1. 充值账户 — 图标 + "为账户充值，解锁全站所有模型调用能力" → 按钮「前往充值」跳转 `/billing/credits`
2. 创建调用 Key — 图标 + "生成 API Key，配置路由与风控策略" → 按钮「创建调用 Key」跳转 `/keys/create`
3. 开始调用 — 图标 + "复制兼容 OpenAI 的示例代码，发起首次请求" → 按钮「查看快速开始文档」跳转外链

完成状态打勾置灰。

### 3. 个人版 Dashboard
- 保留新手引导（如条件满足）
- KPI 数据保持不变
- KPI 下方新增「企业团队协作更高效」推广卡片 → 按钮「升级为组织」Toast 提示

### 4. 组织管理员版 Dashboard
- 不展示推广卡片
- KPI 改为组织级：组织总用量 / 总费用 / 组织可用余额 / 异常请求 / 保险补偿
- 趋势图下方增加「团队用量 Top 5」排行

### 5. 员工版 Dashboard
- KPI 只展示：可用额度 / 本月个人用量 / 个人异常请求
- 去掉总费用、保险补偿
- 不展示充值引导
- 风险区余额预警改为额度不足预警

### 6. 新建 /billing/credits
简单的占位页面，提示充值功能开发中。
