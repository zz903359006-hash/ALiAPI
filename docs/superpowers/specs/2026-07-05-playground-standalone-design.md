# Playground 全屏测试页面设计

## 背景

员工视角需要独立的模型测试入口。现有 Playground 嵌入在模型详情 Drawer 中，空间有限。需要将其提取为独立的全屏页面，同时在 Drawer 中保留快捷入口。

## 设计目标

1. 员工可在模型广场点击「全屏测试」打开独立测试页面
2. 页面展示模型名称、输入/输出价格、上下文长度
3. 测试区复用现有 Playground 的所有交互（选 Key、Prompt、流式响应、统计）
4. 不修改 Playground 自身的行为逻辑

## 架构

### 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/Playground.tsx` | 新增 | 从 `models/page.tsx` 提取的 Playground 组件 |
| `src/app/(console)/playground/page.tsx` | 新增 | 全屏测试页面 |
| `src/app/(console)/models/page.tsx` | 修改 | 导入 Playground 组件；Drawer 底部加「全屏测试」按钮 |

### 路由

- 路径：`/playground?model=<model-nameId>`
- 通过 query string 传递模型标识
- 不走侧边栏导航，独立于菜单体系

### 组件提取

`Playground` 函数（约 60 行）从 `models/page.tsx` 原样移至 `src/components/Playground.tsx`：
- 接口签名不变
- 所有 props 透传
- 不修改任何内部逻辑（流式模拟、参数控制、Toast 等）

### 全屏页面布局

```
┌──────────────────────────────────────────────────┐
│ ← 返回模型广场    模型名称    全屏测试台           │
│ 输入 ¥0.035 · 输出 ¥0.105 · 128K 上下文           │
├──────────────────────────────────────────────────┤
│                                                   │
│ ┌─ API Key ────────────┐ ┌─ 参数 ───────────┐    │
│ │ [选择已有 Key ▾] [+ 新建] │ │ ⚙ temp/maxtokens│  │
│ └──────────────────────────┘ └──────────────────┘ │
│                                                   │
│ ┌─ Prompt ──────────────────────────────────────┐ │
│ │                                               │ │
│ │  TextArea, 占页面宽度的绝大部分                 │ │
│ │                                               │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ Response ────────────────────────────────────┐ │
│ │  黑底白字代码风格 + 流式打印 + 绿色光标          │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ 预计消耗 ~XXX Tokens           [发送测试请求]      │
└──────────────────────────────────────────────────┘
```

### 数据流

1. 模型 Drawer 点击「全屏测试」→ `router.push(/playground?model=${data.nameId})`
2. PlaygroundPage 解析 `useSearchParams().get("model")`
3. 从 MOCK 数据中匹配 `ModelItem`
4. 渲染模型信息卡（名称、价格、上下文）
5. 渲染 `<Playground modelName={data.name} ... />`

### 员工准入

Playground 页面本身不做角色拦截——侧边栏中无此路由，只能通过模型 Drawer 进入。员工模式下的 Drawer 已隐藏路由/优选等管理操作，Playground 可正常使用。

## 约束

- 不修改 Playground 组件的行为逻辑
- 不新增第三方依赖
- 不修改 nav 配置（不走侧边栏）
