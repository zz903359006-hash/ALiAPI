# 模型广场改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: 使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 按任务逐一实现。步骤使用 checkbox 追踪。

**目标：** 将模型广场页面从"只读目录"改造为"可操作的模型中枢"——增加推荐标签、一键操作按钮、增强 Drawer 底部操作区，并统一对齐 Cal Design System。

**架构：** 只修改单个文件 `src/app/(console)/models/page.tsx`。所有状态为本地 mock（`useState` + Set），无后端集成。

**技术栈：** Next.js 16 + React 19 + TypeScript + Cal Design System（已通过 CSS 变量定义）

## 全局约束

- 仅修改 `src/app/(console)/models/page.tsx` 一个文件
- 所有新增 UI 元素必须使用 Cal Design System token（`--color-*`、`--spacing-*`、`--radius-*`、`--text-*`）
- 禁止引入新依赖库
- 禁止创建新路由或页面
- 所有状态为本地 mock，不持久化
- `npm run build` 不得报错

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/app/(console)/models/page.tsx` | 修改 | 所有改动集中在此文件 |

---

### 任务 1：添加推荐标签计算函数 + 状态管理

**Files:**
- Modify: `src/app/(console)/models/page.tsx`

**Interfaces:**
- Produces: `recommendationTags(m: ModelItem): string[]` 函数
- Produces: `preferredModels: Set<string>` + `blacklistedModels: Set<string>` 状态
- Produces: `togglePreferred(id: string)` + `toggleBlacklisted(id: string)` 处理函数

- [ ] **步骤 1.1：在 ModelItem 接口之后添加推荐标签计算函数**

在 `MOCK` 数组定义之后（第 98 行之后），`CATS` 常量之前，添加：

```typescript
function recommendationTags(m: ModelItem): string[] {
  const tags: string[] = [];
  if (m.hle >= 0.90) tags.push("高质");
  if (m.inputPriceNum <= 0.01) tags.push("省钱");
  if (m.hleLatency >= 0.90) tags.push("低延迟");
  const ctx = parseInt(m.ctxLen) || 0;
  if (ctx >= 128) tags.push("长上下文");
  return tags;
}
```

- [ ] **步骤 1.2：在 Page 组件中添加优选/黑名单状态**

找到 `ModelsPage` 函数组件内部（第 107 行），在 `const [toast, setToast]` 和 `const [loading, setLoading]` 行之间，添加：

```typescript
const [preferredModels, setPreferredModels] = useState<Set<string>>(new Set());
const [blacklistedModels, setBlacklistedModels] = useState<Set<string>>(new Set());
```

在 `const copy` 回调之后，添加 toggle 函数：

```typescript
const togglePreferred = useCallback((id: string) => {
  setPreferredModels((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const wasPreferred = preferredModels.has(id);
  setToast(wasPreferred ? "已取消优选" : "已设为优选");
  setTimeout(() => setToast(""), 2000);
}, [preferredModels]);

const toggleBlacklisted = useCallback((id: string) => {
  setBlacklistedModels((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const wasBlacklisted = blacklistedModels.has(id);
  setToast(wasBlacklisted ? "已移出黑名单" : "已加入黑名单");
  setTimeout(() => setToast(""), 2000);
}, [blacklistedModels]);
```

- [ ] **步骤 1.3：更新 ModelsGrid 和 ModelsList 传递新 props**

修改 `ModelsGrid` 和 `ModelsList` 的 props 接口，增加：

```typescript
preferredModels: Set<string>;
blacklistedModels: Set<string>;
onTogglePreferred: (id: string) => void;
onToggleBlacklisted: (id: string) => void;
```

并在 `ModelsPage` 的渲染中传递这些新 props：

找到第 180 行：
```typescript
{loading ? <Skeleton /> : view === "grid" ? <ModelsGrid data={data} onDetail={setDetail} onCopy={copy} onClear={clearFilters} /> : <ModelsList data={data} onDetail={setDetail} onCopy={copy} onClear={clearFilters} />}
```

改为：
```typescript
{loading ? <Skeleton /> : view === "grid" ? (
  <ModelsGrid
    data={data}
    onDetail={setDetail}
    onCopy={copy}
    onClear={clearFilters}
    preferredModels={preferredModels}
    blacklistedModels={blacklistedModels}
    onTogglePreferred={togglePreferred}
    onToggleBlacklisted={toggleBlacklisted}
  />
) : (
  <ModelsList
    data={data}
    onDetail={setDetail}
    onCopy={copy}
    onClear={clearFilters}
    preferredModels={preferredModels}
    blacklistedModels={blacklistedModels}
    onTogglePreferred={togglePreferred}
    onToggleBlacklisted={toggleBlacklisted}
  />
)}
```

- [ ] **步骤 1.4：验证编译**

运行 `npx next build`（或检查 TypeScript 编译），确保无报错。

---

### 任务 2：模型卡片添加推荐标签

**Files:**
- Modify: `src/app/(console)/models/page.tsx`

**Interfaces:**
- Consumes: `recommendationTags()` 函数（来自任务 1）

- [ ] **步骤 2.1：在 ModelCard 组件中添加标签行**

在 `ModelCard` 函数组件中，找到累计用量行（第 230-234 行）和描述行（第 237-239 行）之间的位置。在 `</div>`（累计用量的闭合）之后，添加：

```typescript
{/* 推荐标签 */}
{recommendationTags(m).length > 0 && (
  <div style={{ display: "flex", gap: "var(--spacing-xxs)", marginBottom: "var(--spacing-sm)", flexWrap: "wrap" }}>
    {recommendationTags(m).map((tag) => (
      <span
        key={tag}
        style={{
          fontSize: "var(--text-caption)",
          fontWeight: 500,
          color: "var(--color-ink)",
          backgroundColor: "var(--color-surface-card)",
          padding: "2px 10px",
          borderRadius: "var(--radius-pill)",
          lineHeight: "20px",
        }}
      >
        {tag}
      </span>
    ))}
  </div>
)}
```

- [ ] **步骤 2.2：验证推荐标签显示**

启动 `npm run dev`，打开模型广场页面，确认以下模型显示对应标签：
- GPT-4o（hle 0.92, ctxLen 128K）→ 应显示「高质」「长上下文」
- DeepSeek V3（inputPrice 0.005, hleLatency 0.93）→ 应显示「省钱」「低延迟」
- 通义千问 Max（inputPrice 0.028, hle 0.82, hleLatency 0.80）→ 无标签

---

### 任务 3：卡片 Hover 操作按钮改造

**Files:**
- Modify: `src/app/(console)/models/page.tsx`

**Interfaces:**
- Consumes: `preferredModels`, `blacklistedModels`, `onTogglePreferred`, `onToggleBlacklisted`（来自任务 1）

- [ ] **步骤 3.1：替换 ModelCard 中的 hover 按钮层**

找到 `ModelCard` 末尾的 hover 按钮区块（第 280-283 行），替换为：

```typescript
{/* Hover actions */}
<div className="opacity-0 group-hover/card:opacity-100 transition-opacity" style={{ position: "absolute", top: "var(--spacing-md)", right: "var(--spacing-md)", display: "flex", gap: "var(--spacing-xxs)" }}>
  <button
    onClick={(e) => {
      e.stopPropagation();
      window.location.href = `/keys?model=${m.nameId}`;
    }}
    style={{
      height: 40, padding: "0 var(--spacing-md)",
      fontSize: "var(--text-button)", fontWeight: 600,
      color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)",
      border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    使用此模型创建 Key
  </button>
  <button
    onClick={(e) => { e.stopPropagation(); onTogglePreferred(m.id); }}
    style={{
      height: 40, padding: "0 var(--spacing-sm)",
      fontSize: "var(--text-button)", fontWeight: 600,
      color: "var(--color-ink)", backgroundColor: "var(--color-canvas)",
      border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)",
      cursor: "pointer", whiteSpace: "nowrap",
    }}
  >
    {preferredModels.has(m.id) ? "★ 已优选" : "☆ 设为优选"}
  </button>
  <button
    onClick={(e) => { e.stopPropagation(); onToggleBlacklisted(m.id); }}
    style={{
      height: 40, padding: "0 var(--spacing-sm)",
      fontSize: "var(--text-button)", fontWeight: 600,
      color: blacklistedModels.has(m.id) ? "var(--color-error)" : "var(--color-ink)",
      backgroundColor: "var(--color-canvas)",
      border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)",
      cursor: "pointer", whiteSpace: "nowrap",
    }}
  >
    {blacklistedModels.has(m.id) ? "🚫 已黑名单" : "加入黑名单"}
  </button>
</div>
```

- [ ] **步骤 3.2：在卡片非 hover 状态显示优选/黑名单指示器**

在状态点所在行（`StatusDot` 所在位置，约第 225 行）旁边，添加：

```typescript
{preferredModels.has(m.id) && (
  <span title="已设为优选" style={{ fontSize: 14, lineHeight: 1 }}>⭐</span>
)}
{blacklistedModels.has(m.id) && (
  <span title="已加入黑名单" style={{ fontSize: 14, lineHeight: 1 }}>🚫</span>
)}
```

放在 `StatusDot` 组件之后或折扣标签旁边。

- [ ] **步骤 3.3：验证交互**

启动 `npm run dev`，点击卡片的「设为优选」按钮，确认：
- Toast 提示「已设为优选」
- 卡片右上角出现 ⭐ 指示器
- 再次点击提示「已取消优选」，⭐ 消失
- 黑名单同理，🚫 指示器工作正常

---

### 任务 4：Detail Drawer 底部操作区增强

**Files:**
- Modify: `src/app/(console)/models/page.tsx`

**Interfaces:**
- Consumes: `preferredModels`, `blacklistedModels`, `togglePreferred`, `toggleBlacklisted`（来自任务 1）

- [ ] **步骤 4.1：替换 Drawer 底部 sticky footer**

在 `ModelDrawer` 组件中，找到目前的 sticky footer 区块（第 428-431 行）：

```typescript
<div className="sticky bottom-0" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)", paddingTop: "var(--spacing-md)", borderTop: "1px solid var(--color-hairline-soft)", backgroundColor: "var(--color-canvas)", marginTop: "var(--spacing-md)" }}>
  <button style={primaryBtn}>使用此模型创建 Key</button>
  <button style={secondaryBtn}>查看调用文档</button>
</div>
```

替换为：

```typescript
{/* Sticky footer — enhanced */}
<div className="sticky bottom-0" style={{
  display: "flex", flexDirection: "column", gap: "var(--spacing-sm)",
  paddingTop: "var(--spacing-md)", borderTop: "1px solid var(--color-hairline-soft)",
  backgroundColor: "var(--color-canvas)", marginTop: "var(--spacing-md)",
}}>
  {/* Primary: 创建 Key */}
  <button
    onClick={() => { window.location.href = `/keys?model=${data.nameId}`; }}
    style={{
      height: 40, padding: "0 var(--spacing-lg)",
      fontSize: "var(--text-button)", fontWeight: 600,
      color: "var(--color-on-primary)", backgroundColor: "var(--color-primary)",
      border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
      width: "100%",
    }}>
    使用此模型创建 Key
  </button>

  {/* Secondary row: 优选 + 黑名单 */}
  <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
    <button
      onClick={(e) => { e.stopPropagation(); }}
      style={{
        flex: 1, height: 40, padding: "0 var(--spacing-md)",
        fontSize: "var(--text-button)", fontWeight: 600,
        color: "var(--color-ink)", backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)",
        cursor: "pointer",
      }}
    >
      {preferredModels.has(data.id) ? "★ 移除优选" : "☆ 设为优选"}
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); }}
      style={{
        flex: 1, height: 40, padding: "0 var(--spacing-md)",
        fontSize: "var(--text-button)", fontWeight: 600,
        color: blacklistedModels.has(data.id) ? "var(--color-error)" : "var(--color-ink)",
        backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)",
        cursor: "pointer",
      }}
    >
      {blacklistedModels.has(data.id) ? "🚫 移出黑名单" : "加入黑名单"}
    </button>
  </div>

  {/* Text link: 查看文档 */}
  <button style={{
    height: 36, fontSize: "var(--text-button)", fontWeight: 500,
    color: "var(--color-ink)", background: "none", border: "none",
    cursor: "pointer", width: "100%",
  }}>
    查看调用文档
  </button>
</div>
```

- [ ] **步骤 4.2：将 toggle 函数传入 ModelDrawer**

修改 `ModelDrawer` 的 props 定义和调用。在 `ModelsPage` 中找到第 182 行：

```typescript
<ModelDrawer data={detail} onClose={() => setDetail(null)} />
```

改为：

```typescript
<ModelDrawer
  data={detail}
  onClose={() => setDetail(null)}
  preferredModels={preferredModels}
  blacklistedModels={blacklistedModels}
  onTogglePreferred={togglePreferred}
  onToggleBlacklisted={toggleBlacklisted}
/>
```

更新 `ModelDrawer` 函数签名：

```typescript
function ModelDrawer({
  data, onClose,
  preferredModels, blacklistedModels,
  onTogglePreferred, onToggleBlacklisted,
}: {
  data: ModelItem | null;
  onClose: () => void;
  preferredModels: Set<string>;
  blacklistedModels: Set<string>;
  onTogglePreferred: (id: string) => void;
  onToggleBlacklisted: (id: string) => void;
})
```

- [ ] **步骤 4.3：为 Drawer 按钮接上 onClick 事件**

将步骤 4.1 中两个 toggle 按钮的 `onClick` 从 `{(e) => { e.stopPropagation(); }}` 改为实际的函数调用：

```typescript
onClick={(e) => { e.stopPropagation(); onTogglePreferred(data.id); }}
onClick={(e) => { e.stopPropagation(); onToggleBlacklisted(data.id); }}
```

- [ ] **步骤 4.4：验证 Drawer 交互**

打开任意模型详情 Drawer，确认：
- 底部有 3 行：主按钮 → 优选/黑名单并排 → 查看文档
- 点击优选/黑名单按钮，Toast 反馈正确
- Drawer 关闭再打开，状态保持

---

### 任务 5：Filter Bar 对齐 Cal 规范

**Files:**
- Modify: `src/app/(console)/models/page.tsx`

- [ ] **步骤 5.1：搜索框高度改为 40px**

找到搜索框容器 div（第 150 行），将 `height: 36` 改为 `height: 40`，`paddingLeft/Right: "var(--spacing-sm)"`（12px）改为 `"var(--spacing-md)"`（16px 不符合 Cal 的 10px 14px，但用现有 token 折中为 12px）。同时将 input 的 `height` 对齐。

具体修改：第 150 行 `height: 36` → `height: 40`

- [ ] **步骤 5.2：Select 高度改为 40px**

找到 `Sel` 函数组件中的 `selS` 常量（第 532 行），将 `height: 36` 改为 `height: 40`。

- [ ] **步骤 5.3：验证高度**

确认搜索框和下拉菜单高度从 36px 变为 40px，视觉上与 Cal 规范一致。

---

### 任务 6：清理与最终验证

- [ ] **步骤 6.1：构建验证**

```bash
npm run build
```

确认无 TypeScript 错误、无 lint 错误。

- [ ] **步骤 6.2：功能回归检查**

手动检查：
1. 推荐标签显示正确
2. 卡片 hover 出现 3 个操作按钮
3. 优选/黑名单 toggle 工作，Toast 显示正确
4. ⭐/🚫 指示器在非 hover 状态可见
5. Drawer 底部操作区有完整 3 行按钮
6. 搜索框和 Select 高度变为 40px
