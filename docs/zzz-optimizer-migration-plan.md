# ZZZ Optimizer Migration Plan: Fribbels UI Pattern

## Overview
Replace the current ZZZ page-optimize vertical sticky-section layout with the Fribbels HSR Optimizer's horizontal flex layout (form + grid + sidebar). This migration will modernize the UI, improve UX, and align with proven optimizer patterns.

---

## Phase 1: Foundation & Layout Restructuring

### 1.1 Create New Layout Structure
- [ ] Create new root component `ZZZOptimizerTab` following Fribbels' `OptimizerTab.tsx` pattern
- [ ] Implement horizontal flex layout: `OptimizerForm` (left) + `OptimizerGrid` (center) + `Sidebar` (right)
- [ ] Add responsive behavior for mobile (compact bottom bar mode)
- [ ] Create `FilterContainer`, `FormCard`, `FormRow` layout components (adapt from Fribbels)

### 1.2 Sidebar Infrastructure
- [ ] Create `OptimizerSidebar` component with full-size and compact modes
- [ ] Implement `PermutationsSection` - show disc slot counts, total permutations, progress bar
- [ ] Implement `OptimizerControlsSection` - Optimize/Cancel/Reset buttons
- [ ] Add `ProgressDisplay` with animated progress bar and ETA
- [ ] Implement `ResultsSection` - Equip, Filter, Clear buttons

### 1.3 Grid Infrastructure
- [ ] Replace current `OptimizerGrid` with Fribbels-style AG Grid implementation
- [ ] Add dynamic columns based on stat display mode
- [ ] Implement row selection and build preview on click
- [ ] Add resizable height support

---

## Phase 2: Character & Target Selection

### 2.1 Character Selector Panel
- [ ] Create `CharacterSelectorDisplay` component
  - Character dropdown with icon
  - W-Engine dropdown with icon
  - Character level/dupes selector (0-6)
  - W-Engine superimposition selector (1-5)
- [ ] Create `CharacterPreviewPanel` showing character + W-Engine images
- [ ] Add presets button with dropdown menu

### 2.2 Optimization Target Panel
- [ ] Migrate `OptTargetRow` into form layout
- [ ] Create `OptTargetSelector` with grouped categories (DMG, Stats)
- [ ] Add `CritModeSelector`, `SpecificDmgTypeSelector`
- [ ] Add `AfterShockToggle` (game-specific)

### 2.3 Sort & Limit Controls
- [ ] Add sort-by target dropdown (grouped by DMG and stat options)
- [ ] Add result limit dropdown (Top 1, 5, 10, 50, 100, 1000)

---

## Phase 3: Disc/W-Engine Filters

### 3.1 Main Stat & Set Filters
- [ ] Create `DiscMainSetFilters` component
  - Main stat selector for slots 4, 5, 6 (toggle buttons)
  - Disc set filter with modal
  - W-Engine filter with modal
- [ ] Implement `DiscSetFilterModal` with:
  - Search input
  - 2-piece/4-piece mode toggle
  - Set grid with icons and names
  - Stat chips for filtering
  - Selected sets as removable badges
- [ ] Implement `WEngineFilterModal` with:
  - Level filter slider
  - Specialty selector (Attack, Anomaly, Stun, Support, Defense, Rupture)
  - Conditional configuration grid

### 3.2 Disc Level Filter
- [ ] Create `DiscLevelFilter` with min/max sliders
- [ ] Add "Use Equipped Discs" toggle
- [ ] Add "Include Offsets" option for off-set discs

### 3.3 Advanced Set Conditionals
- [ ] Create `FormSetConditionals` drawer
  - Two-column layout for disc and W-Engine sets
  - Toggle switches for conditional effects
  - Support for numeric/select conditionals

---

## Phase 4: Stat Filters & Weights

### 4.1 Substat Weight Filters (NEW)
- [ ] Create `SubstatWeightFilters` component
- [ ] Implement weight sliders (0-1) for each substat:
  - ATK%, HP%, DEF%, Crit Rate, Crit DMG
  - PEN Ratio, Anomaly Proficiency, Anomaly Mastery
  - Impact, Energy Regen
- [ ] Add minimum weighted rolls slider (0-5)
- [ ] Add weight presets (e.g., "Balanced", "DPS Focus", "Tank")

### 4.2 Min/Max Stat Filters
- [ ] Enhance `MinMaxStatFilters` with Fribbels-style layout
- [ ] Group filters by category (HP, ATK, DEF, Crit, etc.)
- [ ] Add `FilterRow` component for each stat (min input - label - max input)
- [ ] Include rating filters:
  - EHP (Effective HP)
  - DPS scores for different damage types
  - Anomaly damage scores

### 4.3 Custom Stat Inputs
- [ ] Create `AdvancedOptionsPanel` with buttons for:
  - Custom Bonus Stats (drawer)
  - Combat Buffs (drawer)
  - Enemy Configurations (drawer)
- [ ] Implement `CombatBuffsDrawer` with numeric inputs for team buffs
- [ ] Implement `EnemyConfigDrawer` with level, DEF, resistance settings

---

## Phase 5: Conditionals & Teammates

### 5.1 Character Conditionals
- [ ] Create `CharacterConditionalsDisplay` component
- [ ] Implement `FormSwitch` for boolean conditionals
- [ ] Implement `FormSlider` for numeric conditionals
- [ ] Implement `FormSelect` for select-type conditionals
- [ ] Add hover popover descriptions for each conditional

### 5.2 W-Engine Conditionals
- [ ] Create `WEngineConditionalsDisplay` component
- [ ] Show equipped W-Engine conditionals
- [ ] Allow configuring conditional states

### 5.3 Teammate Cards (NEW)
- [ ] Create `TeammateCard` component (full implementation)
  - Character select dropdown
  - Character conditionals
  - W-Engine select
  - W-Engine conditionals
  - Disc set selectors (2-piece/4-piece)
  - Sync from roster button
- [ ] Support 2 teammate slots
- [ ] Show teammate stats in optimizer calculations

---

## Phase 6: Rotation/Combo System (NEW)

### 6.1 Combo Filter Panel
- [ ] Create `ComboFilter` component
- [ ] Implement Simple/Advanced mode toggle
- [ ] Add ability selectors for each turn slot
- [ ] Add row controls (add/remove/reset)
- [ ] Add presets dropdown for common rotations

### 6.2 Combo Drawer
- [ ] Create `ComboDrawer` slide-in component
- [ ] Implement `ComboHeader` with ability selectors per turn
- [ ] Implement `StateDisplay` for conditional activations
- [ ] Add drag-to-toggle with react-selecto
- [ ] Support boolean, numeric, and select conditionals per turn

---

## Phase 7: Analysis & Data Panel

### 7.1 Expanded Data Panel
- [ ] Create `ExpandedDataPanel` with accordion sections
- [ ] Implement `StatsDiffCard` - side-by-side stat comparison
- [ ] Show character portrait, W-Engine, and stat diff table
- [ ] Highlight improvements/degradations

### 7.2 Damage Analysis (NEW)
- [ ] Create `DamageSplitsChart` - horizontal stacked bar chart
  - Show damage by ability and type
  - Custom legend and tooltips
- [ ] Create `DamageTagPieChart` - donut chart for damage distribution
  - Include data table with percentages

### 7.3 Upgrade Recommendations (NEW)
- [ ] Create `SubstatUpgrades` table
  - Show impact of +1 roll per substat
  - Rank by DPS and EHP improvement
- [ ] Create `TeammateUpgrades` table
  - Show effect of changing teammate sets
  - Show effect of swapping teammates

---

## Phase 8: Build Management

### 8.1 Build Results Display
- [ ] Enhance `GeneratedBuildsDisplay` with Fribbels-style layout
- [ ] Each build card shows:
  - Build number and optimization value
  - "Equip to Current" button
  - All 6 disc cards with stats
  - W-Engine card
  - Disc set summary
- [ ] Add build comparison mode

### 8.2 Save/Load System (NEW)
- [ ] Create `BuildsSection` with Save/Load buttons
- [ ] Implement save build modal with name input
- [ ] Implement load build modal with build list
- [ ] Store builds in database with metadata
- [ ] Support export/import builds

### 8.3 Build Pins (NEW)
- [ ] Add "Pin Build" button to grid rows
- [ ] Show pinned builds in sidebar
- [ ] Allow clearing all pins

---

## Phase 9: Stat Simulation (NEW)

### 9.1 Simulation Panel
- [ ] Create `StatSimulationDisplay` component
- [ ] Add On/Off mode toggle
- [ ] Implement simulated builds grid
- [ ] Add Simulate/Import/Conditionals buttons

### 9.2 Simulation Inputs
- [ ] Create `SimulationInputs` panel
- [ ] Implement set selection (2 disc + 1 W-Engine)
- [ ] Implement main stat selection for each slot
- [ ] Implement substat roll inputs (max 54 rolls)
- [ ] Add simulation name text field

### 9.3 Simulation Management
- [ ] Save simulation from current form
- [ ] Overwrite existing simulation
- [ ] Delete all simulations
- [ ] Load simulation into form

---

## Phase 10: Polish & Integration

### 10.1 Responsive Design
- [ ] Implement mobile layout (compact bottom bar)
- [ ] Add media query breakpoints
- [ ] Test on various screen sizes

### 10.2 State Management
- [ ] Integrate with existing Zustand stores
- [ ] Add `useOptimizerDisplayStore` for UI state
- [ ] Add `useOptConfigStore` for optimizer configuration
- [ ] Ensure state persistence

### 10.3 Performance Optimization
- [ ] Add deferred rendering for progressive mount
- [ ] Implement virtual scrolling for large result sets
- [ ] Optimize re-renders with React.memo and useMemo

### 10.4 Accessibility
- [ ] Add keyboard navigation
- [ ] Add ARIA labels
- [ ] Test with screen readers

---

## Phase 11: Testing & Documentation

### 11.1 Unit Tests
- [ ] Test all new components
- [ ] Test state management logic
- [ ] Test filter calculations

### 11.2 Integration Tests
- [ ] Test complete optimization flow
- [ ] Test build save/load
- [ ] Test teammate configurations

### 11.3 Documentation
- [ ] Update component documentation
- [ ] Add usage examples
- [ ] Create migration guide for developers

---

## Placeholder Components for Missing Features

The following components will be created as placeholders with TODO comments:

### Placeholder 1: SubstatWeightFilters
```tsx
// TODO: Implement substat weight sliders
// Each substat gets a slider from 0 to 1
// Plus a minimum weighted rolls slider (0-5)
export function SubstatWeightFilters() {
  return <div>Substat Weight Filters - TODO</div>;
}
```

### Placeholder 2: ComboFilter & ComboDrawer
```tsx
// TODO: Implement rotation/combo editing system
// Allow users to define ability sequences per turn
// Support conditional activation per turn
export function ComboFilter() {
  return <div>Combo/Rotation Filter - TODO</div>;
}

export function ComboDrawer() {
  return <div>Combo Drawer - TODO</div>;
}
```

### Placeholder 3: TeammateCard (Full)
```tsx
// TODO: Implement full teammate configuration
// Character select, conditionals, W-Engine, disc sets
export function TeammateCard({ index }: { index: number }) {
  return <div>Teammate Card {index} - TODO</div>;
}
```

### Placeholder 4: StatSimulationDisplay
```tsx
// TODO: Implement stat simulation system
// Allow users to simulate builds with custom stats
export function StatSimulationDisplay() {
  return <div>Stat Simulation - TODO</div>;
}
```

### Placeholder 5: Analysis Components
```tsx
// TODO: Implement analysis panel with:
// - StatsDiffCard
// - DamageSplitsChart
// - DamageTagPieChart
// - SubstatUpgrades
// - TeammateUpgrades
export function ExpandedDataPanel() {
  return <div>Expanded Data Panel - TODO</div>;
}
```

### Placeholder 6: Save/Load System
```tsx
// TODO: Implement build save/load functionality
// Store builds in database with metadata
export function BuildsSection() {
  return <div>Save/Load Builds - TODO</div>;
}
```

---

## Migration Strategy

### Step-by-Step Approach
1. **Phase 1-2**: Build foundation and character selection
2. **Phase 3-4**: Migrate filters and add weight system
3. **Phase 5-6**: Add conditionals and teammates (full implementation)
4. **Phase 7-8**: Add analysis and build management
5. **Phase 9-10**: Add advanced features (simulation, polish)
6. **Phase 11**: Testing and documentation

### Backward Compatibility
- Keep existing functionality working during migration
- Use feature flags to toggle old/new UI
- Maintain data format compatibility

### Testing Strategy
- Test each phase independently
- Run `bun run mini-ci` after each phase
- Manual testing with real builds

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | 3-4 days | None |
| Phase 2: Character Selection | 2-3 days | Phase 1 |
| Phase 3: Filters | 3-4 days | Phase 1 |
| Phase 4: Stat Filters | 2-3 days | Phase 3 |
| Phase 5: Conditionals | 2-3 days | Phase 2 |
| Phase 6: Combo System | 4-5 days | Phase 5 |
| Phase 7: Analysis | 3-4 days | Phase 4 |
| Phase 8: Build Management | 2-3 days | Phase 1 |
| Phase 9: Simulation | 3-4 days | Phase 4 |
| Phase 10: Polish | 2-3 days | All phases |
| Phase 11: Testing | 2-3 days | All phases |
| **Total** | **30-40 days** | |

---

## Success Criteria

- [ ] All Fribbels UI components implemented or placeholder
- [ ] Horizontal layout working on desktop and mobile
- [ ] All existing ZZZ functionality preserved
- [ ] New features (weights, combo, analysis) functional
- [ ] All tests passing (`bun run mini-ci`)
- [ ] No performance regressions
- [ ] Accessibility standards met
- [ ] Documentation complete
