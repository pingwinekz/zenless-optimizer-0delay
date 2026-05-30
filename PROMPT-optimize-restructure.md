# Starting Prompt for Optimize Page Restructure

Use this prompt to kick off the implementation of the zzz-optimizer layout restructure.

---

## Prompt

I need to restructure the zzz-optimizer's optimize page to match the layout and UX patterns from fribbels-hsr-optimizer. The full plan is in `PLAN-optimize-restructure.md` in the repo root.

**Current state:** The optimize page at `libs/zzz/page-optimize/` uses a vertical stack layout with sticky section headers, simple card list for results, and modal-based filters.

**Target state:** A left panel (1302px) + right sidebar (233px) layout with:
- Collapsible Accordion form sections using FormCard panels
- ag-Grid for sortable/filterable results table
- Right sidebar with permutations, controls, results, builds
- Compact min/max stat filter rows (replacing dynamic tag-based filters)
- Deferred rendering for progressive mount
- Expanded data analysis panel

**Key files to reference:**
- `libs/zzz/page-optimize/src/` - Current optimize page structure
- `fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/` - Target patterns to replicate
- `libs/game-opt/solver/` - Existing solver infrastructure (keep as-is)
- `libs/zzz/solver/` - ZZZ solver adapter (keep as-is)

**Implementation order:**
1. Layout primitives (FilterContainer, FormRow, FormCard, FilterRow) in `libs/zzz/page-optimize/src/layout/`
2. Deferred rendering in `libs/common/ui/src/DeferredRender.tsx`
3. Form restructuring in `libs/zzz/page-optimize/src/Optimize/OptimizerForm.tsx`
4. ag-Grid integration in `libs/zzz/page-optimize/src/Optimize/OptimizerGrid.tsx`
5. Sidebar in `libs/zzz/page-optimize/src/Sidebar/`
6. Stat filters in `libs/zzz/page-optimize/src/Optimize/MinMaxStatFilters.tsx`
7. Analysis panel in `libs/zzz/page-optimize/src/Analysis/`
8. Page layout integration in `libs/zzz/page-optimize/src/CharacterOptDisplay.tsx`

**Important conventions:**
- Use Mantine 9 APIs (not Mantine 7 - fribbels uses Mantine 7)
- Use inline `style` objects exclusively (no `sx` prop, no CSS modules)
- Use existing CSS variables: `var(--layer-*)`, `var(--shadow-card)`, `var(--mantine-color-*)`
- Keep existing solver infrastructure unchanged
- ZZZ uses discs (not relics) and wengines (not light cones) - adapt names accordingly
- ag-Grid and all dependencies are already installed

Start with Phase 1 (layout primitives) and Phase 2 (deferred rendering) since they have no dependencies, then proceed through the phases in order.
