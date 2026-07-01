# Model Plaza (模型广场) Transformation Design

> ALiAPI Console — OpenRouter-inspired UX upgrade, Phase 1

## Overview

Transform the models browsing page from a "read-only catalog" into an "action-oriented model hub" — the first step in reframing the console user flow as a commodity-calling pipeline (select model → configure routing → create key → call → observe → settle).

Scope: single file — `src/app/(console)/models/page.tsx`. No new routes, no backend integration, no data fetching. All state is local mock.

## Design System

All new and modified UI elements follow the **Cal Design System** already applied in `globals.css`:

- **Colors**: `--color-primary` (#111111) for primary CTAs, `--color-canvas` (#ffffff) for page and card backgrounds, `--color-surface-card` (#f5f5f5) for badge and pill surfaces, `--color-ink` (#111111) for headlines, `--color-body` (#374151) for body text, `--color-muted` (#6b7280) for secondary text, `--color-hairline` (#e5e7eb) for borders.
- **Typography**: Cal Sans (Inter 600 substitute) for `--font-display`, Inter for `--font-sans`. Use existing `--text-*` tokens throughout.
- **Rounded**: `--radius-md` (8px) for buttons/inputs, `--radius-lg` (12px) for cards, `--radius-pill` for badges.
- **Spacing**: 4px base (`--spacing-*` tokens).
- **Buttons**: `button-primary` (`--color-primary` bg, `--color-on-primary` text, 40px h, `--radius-md`), `button-secondary` (`--color-canvas` bg, `--color-ink` text, 1px hairline border, 40px h, `--radius-md`).
- **Badges**: `badge-pill` (`--color-surface-card` bg, `--color-ink` text, `--typography.caption`, `--radius-pill`, padding 4px 12px).

## Changes

### 1. Model Card: Recommendation Tags

Add a row of recommendation tags between the cumulative usage number and the description, derived from model data:

| Condition | Tag Label |
|---|---|
| `hle >= 0.90` | 高质 |
| `inputPriceNum <= 0.01` | 省钱 |
| `hleLatency >= 0.90` | 低延迟 |
| `ctxLen` integer >= 128 | 长上下文 |

- Tags appear inline, separated by 4px gaps.
- Each tag uses Cal `badge-pill` styling: `--color-surface-card` background, `--color-ink` text, `--text-caption` (13px/500), `--radius-pill`, 4px 12px padding.
- Tags sit above the description, below the cumulative usage line.
- If no tags apply, render nothing (no empty placeholder).

### 2. Model Card: Hover Action Buttons

Replace the current two-button hover overlay (`查看详情` / `使用此模型`) with three buttons:

- **使用此模型创建 Key** — Cal `button-primary`: `--color-primary` bg, `--color-on-primary` text, 40px height, `--radius-md`, weight 600. Click → set a local state `redirectKeyModel` showing a confirmation toast, then navigate to `/keys?model=${model.nameId}`.
- **设为优选** — Cal `button-secondary`: `--color-canvas` bg, `--color-ink` text, 1px `--color-hairline` border. Click → toggle a local `preferredModels: Set<string>` state. Toast feedback: "已设为优选" / "已取消优选". When preferred, show a small ⭐ indicator on the card (top-right, non-hover state).
- **加入黑名单** — Cal `button-secondary` with `--color-error` text on hover. Same toggle pattern with `blacklistedModels: Set<string>`. When blacklisted, show a small 🚫 indicator on the card.

Layout: row with the primary button at left, two secondary buttons at right. All 40px height. Display only on hover via the existing `opacity-0 group-hover/card:opacity-100` pattern.

### 3. Detail Drawer: Enhanced Action Footer

Current drawer has a sticky footer with 2 buttons. Change to:

- **使用此模型创建 Key** — `button-primary`, full width. Same behavior as card hover.
- **设为优选 / 移除优选** — `button-secondary`, half width (50%). Toggle label and behavior.
- **加入黑名单 / 移出黑名单** — `button-secondary`, half width. Toggle label and behavior.
- **查看调用文档** — `button-text-link` (text-only, no background), below the row.

Layout: 3 rows in the sticky footer: primary button full width, secondary toggle row (2 buttons side by side), text link centered below.

Preferred/blacklisted state is shared between card and drawer via the same `useState` sets.

### 4. Filter Bar: Align to Cal Spec

Adjust existing filter bar elements to Cal `text-input` spec:

- **Search input**: Increase height from 36px to 40px. Padding: 10px 14px (currently 8px 12px). No other changes.
- **Select dropdowns**: Increase height from 36px to 40px. Same padding change.
- **Capability pills**: Already consistent with Cal `badge-pill`. No change.

### 5. Model Interface: Add Fields

Add convenience fields for tag derivation to the `ModelItem` interface (no mock data changes needed — values are computed):

```typescript
// Computed in render, not stored in mock
const recommendationTags = (m: ModelItem): string[] => {
  const tags: string[] = [];
  if (m.hle >= 0.90) tags.push("高质");
  if (m.inputPriceNum <= 0.01) tags.push("省钱");
  if (m.hleLatency >= 0.90) tags.push("低延迟");
  if ((parseInt(m.ctxLen) || 0) >= 128) tags.push("长上下文");
  return tags;
};
```

## State Changes

Add to the page component:

```typescript
const [preferredModels, setPreferredModels] = useState<Set<string>>(new Set());
const [blacklistedModels, setBlacklistedModels] = useState<Set<string>>(new Set());
```

These are local mock states. No persistence, no backend. Toggle functions shared between card hover and drawer.

## Files Changed

| File | Change |
|---|---|
| `src/app/(console)/models/page.tsx` | All changes — tags, hover buttons, drawer footer, filter bar sizing, new state |

No other files.

## Success Criteria

- Model cards show recommendation tags derived from data.
- Hover overlay shows 3 actionable buttons instead of 2.
- Detail drawer footer has the enhanced button set.
- Preferred/blacklisted state renders visual indicators on cards and toggles correctly in drawer.
- Filter bar elements align to Cal 40px spec.
- All added elements use Cal design system tokens.
- `npm run build` passes with no errors.
