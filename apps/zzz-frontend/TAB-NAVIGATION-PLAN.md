# Tab-Based Navigation Migration Plan (fribbels-style)

## Goal

Replace `HashRouter` + `Routes` + `react-router-dom` with a Zustand-based tab navigation system, matching fribbels-hsr-optimizer's (cloned repo here /run/media/endmin/Data/fribbels-hsr-optimizer) UI performance: instant tab switching with no router/lazy overhead, URL hash sync preserved for bookmarks.

## Current State

- `react-router-dom` with `HashRouter`, `Route`, `Routes` in `apps/zzz-frontend/src/app/App.tsx`
- Pages eagerly imported (done in prior pass)
- Sidebar nav uses `useMatch` for active state, `Link` for navigation
- `page-characters` uses `useNavigate('/optimize?character=X')` — sets `dbMeta.optCharKey` then navigates
- `CharacterEditor` uses `useNavigate('/characters')` after deleting a character
- `Header` uses `Link` for logo → home

## Plan: 7 Steps

### Step 1 — Create `useTabStore` (Zustand)

**File:** `apps/zzz-frontend/src/app/useTabStore.ts`

```ts
type TabKey = 'home' | 'discs' | 'wengines' | 'characters' | 'optimize' | 'settings'

interface TabState {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
}
```

- On first access, read `window.location.hash` to determine initial tab (default `'home'`)
- On `setActiveTab`, call `window.history.pushState({}, '', '#/' + tab)` to sync URL
- Export a standalone `navigateToOptimize(characterKey?: string)` function that sets `dbMeta.optCharKey` + calls `setActiveTab('optimize')` — replacing the `useNavigate` calls in page-characters

### Step 2 — Add URL Hash Sync

In `App.tsx` or a dedicated `useHashSync` hook:

- `popstate` listener to sync `activeTab` when user hits back/forward
- Initial tab read from `window.location.hash` on mount
- Clean up listener on unmount

### Step 3 — Implement Staggered Mounting

Create a simple mounting scheduler (can live in `App.tsx` or a `TabRenderer` component):

- Only the **active tab** is rendered immediately (no change from current behavior)
- **Inactive tabs** mount one-by-one on a delay via `startTransition` + `setTimeout`
- Priority order: `optimize > characters > discs > wengines > settings > home`
- Keep a `mountedTabs: Set<TabKey>` state; a tab is added when its timer fires
- Each non-active tab only renders once added to `mountedTabs`
- This prevents the initial load from rendering all 6 page trees at once

### Step 4 — Rewrite `App.tsx`

**Before:**
```tsx
<HashRouter>
  <AdBlockContextWrapper>
    <Content />
  </AdBlockContextWrapper>
  <ScrollTop />
</HashRouter>
```

**After:**
```tsx
<AdBlockContextWrapper>
  <TabContent />
  <ScrollTop />
</AdBlockContextWrapper>
```

Where `TabContent`:
- Reads `activeTab` from `useTabStore`
- Uses staggered mount set to decide which pages to render
- Renders the active page + any mounted inactive pages (CSS `display: none` for inactive)
- Mounts `popstate` listener

### Step 5 — Update `MenuDrawer.tsx` (Sidebar Nav)

**Replace:**
```tsx
import { useMatch, Link as RouterLink } from 'react-router-dom'
const match = useMatch({ path: '/:currentTab', end: false })
const currentTab = match?.params?.currentTab ?? '__home'
// ...
<RouterLink to={item.to} ...>
```

**With:**
```tsx
import { useTabStore } from './useTabStore'
const activeTab = useTabStore((s) => s.activeTab)
// ...
<button onClick={() => setActiveTab(item.value)} data-active={item.value === activeTab}>
  {item.icon}
  <span>{item.label}</span>
</button>
```

Use `<UnstyledButton>` from Mantine if needed for styling consistency.

### Step 6 — Update `Header.tsx` (Logo Link)

**Replace:**
```tsx
<Flex component={RouterLink as any} {...({ to: '/' } as any)} ...>
```

**With:**
```tsx
<Flex onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }} ...>
```

### Step 7 — Remove `react-router-dom` Usages in Page Libraries

**7a — `libs/zzz/page-characters/src/index.tsx`** (2 calls):

```tsx
// Before:
const navigate = useNavigate()
// …
database.dbMeta.set({ optCharKey: focusCharacter })
navigate(`/optimize?character=${focusCharacter}`)

// After:
import { useTabStore } from '../../../../apps/zzz-frontend/src/app/useTabStore'
// …but cross-lib imports are discouraged. Instead, use a callback prop pattern:
// Option A: Pass onNavigateToOptimize as a prop from the app
// Option B: Export a standalone navigate function from a shared util
// Option C: Read/store the navigate function in a React context provided by App
```

**Recommended approach:** Provide a `NavigateContext` (React context) from `App.tsx` that exposes `navigateToOptimize(ck)` and `navigateToHome()`. The page libraries consume this context instead of importing `react-router-dom`. This keeps the libs framework-agnostic.

**7b — `libs/zzz/formula-ui/src/char/CharacterEditor.tsx`** (1 call):

```tsx
// Before:
const navigate = useNavigate()
navigate('/characters')

// After: consume NavigateContext
const { navigateToCharacters } = useNavigateContext()
// or simpler: just close the modal (onClose) since the character is already removed from the list
```

Since this is called after deleting a character, it can either:
- Close the modal (already has `onClose` prop) — the user stays on the character list
- Or call `navigateToCharacters()` from context

The `onClose` approach is simpler and better UX.

---

## Files to Create

| File | Purpose |
|---|---|
| `apps/zzz-frontend/src/app/useTabStore.ts` | Zustand store for active tab + hash sync |
| `apps/zzz-frontend/src/app/NavigateContext.tsx` | React context for cross-page navigation (learns tab store) |

## Files to Modify

| File | Changes |
|---|---|
| `apps/zzz-frontend/src/app/App.tsx` | Remove HashRouter, use tab store + staggered mount |
| `apps/zzz-frontend/src/app/MenuDrawer.tsx` | Replace `useMatch`/`Link` with tab store |
| `apps/zzz-frontend/src/app/Header.tsx` | Replace `Link` with tab store |
| `libs/zzz/page-characters/src/index.tsx` | Replace `useNavigate` with `NavigateContext` |
| `libs/zzz/formula-ui/src/char/CharacterEditor.tsx` | Replace `useNavigate` with `onClose` or context |

## Not Changed

- `LayoutSider.tsx` — no react-router usage, just renders MenuDrawer
- `Sidebar.module.css` — no changes needed
- Page library entry points — only the two files listed above use react-router

## Edge Cases

| Case | Handling |
|---|---|
| **Browser back/forward** | `popstate` listener in `App.tsx` updates `activeTab` |
| **Bookmark / direct URL with hash** | `useTabStore` reads `window.location.hash` on init |
| **Character → Optimize flow** | Sets `dbMeta.optCharKey` + `setActiveTab('optimize')` + `pushState` |
| **Concurrent tab switches** | Each `setActiveTab` is synchronous via Zustand; `pushState` is immediate |
| **Old react-router imports** | After removing `HashRouter`, the `Routes`/`Route`/`Navigate` components won't be available in the tree. Page libs must not call them. |
| **Server-side rendering** | N/A (CSR-only SPA) |

## Risks

- **Cross-lib import** — page libs importing from `apps/zzz-frontend/` is a bad practice. Use `NavigateContext` (provided by App, consumed by libs) as the clean boundary.
- **Bundle size** — The staggered mount pattern adds minimal code (<50 lines). No new dependencies.
- **Regression** — Hash-based bookmarks must continue to work. Test all 6 routes with direct URL entry.
