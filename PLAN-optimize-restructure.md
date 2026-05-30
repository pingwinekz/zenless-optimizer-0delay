# Plan: Restructure zzz-optimizer to Match fribbels-hsr-optimizer Layout

## Overview

Transform the current vertical-stack optimize page into a **left panel (form + grid) + right sidebar** layout with collapsible form sections, ag-Grid results table, deferred rendering, and an analysis panel.

## Current State

| Aspect | Current zzz-optimizer | Target (fribbels pattern) |
|--------|----------------------|--------------------------|
| **Layout** | Vertical stack with sticky section headers | Left panel (1302px) + Right sidebar (233px) |
| **Form** | Single CardThemed with 3 filter cards in flex row | Collapsible Accordion sections with FormCard panels |
| **Results** | Simple card list (`GeneratedBuildsDisplay`) | ag-Grid data table with sorting/pagination |
| **Sidebar** | None | Sticky sidebar with permutations, controls, results, builds |
| **Stat Filters** | Dynamic tag-based add/remove | Compact min/max number input rows |
| **Analysis** | None | Expanded data panel with damage breakdowns |
| **Rendering** | All components mount immediately | Deferred rendering for progressive mount |

## Phase 1: Layout Primitives (Foundation)

Create shared layout components in `libs/zzz/page-optimize/src/layout/`:

### New Files

| File | Purpose |
|------|---------|
| `FilterContainer.tsx` | Vertical flex wrapper for form sections |
| `FormRow.tsx` | Collapsible Accordion section wrapping children |
| `FormCard.tsx` | Styled card panel with fixed height, configurable width |
| `FilterRow.tsx` | Compact min/max number input row for stat filters |

### FormCard Specifications

```tsx
// Widths: small=274px, medium=398px, large=1258px
// Height: 415px default
// Style: borderRadius: 6, backgroundColor: 'var(--layer-2)',
//         padding: 16, boxShadow: 'var(--shadow-card)'
```

### FormRow Specifications

```tsx
// Uses Mantine Accordion with multiple mode
// Controlled by menuState in useOptimizerDisplayStore
// Chevron on right, transition duration 200ms
// Children laid out in horizontal Flex gap=10
```

## Phase 2: Deferred Rendering

**New file:** `libs/common/ui/src/DeferredRender.tsx`

### Components

- `DeferCreateProvider` - Context provider tracking activation state
- `DeferCreate` - Wrapper that defers children until parent signals readiness

### Usage Pattern

```tsx
<DeferCreateProvider resetKey={null} enabled={activated}>
  <OptimizerForm />
  <DeferCreate>
    <OptimizerGrid />
  </DeferCreate>
  <DeferCreate>
    <BuildPreview />
    <ExpandedDataPanel />
  </DeferCreate>
</DeferCreateProvider>
```

### Purpose

Progressive mount: only visible tab content created on first load, background components mount at 100ms intervals.

## Phase 3: Form Restructuring

**New file:** `libs/zzz/page-optimize/src/Optimize/OptimizerForm.tsx`

### Current Form

Single `CardThemed` with `StatFilterCard`, `WengineFilter`, `DiscFilter` in a flex row.

### New Form Structure

```
FilterContainer (vertical)
  |
  +-- FormRow "Character Options" (Accordion)
  |     +-- FormCard: CharacterSelectorDisplay (character/wengine selection)
  |     +-- FormCard: CharacterConditionals (talent toggles)
  |     +-- FormCard: OptimizerOptionsDisplay (sort, limit, weights)
  |
  +-- FormRow "Disc & Stat Filters" (Accordion)
  |     +-- FormCard: RelicMainSetFilters (main stat selectors + set filters)
  |     +-- FormCard: SubstatWeightFilters (substat weight toggles)
  |     +-- FormCard: MinMaxStatFilters (compact min/max rows)
  |     +-- FormCard: MinMaxRatingFilters (compact min/max rows)
  |
  +-- FormRow "Wengine Filters" (Accordion)
        +-- FormCard: WengineFilter (level, type, conditionals)
```

### Key Changes

1. Wrap each section in `FormRow` (Accordion) for collapsibility
2. Move filters from modal-based to inline `FormCard` panels
3. Replace dynamic tag-based `StatFilterCard` with compact min/max `FilterRow` components
4. Move `WengineFilter` from modal to inline panel

## Phase 4: ag-Grid Integration

**New file:** `libs/zzz/page-optimize/src/Optimize/OptimizerGrid.tsx`

### Current

`GeneratedBuildsDisplay` renders builds as a simple card list.

### New

Replace with ag-Grid (`AgGridReact`) using `ag-theme-balham-dark`.

### Column Definitions

- Build index
- Optimization value (sortable)
- Key stats: ATK, HP, DEF, CRIT Rate, CRIT DMG, Anomaly Mastery, etc.
- Disc set bonuses
- Wengine name

### Integration Details

- Use `useOptimizerDisplayStore` for grid API reference
- Implement `OptimizerTabController` pattern for data source, sorting, filtering
- Cell click shows build preview in `BuildPreview` panel below grid
- Grid dimensions: 1302px wide, 600px tall (resizable vertically, min 300px)

### Grid Styling

```tsx
// Theme: ag-theme-balham-dark
// Width: 1302px, Height: 600px (resizable)
// Header height: 36px
// Resize: vertical, overflow: hidden
// Box shadow: var(--shadow-card-flat)
```

## Phase 5: Sidebar

**New file:** `libs/zzz/page-optimize/src/Sidebar/OptimizerSidebar.tsx`

### Structure

```
Flex (vertical column, 233px wide, sticky)
  |
  +-- PermutationsSection (disc/wengine permutation count)
  +-- OptimizerControlsSection (start/cancel buttons, worker selector)
  +-- ResultsSection (results count, sort selector)
  +-- BuildsSection (build management, equip button)
```

### Key Behaviors

- Sticky at `top: 253px` on desktop
- Fixed bottom bar on mobile (horizontal layout)
- Uses `useMediaQuery` from `@mantine/hooks` for responsive breakpoints (992px, 1200px, 1600px)

### Responsive Modes

| Breakpoint | Mode | Position |
|------------|------|----------|
| >= 1200px | Full sidebar | Sticky right, vertical column |
| 992-1199px | Compact | Fixed bottom bar, horizontal row |
| < 992px | Hidden or bottom bar | Based on user setting |

## Phase 6: Stat Filter Restructuring

**Modify:** `libs/zzz/page-optimize/src/Optimize/StatFilterCard.tsx`

### Current

Dynamic tag-based filters with add/remove buttons.

### New Components

#### MinMaxStatFilters

Compact rows for: ATK, HP, DEF, CRIT Rate, CRIT DMG, Anomaly Mastery, Anomaly Proficiency, PEN Ratio

#### MinMaxRatingFilters

Compact rows for damage ratings (if applicable to ZZZ).

### FilterRow Pattern

```tsx
<Flex justify='space-between' style={{ margin: 0 }}>
  <InputNumberStyled hideControls style={{ margin: 0, width: 63 }}
    value={min} onChange={setMin} />
  <FormStatTextStyled>{label}</FormStatTextStyled>
  <InputNumberStyled hideControls style={{ margin: 0, width: 63 }}
    value={max} onChange={setMax} />
</Flex>
```

## Phase 7: Analysis Panel

**New file:** `libs/zzz/page-optimize/src/Analysis/ExpandedDataPanel.tsx`

### Structure

- Shows detailed stats/damage breakdown for selected build
- Stat diff card (comparing selected build vs equipped)
- Substat upgrade suggestions
- Damage splits visualization

### Placement

Below the ag-Grid, alongside `BuildPreview`.

## Phase 8: Page Layout Integration

**Modify:** `libs/zzz/page-optimize/src/CharacterOptDisplay.tsx`

### Current Layout

```
Vertical Stack
  +-- CharacterSection (sticky header)
  +-- OptimizeSection (sticky header)
  +-- BuildsSection (sticky header)
```

### New Layout

```
Flex (horizontal row)
  |
  +-- Flex (vertical column, width: 1302px, gap: 10)
  |     +-- OptimizerForm (collapsible sections)
  |     +-- OptimizerGrid (ag-Grid)
  |     +-- BuildPreview + ExpandedDataPanel
  |
  +-- Sidebar (right side, sticky)
```

### Changes

1. Remove sticky `Section` header pattern
2. Wrap content in horizontal `Flex`
3. Left column: fixed 1302px width, vertical stack
4. Right column: `Sidebar` component (233px wide, sticky)

## Implementation Order

| Phase | Depends On | Estimated Complexity |
|-------|------------|---------------------|
| 1. Layout primitives | None | Low |
| 2. Deferred rendering | None | Low |
| 3. Form restructuring | Phase 1 | Medium |
| 4. ag-Grid integration | None | High |
| 5. Sidebar | None | Medium |
| 6. Stat filters | Phase 1 | Low |
| 7. Analysis panel | Phase 4 | Medium |
| 8. Page layout integration | Phases 1, 3, 4, 5 | Medium |

## Files to Create

| File | Purpose |
|------|---------|
| `libs/common/ui/src/DeferredRender.tsx` | Deferred rendering components |
| `libs/zzz/page-optimize/src/layout/FilterContainer.tsx` | Form container |
| `libs/zzz/page-optimize/src/layout/FormRow.tsx` | Collapsible accordion section |
| `libs/zzz/page-optimize/src/layout/FormCard.tsx` | Styled card panel |
| `libs/zzz/page-optimize/src/layout/FilterRow.tsx` | Min/max stat input row |
| `libs/zzz/page-optimize/src/Optimize/OptimizerForm.tsx` | Restructured form |
| `libs/zzz/page-optimize/src/Optimize/OptimizerGrid.tsx` | ag-Grid results table |
| `libs/zzz/page-optimize/src/Optimize/OptimizerTabController.ts` | Grid data controller |
| `libs/zzz/page-optimize/src/Optimize/RelicMainSetFilters.tsx` | Main stat + set filters |
| `libs/zzz/page-optimize/src/Optimize/SubstatWeightFilters.tsx` | Substat weight toggles |
| `libs/zzz/page-optimize/src/Optimize/MinMaxStatFilters.tsx` | Stat min/max filters |
| `libs/zzz/page-optimize/src/Optimize/MinMaxRatingFilters.tsx` | Rating min/max filters |
| `libs/zzz/page-optimize/src/Sidebar/OptimizerSidebar.tsx` | Right sidebar |
| `libs/zzz/page-optimize/src/Sidebar/PermutationsSection.tsx` | Permutation count display |
| `libs/zzz/page-optimize/src/Sidebar/OptimizerControlsSection.tsx` | Start/cancel controls |
| `libs/zzz/page-optimize/src/Sidebar/ResultsSection.tsx` | Results count + sort |
| `libs/zzz/page-optimize/src/Sidebar/BuildsSection.tsx` | Build management |
| `libs/zzz/page-optimize/src/Analysis/ExpandedDataPanel.tsx` | Detailed stats panel |
| `libs/zzz/page-optimize/src/Analysis/BuildPreview.tsx` | Selected build preview |

## Files to Modify

| File | Changes |
|------|---------|
| `libs/zzz/page-optimize/src/CharacterOptDisplay.tsx` | Restructure to horizontal layout |
| `libs/zzz/page-optimize/src/Optimize/index.tsx` | Integrate new form, grid, controller |
| `libs/zzz/page-optimize/src/Optimize/StatFilterCard.tsx` | Replace with MinMaxStatFilters |
| `libs/zzz/page-optimize/src/Optimize/DiscFilter.tsx` | Move to inline FormCard |
| `libs/zzz/page-optimize/src/Optimize/WengineFilter.tsx` | Move to inline FormCard |
| `libs/common/ui/src/index.ts` | Export DeferredRender components |

## Key Dependencies

- `ag-grid-community` ^35.3.0 (already installed)
- `ag-grid-react` ^35.3.0 (already installed)
- `@mantine/core` ^9.2.1 (already installed)
- `@mantine/hooks` ^9.2.1 (already installed)
- `@tabler/icons-react` (already installed)

## Notes

1. **Mantine Version**: zzz-optimizer uses Mantine 9, fribbels uses Mantine 7. Some API differences exist (e.g., `leftSection` vs `leftIcon` on Button). Use Mantine 9 APIs.

2. **Game Mechanics**: ZZZ has discs (not relics) and wengines (not light cones). Adapt component names and data structures accordingly.

3. **Solver Integration**: The existing `createSolverConfig()` in `libs/zzz/solver/` already works well. Keep it as-is, just restructure the UI around it.

4. **Styling Conventions**: zzz-optimizer uses inline `style` objects exclusively (no `sx` prop, no CSS modules in page-optimize). Follow this pattern.

5. **CSS Variables**: Use existing `var(--layer-*)`, `var(--shadow-card)`, `var(--mantine-color-*)` tokens. Do not introduce new CSS files.
