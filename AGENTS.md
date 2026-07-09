<!-- BEGIN:nextjs-agent-rules -->
# 这不是你熟悉的 Next.js

此版本有破坏性变更——API、约定和文件结构可能与你的训练数据不同。在编写代码前，请阅读 `node_modules/next/dist/docs/` 中的相关指南。注意弃用通知。
<!-- END:nextjs-agent-rules -->

# AliAPI — AI API 网关管理后台

企业级 AI API 网关管理控制台，支持 API 密钥管理、模型广场、在线 Playground、账单分析、团队管理等功能。

**语言：** 简体中文（zh-CN），所有 UI 标签和提交信息均为中文。

## 快速开始

```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 代码检查
```

**注意：** 没有测试脚本，项目中未安装测试框架。

## 项目架构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局 (zh-CN, Inter 字体, 全局 CSS)
│   ├── page.tsx            # 首页 → 重定向到 /keys
│   ├── login/page.tsx      # 登录页
│   ├── invite/page.tsx     # 团队邀请接受页
│   └── (console)/          # 路由组：控制台页面
│       ├── layout.tsx      # 包裹 AppLayout
│       ├── admin/          # 管理员专区
│       ├── analytics/      # 分析 (用量/费用)
│       ├── billing/        # 余额管理 (概览/充值/记录)
│       ├── keys/           # 密钥管理 (列表/创建/管理)
│       ├── models/         # 模型广场
│       ├── playground/     # 在线 Playground
│       └── ...             # 其他页面
├── components/
│   ├── layout/             # 布局组件 (AppLayout, Sidebar, Topbar, etc.)
│   ├── CreateKeyModal.tsx  # 创建密钥弹窗
│   ├── QuickKeyModal.tsx   # 快速创建密钥弹窗
│   └── CommandPalette.tsx  # 全局命令面板 (Cmd+K)
├── config/
│   ├── nav.ts              # 侧边栏导航组定义
│   ├── titles.ts           # 路由 → 中文标题映射
│   └── breadcrumbs.ts      # 面包屑规则定义
└── lib/
    └── role.ts             # 用户角色和名称桩数据
```

## 关键约定与注意事项

### 全是 Mock 数据，没有后端
**整个应用是纯前端原型。** 所有数据都是硬编码的 Mock 数据，没有 API 调用、没有 Server Actions、没有数据库连接。异步操作使用 `setTimeout` 模拟。

### 角色双视图
`src/lib/role.ts` 中硬编码 `userRole = "Admin"`：
- **Admin 视图：** 完整侧边栏，含管理专区（成员/账单/设置），企业入口，全局搜索
- **Employee 视图：** 受限侧边栏（仅密钥、分析、Playground、模型），无管理功能

修改 `role.ts` 中的 `userRole` 可切换视图。

### 设计系统
采用 **Cal Design System** 风格，通过 CSS `@theme inline` 自定义设计 Token（4px 基准间距、特定圆角值、配色板、字号比例）。主要样式通过 **内联 `style` 对象** 实现，而非 Tailwind 类名。

常用样式常量定义在布局组件中（如 `C.sidebarBg`, `C.itemActiveBg`），具体值请参考已有代码。

### Z-Index 层级约定
- `z-30`：Topbar (sticky)
- `z-40`：Sidebar (fixed)
- `z-50`：抽屉、弹窗、命令面板背景
- `z-[60]`：QuickKeyModal
- `z-[70]`：CreateKeyModal、CommandPalette 面板
- `z-999`：Toast 通知

### 密钥管理状态
使用 `sessionStorage` 跟踪 `hasClaimedKey`——刷新页面后状态丢失。

### 已知文件模式
- `src/app/(console)/keys/page.tsx` — **1027 行**，包含页面逻辑和 30+ 个子组件（未拆分文件）
- `src/app/(console)/models/page.tsx` — 同样包含大量内联子组件

### 环境变量
当前无需环境变量（无后端集成、无 .env 文件），`.env*` 已被 `.gitignore` 忽略。
