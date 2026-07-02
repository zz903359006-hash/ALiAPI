# OpenRouter 风格「选择→调用」快速流设计

## 背景
ALiAPI 控制台当前的"模型选择→创建Key→调用"流程需要经过模型广场（选模型）→ 4 步 Key 创建向导 → 复制代码，路径过长。参考 OpenRouter.ai 的轻量交互，将常用路径缩短为"选模型 → 选/建 Key → 复制代码"三步。

## 改动范围
- 仅修改 `src/app/(console)/models/page.tsx` — 在模型详情 Drawer 底部增加快速调用区
- 新建 `src/components/QuickKeyModal.tsx` — 快速 Key 创建 Modal

## 方案

### 模型详情 Drawer 底部增加「快速调用」区
- 选择一个已有 Key（dropdown），或新建快速 Key
- 选定后自动展示 OpenAI 兼容代码示例（cURL/Python/Node.js）
- 一键复制代码
- 代码中的 `model` 字段自动填入当前模型 ID

### 快速 Key 创建 Modal
- 只需要填写 Key 名称
- 路由策略默认"性价比优先"
- 确认后立即生成 Key，自动填入代码区

### 已有完整向导保留
- `/keys/create` 完整 4 步向导保留不变
- 快速 Key 用于开发/测试场景
