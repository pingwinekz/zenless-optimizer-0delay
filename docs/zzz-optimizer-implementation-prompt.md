# ZZZ Optimizer Migration - Implementation Prompt

Use this prompt to start implementing a specific phase. Replace `[PHASE_NUMBER]` with the phase you want to work on.

---

## Prompt Template

```
Implement Phase [PHASE_NUMBER] of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase [PHASE_NUMBER].

Goals for this phase:
1. [List specific goals from the phase]

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

---

## Phase-Specific Prompts

### Phase 1: Foundation & Layout Restructuring
```
Implement Phase 1 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 1: Foundation & Layout Restructuring.

Goals:
1. Create new root component ZZZOptimizerTab following Fribbels' OptimizerTab.tsx pattern
2. Implement horizontal flex layout: OptimizerForm (left) + OptimizerGrid (center) + Sidebar (right)
3. Add responsive behavior for mobile (compact bottom bar mode)
4. Create FilterContainer, FormCard, FormRow layout components (adapt from Fribbels)
5. Create OptimizerSidebar component with full-size and compact modes
6. Implement PermutationsSection - show disc slot counts, total permutations, progress bar
7. Implement OptimizerControlsSection - Optimize/Cancel/Reset buttons
8. Add ProgressDisplay with animated progress bar and ETA
9. Implement ResultsSection - Equip, Filter, Clear buttons
10. Replace current OptimizerGrid with Fribbels-style AG Grid implementation

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 2: Character & Target Selection
```
Implement Phase 2 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 2: Character & Target Selection.

Goals:
1. Create CharacterSelectorDisplay component with character dropdown, W-Engine dropdown, level/dupes selectors
2. Create CharacterPreviewPanel showing character + W-Engine images
3. Add presets button with dropdown menu
4. Migrate OptTargetRow into form layout
5. Create OptTargetSelector with grouped categories (DMG, Stats)
6. Add CritModeSelector, SpecificDmgTypeSelector
7. Add AfterShockToggle (game-specific)
8. Add sort-by target dropdown (grouped by DMG and stat options)
9. Add result limit dropdown (Top 1, 5, 10, 50, 100, 1000)

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 3: Disc/W-Engine Filters
```
Implement Phase 3 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 3: Disc/W-Engine Filters.

Goals:
1. Create DiscMainSetFilters component with main stat selector for slots 4, 5, 6
2. Implement DiscSetFilterModal with search, 2-piece/4-piece toggle, set grid, stat chips
3. Implement WEngineFilterModal with level filter, specialty selector, conditional grid
4. Create DiscLevelFilter with min/max sliders and "Use Equipped Discs" toggle
5. Create FormSetConditionals drawer with toggle switches for conditional effects
6. Add "Include Offsets" option for off-set discs

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 4: Stat Filters & Weights
```
Implement Phase 4 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 4: Stat Filters & Weights.

Goals:
1. Create SubstatWeightFilters component with weight sliders (0-1) for each substat
2. Add minimum weighted rolls slider (0-5) and weight presets
3. Enhance MinMaxStatFilters with Fribbels-style layout and grouped filters
4. Add rating filters: EHP, DPS scores, Anomaly damage scores
5. Create AdvancedOptionsPanel with buttons for Custom Bonus Stats, Combat Buffs, Enemy Configurations
6. Implement CombatBuffsDrawer with numeric inputs for team buffs
7. Implement EnemyConfigDrawer with level, DEF, resistance settings

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 5: Conditionals & Teammates
```
Implement Phase 5 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 5: Conditionals & Teammates.

Goals:
1. Create CharacterConditionalsDisplay component with FormSwitch, FormSlider, FormSelect
2. Create WEngineConditionalsDisplay component for equipped W-Engine conditionals
3. Create full TeammateCard component with character select, conditionals, W-Engine, disc sets
4. Support 2 teammate slots with sync from roster button
5. Show teammate stats in optimizer calculations
6. Add hover popover descriptions for each conditional

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 6: Rotation/Combo System
```
Implement Phase 6 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 6: Rotation/Combo System.

Goals:
1. Create ComboFilter component with Simple/Advanced mode toggle
2. Add ability selectors for each turn slot and row controls
3. Add presets dropdown for common rotations
4. Create ComboDrawer slide-in component with ComboHeader and StateDisplay
5. Implement drag-to-toggle with react-selecto for conditional activations
6. Support boolean, numeric, and select conditionals per turn

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 7: Analysis & Data Panel
```
Implement Phase 7 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 7: Analysis & Data Panel.

Goals:
1. Create ExpandedDataPanel with accordion sections and StatsDiffCard
2. Create DamageSplitsChart - horizontal stacked bar chart with legend and tooltips
3. Create DamageTagPieChart - donut chart with data table
4. Create SubstatUpgrades table showing +1 roll impact per substat
5. Create TeammateUpgrades table showing teammate set/swap effects

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 8: Build Management
```
Implement Phase 8 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 8: Build Management.

Goals:
1. Enhance GeneratedBuildsDisplay with Fribbels-style layout showing all discs and W-Engine
2. Create BuildsSection with Save/Load buttons
3. Implement save build modal with name input
4. Implement load build modal with build list
5. Store builds in database with metadata
6. Add "Pin Build" button to grid rows and pinned builds in sidebar
7. Support export/import builds and build comparison mode

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 9: Stat Simulation
```
Implement Phase 9 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 9: Stat Simulation.

Goals:
1. Create StatSimulationDisplay component with On/Off mode toggle
2. Implement simulated builds grid and Simulate/Import/Conditionals buttons
3. Create SimulationInputs panel with set selection (2 disc + 1 W-Engine)
4. Implement main stat selection for each slot
5. Implement substat roll inputs (max 54 rolls) and simulation name field
6. Add save from form, overwrite, and delete all simulations

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 10: Polish & Integration
```
Implement Phase 10 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 10: Polish & Integration.

Goals:
1. Implement mobile layout with compact bottom bar and media query breakpoints
2. Integrate with existing Zustand stores (useOptimizerDisplayStore, useOptConfigStore)
3. Add deferred rendering for progressive mount
4. Implement virtual scrolling for large result sets
5. Optimize re-renders with React.memo and useMemo
6. Add keyboard navigation and ARIA labels
7. Test with screen readers

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

### Phase 11: Testing & Documentation
```
Implement Phase 11 of the ZZZ Optimizer migration plan.

Read the migration plan at docs/zzz-optimizer-migration-plan.md and focus only on Phase 11: Testing & Documentation.

Goals:
1. Write unit tests for all new components
2. Write tests for state management logic and filter calculations
3. Write integration tests for complete optimization flow
4. Write tests for build save/load and teammate configurations
5. Update component documentation
6. Add usage examples
7. Create migration guide for developers

Reference implementation:
- Fribbels HSR Optimizer: fribbels-hsr-optimizer/src/lib/tabs/tabOptimizer/
- Current ZZZ: libs/zzz/page-optimize/src/

Requirements:
- Follow existing code conventions (Biome, TypeScript strict, Mantine)
- Use existing shared components from libs/common/ where possible
- Create placeholder components for any missing features with TODO comments
- Ensure all existing functionality continues to work
- Run `bun run mini-ci` after implementation to verify

Output:
- New/modified file paths
- Brief summary of changes
- Any blockers or questions
```

---

## Usage

1. Replace `[PHASE_NUMBER]` with the phase you want to implement (1-11)
2. Copy the phase-specific prompt
3. Paste it into a new conversation
4. The assistant will read the migration plan and implement the phase

## Tips

- Start with Phase 1 and work sequentially
- Run `bun run mini-ci` after each phase to verify
- If you encounter blockers, document them and move to the next phase
- You can implement phases in parallel if they don't depend on each other
