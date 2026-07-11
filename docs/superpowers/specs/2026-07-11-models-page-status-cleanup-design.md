# 模型广场详情抽屉状态/折扣/可用率标签清理设计

## 概述

对 `src/app/(console)/models/page.tsx` 进行状态相关标签的彻底清理，移除所有状态、折扣和可用率相关字段及其 UI 渲染，简化模型详情抽屉和列表视图。

## 范围

单文件改动：`src/app/(console)/models/page.tsx`

## 数据模型清理

### ModelItem 接口
- 移除字段：`status`、`discount`、`availability`、`availabilityTrend`
- 保留字段：`id`、`name`、`nameId`、`category`、`provider`、`providerColor`、`description`、`inputPrice`、`outputPrice`、`inputPriceNum`、`outputPriceNum`、`ctxLen`、`maxOutput`、`hle`、`hleAccuracy`、`hleHallucination`、`hleStability`、`hleLatency`、`inputModes`、`outputModes`、`capabilities`、`cumulativeUsage`、`supplierCount`、`lastUpdated`、`suppliers`

### suppliers 项类型
- 移除字段：`availability`
- 保留字段：`name`、`color`、`latency`

## Mock 数据清理

- 清除所有 6 个模型条目中的 `status`、`discount`、`availability`、`availabilityTrend` 属性
- 清除所有 supplier 对象中的 `availability` 属性

## UI 清理

### 详情抽屉标题区
- 移除 `<StatusDot s={data.status} />` 组件
- 移除折扣标签渲染代码 `{data.discount && <span>...</span>}`
- 保留模型 ID 复制按钮和关闭按钮

### 列表视图表格
- 移除表头中的「状态」列（`<Th2>状态</Th2>`）
- 移除表头中的「可用率」列（`<Th2>可用率</Th2>`）
- 移除状态单元格 `<Td2><StatusDot s={m.status} /></Td2>`
- 移除可用率单元格（包含百分比和趋势柱状图）
- 表格从 8 列变为 6 列：模型、类型、输入、输出、上下文、操作

### 供应商通道行
- 移除状态 pill 渲染及相关 `statusMap` 映射
- 移除可用率数值显示（`supplier.availability.toFixed(2)%`）
- 移除「可用率」标签
- 简化行布局，移除状态列和可用率列

### 其他 UI 文本
- 更新「综合推荐」排序 tooltip，移除可用率相关文案

## 死代码清理

- 删除 `StatusDot` 组件定义
- 更新 `recommendationTags` 函数，移除 `m.availability >= 99.9` 的热门判断条件
- 删除 `SupplierChannelRow` 中的 `statusMap` 常量和相关变量

## 影响

- 列表表格列数从 8 列变为 6 列，布局保持整齐
- 供应商通道行视觉更简洁
- 数据层彻底清理，无残留字段
- 所有状态/折扣/可用率相关逻辑完全移除

## 实施顺序

1. 更新 `ModelItem` 接口，移除 4 个字段
2. 更新 `suppliers` 项类型，移除 `availability`
3. 清理 Mock 数据，删除所有相关字段
4. 清理详情抽屉标题区
5. 清理列表视图表格
6. 清理供应商通道行
7. 删除 `StatusDot` 组件
8. 更新 `recommendationTags` 和 tooltip 文案
