# Characters tab — Fribbels parity plan

Agent brief for porting [Fribbels HSR Optimizer](https://fribbels.github.io/hsr-optimizer#main) Characters tab patterns to ZZZ (`@genshin-optimizer/zzz/page-characters`).

**Suggested model:** DeepSeek v4 Flash — work **one phase per session**, paste the phase block from [Starter prompt](#starter-prompt-for-the-agent) plus that phase’s tasks only.

---

## References

| Role | Location |
|------|----------|
| Live UX target | https://fribbels.github.io/hsr-optimizer#main (Characters tab) |
| Reference source (read-only) | `/run/media/endmin/Data/fribbels-hsr-optimizer/src/` |
| Our implementation | `libs/zzz/page-characters/`, `libs/zzz/ui/src/Character/`, `apps/zzz-frontend/src/tokens.css` |
| Local route | `http://localhost:4200/zenless-optimizer-0delay/#/characters` |

### Domain mapping (do not copy HSR game data verbatim)

| HSR | ZZZ |
|-----|-----|
| Light cone | Wengine |
| Relic / planar | Disc |
| Path / element | Speciality / attribute |
| Eidolon `E` | Mindscape `M` |
| Superimposition `S` | Wengine phase `P` |
| `useCharacterStore` | `database.chars` + `@genshin-optimizer/zzz/db-ui` |
| `CharacterId` | `CharacterKey` |

---

## Current state (verify only — do not rebuild)

- Page shell: `width: 1593`, left column `300px`, `gap: 8` (`src/index.tsx`)
- Grid scroll height `parentH` (880), container border
- `constantsUi.ts` matches HSR (disc 207×288, `cardTotalW` 1100, etc.)
- DnD sortable list, density toggle, `FilterBar`, `CharacterMenu`
- Partial color stack: `src/color/*` (oklch utils + `resolveShowcaseTheme`)
- `CharacterPreview` — 3-column layout, discs, wengine, stats, build grade
- `ShadowRings` / `OuterShadowRingWrapper` in `CharacterPreviewComponents.tsx`
- Mantine theme + `apps/zzz-frontend/src/tokens.css` (subset of HSR tokens)

---

## Phase 0 — Gap checklist (visual audit 2026-05-27)

Checklist comparing HSR Characters tab features against ZZZ implementation after code review.  
`[x]` = present (or ZZZ equivalent), `[~]` = partial, `[ ]` = absent.

### Page shell

- [x] 2-column layout (list + preview)
- [x] Route-driven character selection (`/characters/:characterKey`)
- [x] DnD sortable list (`@dnd-kit`)
- [x] Density toggle (Default / Compact)
- [ ] Tab-visibility sync (`TabVisibilityContext` → focus on tab activation)
- [ ] Focus sync with optimizer tab (`dbMeta.optCharKey`)

### Character list / grid (`CharacterRow.tsx` + `index.tsx`)

- [x] Portrait background with attribute tint
- [x] Frosted glass scrim (`backdropFilter` blur + gradient + mask)
- [x] LC / Wengine strip (right-side frosted)
- [x] Rank number (monospace) → drag grip dots (hover)
- [x] Character name + subtitle (M level/promotion)
- [x] Equip dot indicator (red/gold)
- [x] LC / Wengine icon (right side)
- [x] Hover action buttons (Edit, Delete)
- [x] Hover lift effect (translateY + shadow)
- [x] Focus state (primary-color inset border)
- [x] Drag overlay row
- [x] Density presets (default 68px / compact 48px) via CSS vars
- [x] `IntersectionObserver` lazy image loading
- [x] `content-visibility: auto` for off-screen rows
- [x] `data-selected` attribute
- [ ] `oklchCharacterListColor` showcaseColor per-character row tint (currently attribute-only)
- [ ] `showcaseColor?: string` per CharacterKey attribute
- [ ] CSS module for row (`CharacterRow.module.css`)
- [ ] `data-dragging-active` / `data-suppress-transition` CSS drag suppression
- [ ] Image fade-in (`showImageOnLoad` pattern)
- [ ] Double-click navigates to optimizer (`/optimize`)

### Character menu

- [x] Add new character
- [x] Edit character
- [x] Delete character
- [ ] Switch relics/discs with another character
- [ ] Unequip all relics/discs
- [ ] Save / View saved builds
- [ ] Sort all characters by score
- [ ] Move character to top
- [ ] Scoring algorithm configuration modal

### Filter bar

- [x] Name search (TextInput w=200)
- [x] Specialty filter (segmented multi-select icons)
- [x] Attribute filter (segmented multi-select icons)
- [x] Rarity filter (star icons)
- [ ] HSR-style `SegmentedFilterRow` for Path -> we have Specialty instead (ZZZ equivalent)

### Design tokens (`tokens.css`)

- [x] `--font-ui`, `--font-showcase`, `--font-mono`
- [x] `--layer-0`, `--layer-inset`
- [x] `--border-default`, `--border-subtle`
- [x] `--text-primary/secondary/tertiary`
- [x] `--primary-*` ramp
- [x] `--shadow-card`, `--shadow-card-flat`
- [x] `--radius-xs/sm/md`
- [x] `--color-link`, `--color-gold`, `--color-accent`
- [ ] `--showcase-outline`
- [ ] `--showcase-outline-light`
- [ ] `--text-shadow-showcase`
- [ ] `--showcase-backdrop`
- [ ] `--bg-translucent`

### Color pipeline (`color/*`)

- [x] `attributeColors` map (attribute → hex)
- [x] `resolveShowcaseTheme(attribute, darkMode, config?)` → cardBackgroundColor, cardBorderColor
- [x] `oklchCardBackgroundColor` / `oklchCardBorderColor` (chroma-js OKLCH pipeline)
- [x] `ColorPipelineConfig` types + `DEFAULT_CONFIG`
- [ ] `resolveShowcaseColor(characterKey, mode, prefs, extractedColor)` — multi-mode resolution
- [ ] Palette extraction via web worker (ColorThief)
- [ ] Three color modes: Auto (extracted), Custom (manual hex), Standard (fixed blue)
- [ ] `ShowcaseBackgroundBlur` effect
- [ ] Debug visual config sliders

### Character preview — layout

- [x] 3-column layout (portrait | middle | disc panel)
- [x] Blurred portrait background (full-container)
- [x] `ShadowRings` (4-layer outline)
- [x] `OuterShadowRingWrapper`
- [x] `cardTotalW` (1100) × `parentH` (880) dimensions
- [x] `showcaseShadow` / `showcaseShadowInsetAddition` / `showcaseTransition`

### Character preview — portrait area

- [x] Full portrait image (left column)
- [ ] Custom portrait support
- [ ] Live2D Spine animations
- [ ] UID / artist attribution overlay
- [ ] Edit portrait button

### Character preview — middle column (header + stats + skills)

- [x] Element icon + rarity stars + specialty icon header
- [x] Character name (24px)
- [x] Level / Mindscape / Core / Potential line
- [x] Edit + Delete action buttons
- [x] Computed stats (hp, atk, def, impact, crit_, crit_dmg_, pen_, anomProf, anomMas, enerRegen, dmg_)
- [x] Score grade with color coding (gold ≥ 90%, green ≥ 70%, blue ≥ 50%, gray < 50%)
- [x] Score efficiency % + roll count
- [x] Skill badges (all skills with level values)
- [x] Active disc set badges (clickable → DiscSheetDisplay)
- [ ] Zebra-striped stat table (CharacterStatSummary)
- [ ] `StatText` / `StatTextSm` dedicated components (17px/16px)
- [ ] SPD breakpoint highlighting
- [ ] Trace/customization edit markers

### Character preview — W-Engine card

- [x] Clickable wengine strip
- [x] Wengine image, icon, name, phase
- [x] Opens WengineSheetDisplay modal
- [ ] `ShowcaseLightConeSmall` / `ShowcaseLightConeLarge` variants
- [ ] Name + level + phase overlay pill

### Character preview — disc panel (right column)

- [x] 2-column disc layout (slots 1-3 left, 4-6 right)
- [x] Disc set icon + rarity dot + level
- [x] Main stat row with StatIcon
- [x] Sub stat rows (up to 4) — effective=green, wasted=dimmed
- [x] Per-disc score: grade + efficiency% + rolls
- [x] Empty slot placeholder
- [x] Click → DiscSwapModal
- [x] `getDiscMainStatValueAtLevel` / `getDiscSubStatValue`

### Customization sidebar

- [ ] Color picker with palette swatches
- [ ] Auto / Custom / Standard mode selector
- [ ] Shine / Natural preset
- [ ] Dark / Light mode toggle
- [ ] Screenshot (copy / download)
- [ ] SPD precision / weight settings
- [ ] Trace / Weights buttons
- [ ] Show UID / Show Live2D toggles

### Scoring

- [x] Basic per-character grade (efficiency based)
- [ ] DPS score / Combat score UI
- [ ] Colored grade ruler (WTF+/SSS+/SS+/S+/A+/...)
- [ ] Team selection (3 teammate slots)
- [ ] Substat upgrade comparisons
- [ ] Main stat upgrade comparisons
- [ ] Build analysis below card

### Store & persistence

- [x] `useCharacterTabStore` (focusCharacter, filters, density)
- [x] Equip dot color calculation
- [ ] Persisted density (`savedSession.characterGridDensity`)
- [ ] Persisted color mode / custom color / cardBgAlpha
- [ ] Focus character sync between tabs

### Cross-cutting

- [x] ZZZ-specific fields (Mindscape, Core, Potential, ZZZ stat keys)
- [ ] i18n (`page_characters` keys)
- [ ] CSS modules (all styling currently inline)
- [ ] `characterTabController.ts` — action handler abstraction

---

## HSR → ZZZ file map (detailed)

| Area | HSR file | ZZZ counterpart | Status |
|------|----------|-----------------|--------|
| Page shell | `lib/tabs/tabCharacters/CharacterTab.tsx` | `libs/zzz/page-characters/src/index.tsx` | Partial |
| List grid | `lib/tabs/tabCharacters/CharacterGrid.tsx` | `libs/zzz/ui/src/Character/CharacterRow.tsx` + `index.tsx` | Partial |
| Grid CSS module | `lib/tabs/tabCharacters/CharacterGrid.module.css` | *(inline styles in CharacterRow.tsx)* | Missing |
| Density presets | `lib/tabs/tabCharacters/characterGridPresets.ts` | `libs/zzz/ui/src/Character/CharacterRow.tsx` (rowPresets) | Matches |
| Character menu | `lib/tabs/tabCharacters/CharacterMenu.tsx` | `libs/zzz/ui/src/Character/CharacterMenu.tsx` | Partial |
| Filter bar | `lib/tabs/tabCharacters/FilterBar.tsx` | `libs/zzz/page-characters/src/FilterBar.tsx` | Partial |
| Tab store | `lib/tabs/tabCharacters/useCharacterTabStore.ts` | `libs/zzz/ui/src/store/useCharacterTabStore.ts` | Equivalent |
| Tab controller | `lib/tabs/tabCharacters/characterTabController.ts` | *(inline in index.tsx)* | Missing |
| Design tokens | `src/style/tokens.css` | `apps/zzz-frontend/src/tokens.css` | Partial |
| Preview shell | `lib/characterPreview/CharacterPreview.tsx` | `libs/zzz/page-characters/src/CharacterPreview.tsx` | Partial |
| Preview components | `lib/characterPreview/CharacterPreviewComponents.tsx` | `libs/zzz/page-characters/src/CharacterPreviewComponents.tsx` | Matches |
| Preview CSS module | `lib/characterPreview/CharacterPreviewComponents.module.css` | *(inline)* | Missing |
| Stat text | `lib/characterPreview/StatText.tsx` | *(inline* `<Text>` *in CharacterPreview.tsx)* | Missing |
| Stat text CSS | `lib/characterPreview/StatText.module.css` | — | Missing |
| Stat summary | `lib/characterPreview/card/CharacterStatSummary.tsx` | *(inline StatRow in CharacterPreview.tsx)* | Partial |
| Stat summary CSS | `lib/characterPreview/card/CharacterStatSummary.module.css` | — | Missing |
| Portrait card | `lib/characterPreview/card/ShowcasePortrait.tsx` | *(inline portrait in CharacterPreview.tsx)* | Partial |
| Portrait card CSS | `lib/characterPreview/card/ShowcasePortrait.module.css` | — | Missing |
| LC/Wengine card | `lib/characterPreview/card/ShowcaseLightCone.tsx` | *(inline wengine strip in CharacterPreview.tsx)* | Partial |
| LC/Wengine card CSS | `lib/characterPreview/card/ShowcaseLightCone.module.css` | — | Missing |
| Character header | `lib/characterPreview/card/ShowcaseCharacterHeader.tsx` | *(inline in CharacterPreview.tsx)* | Partial |
| Character header CSS | `lib/characterPreview/card/ShowcaseCharacterHeader.module.css` | — | Missing |
| Relic/disc panel | `lib/characterPreview/card/ShowcaseRelicsPanel.tsx` | *(inline DiscColumn/DiscCard in CharacterPreview.tsx)* | Equivalent |
| Rarity stars | `lib/characterPreview/card/ShowcaseRarity.tsx` | *(inline ImgIcon in CharacterPreview.tsx)* | Equivalent |
| Custom portrait | `lib/characterPreview/card/CharacterCustomPortrait.tsx` | — | Missing |
| Color service | `lib/characterPreview/color/showcaseColorService.ts` | `libs/zzz/page-characters/src/color/showcaseColorService.ts` | Partial |
| Color OKLCH utils | `lib/characterPreview/color/colorUtilsOklch.ts` | `libs/zzz/page-characters/src/color/colorUtilsOklch.ts` | Matches |
| Color extraction | `lib/characterPreview/color/colorExtractionService.ts` | — | Missing |
| Color extraction worker | `lib/characterPreview/color/colorExtractionWorker.ts` | — | Missing |
| Customization sidebar | `lib/characterPreview/customization/ShowcaseCustomizationSidebar.tsx` | — | Missing |
| Scoring UI | `lib/characterPreview/scoring/ShowcaseDpsScore.tsx` | — | Missing |
| Combat stats | `lib/characterPreview/scoring/CharacterCardCombatStats.tsx` | — | Missing |
| Stat score | `lib/characterPreview/scoring/ShowcaseStatScore.tsx` | *(inline score in CharacterPreview.tsx)* | Equivalent |
| Build analysis | `lib/characterPreview/scoring/ShowcaseBuildAnalysis.tsx` | — | Missing |
| DPS score CSS | `lib/characterPreview/scoring/ShowcaseDpsScore.module.css` | — | Missing |
| Stats summary UI | `lib/characterPreview/summary/*` (17 files) | — | Missing |
| Build analysis UI | `lib/characterPreview/buildAnalysis/*` (4 files) | — | Missing |
| Buffs analysis | `lib/characterPreview/buffsAnalysis/*` (12 files) | — | Missing |
| Sim scoring context | `lib/characterPreview/SimScoringContext.tsx` | — | Missing |
| Debug panel | `lib/characterPreview/DebugSliderPanel.tsx` | — | Missing |

---

## Principles

1. **Port patterns, not files** — adapt into Nx libs; extend `libs/zzz/ui` or `page-characters` instead of copying HSR `src/lib/` paths.
2. **One source of truth for dimensions** — `constantsUi.ts` only.
3. **CSS modules** for list/preview complexity (match HSR `*.module.css` where inline styles are brittle).
4. **ZZZ data only** — no HSR assets, conditionals, or sim APIs without a ZZZ equivalent.
5. **Phased PRs** — `yarn run mini-ci` must pass after each phase.

---

## Phase 0 — Audit & gap doc

**Goal:** Document gaps before coding.

**Tasks:**

1. Add or update `PARITY.md` section in this file (checkbox list) after visual compare with HSR live site.
2. Map HSR files to our files (table below).

**HSR file map:**

| Area | HSR paths | ZZZ paths |
|------|-----------|-----------|
| Page shell | `lib/tabs/tabCharacters/CharacterTab.tsx` | `libs/zzz/page-characters/src/index.tsx` |
| List grid | `CharacterGrid.tsx`, `CharacterGrid.module.css`, `characterGridPresets.ts` | `libs/zzz/ui/src/Character/CharacterRow.tsx`, `index.tsx` |
| List row color | `CharacterGrid.tsx` (`oklchCharacterListColor`), `color/colorUtilsOklch.ts` | `color/colorUtilsOklch.ts` (attribute-only, no per-character) |
| Tokens | `style/tokens.css` | `apps/zzz-frontend/src/tokens.css` (subset) |
| Preview shell | `lib/characterPreview/CharacterPreview.tsx` | `libs/zzz/page-characters/src/CharacterPreview.tsx` |
| Preview components | `card/*`, `CharacterPreviewComponents.module.css` | `CharacterPreviewComponents.tsx` (inline) |
| Color pipeline | `color/showcaseColorService.ts`, `colorExtractionService.ts`, `colorExtractionWorker.ts` | `color/showcaseColorService.ts` (attribute-only) |
| Customization | `customization/ShowcaseCustomizationSidebar.tsx` | — |
| Stats typography | `StatText.tsx`, `card/CharacterStatSummary.module.css` | inline `StatRow` in `CharacterPreview.tsx` |
| Scoring UI | `scoring/ShowcaseDpsScore.tsx`, `CharacterCardCombatStats.tsx` | inline score in `CharacterPreview.tsx` |
| Controller | `characterTabController.ts` | inline in `index.tsx` |
| Store | `useCharacterTabStore.ts` | `libs/zzz/ui/src/store/useCharacterTabStore.ts` |

**Main gaps (unordered):** CSS modules, per-character `showcaseColor`, palette extraction worker, customization sidebar, `StatText` components, zebra stat table, combat scoring / build analysis, action controller abstraction, extra token vars, missing subset of CharacterMenu items.

**Exit:** Gap checklist written; proceed to Phase 1.

---

## Phase 1 — Design tokens & global showcase CSS

**Goal:** Same CSS variable surface as HSR.

**Tasks:**

1. Extend `apps/zzz-frontend/src/tokens.css`:
   - `--showcase-outline`, `--showcase-outline-light`, `--text-shadow-showcase`, `--showcase-backdrop`
2. Set dynamic vars on preview root in `CharacterPreview.tsx`:
   - `--showcase-card-bg`, `--showcase-card-border`, `--showcase-shadow`, `--showcase-shadow-inset`
3. Use tokens on disc cards, wengine strip, portrait frame (replace weak hardcoded borders).

**Reference:** `fribbels-hsr-optimizer/src/style/tokens.css`, `CharacterPreview.tsx` (~547–567).

**Files:** `apps/zzz-frontend/src/tokens.css`, `CharacterPreview.tsx`, `CharacterPreviewComponents.tsx`.

**Acceptance:** DevTools shows `--showcase-outline` on preview; empty disc slots match HSR outline weight.

---

## Phase 2 — Character list row styling

**Goal:** HSR list interactions and per-character row tint.

**Tasks:**

1. Add `characterGridPresets.ts` (mirror HSR: `listWidth: 300`, default/compact).
2. Extract `CharacterRow` → `CharacterRow.module.css` (or shared grid CSS): `.root` / `.frame`, hover, drag, `data-dragging-active`.
3. Row background: `oklchCharacterListColor(showcaseColor, …)`:
   - Add `showcaseColor?: string` per `CharacterKey` (stats/const map) — fallback attribute until Phase 3 AUTO.
4. Portrait: IntersectionObserver + fade-in (`showImageOnLoad` pattern).
5. Grid: `--cr-list-width: 300px`, rows `width: 100%`.
6. Drag suppression via CSS (`data-suppress-transition`, `data-dragging-active`).

**Reference:** `CharacterGrid.module.css`, `CharacterGrid.tsx` (~280–380).

**Files:** `libs/zzz/ui/src/Character/CharacterRow.tsx`, `src/index.tsx`, new `*.module.css`.

**Acceptance:** Per-character row tint; hover/drag matches HSR; no drop glitch.

---

## Phase 3 — Showcase color pipeline

**Goal:** Portrait-driven card theme (AUTO / CUSTOM / STANDARD).

**Tasks:**

1. Wire `src/color/*`:
   - `resolveShowcaseColor(characterKey, mode, prefs, extractedColor)` from HSR `showcaseColorService.ts`
2. Palette extraction: port worker + `extractPaletteInWorker` OR sync path if acceptable perf.
3. `CharacterPreview`: resolve color → theme → set CSS vars on `.characterPreview`; port `ShowcaseBackgroundBlur` behavior.
4. Do not use attribute-only theme as sole source once AUTO works.

**Reference:** `lib/characterPreview/color/*`, `CharacterPreview.tsx`.

**Acceptance:** Card tint follows portrait/config; stable on revisit.

---

## Phase 4 — Customization sidebar

**Goal:** HSR right sidebar (~130px) + persisted prefs.

**Tasks:**

1. Port `ShowcaseCustomizationSidebar` layout (color picker, Auto/Custom/Standard, theme toggles; screenshot buttons optional/`isDev`).
2. Persist `colorMode`, `customColor`, optional `cardBgAlpha` in DB or `useCharacterTabStore`.
3. Connect to Phase 3 `resolveShowcaseColor`.
4. Position beside `cardTotalW` preview block.

**Reference:** `customization/ShowcaseCustomizationSidebar.tsx`.

**Acceptance:** Sidebar live; mode changes update preview; prefs survive reload.

---

## Phase 5 — Preview structure & typography

**Goal:** HSR showcase typography with ZZZ stats/content.

**Tasks:**

1. Port `StatText` / `StatTextSm` + CSS (17px / 16px).
2. `CharacterStatSummary` with zebra rows.
3. Split: `ShowcasePortrait`, `ShowcaseWengine`, `ShowcaseDiscPanel`, `ShowcaseCharacterHeader`.
4. Sub-cards use `--showcase-card-bg` / border + `ShadowRings`.
5. Keep ZZZ fields (mindscape, core, potential, ZZZ stat keys) styled with `StatText`.

**Reference:** `lib/characterPreview/card/*`, `StatText.tsx`.

**Acceptance:** Zebra stats column; HSR-like font scale at 100% zoom.

---

## Phase 6 — Scoring & combat block (ZZZ-adapted)

**Goal:** HSR Combat Sim UI only if ZZZ backend exists.

**Tasks:**

1. Find ZZZ DPS/team sim APIs under `libs/zzz`.
2. If present: port `ShowcaseDpsScore` + `CharacterCardCombatStats` UI.
3. If absent: keep `calculateCharacterScore` grade in same layout slot; no fake DPS.
4. Do not port `SimScoringContext` without ZZZ calc wiring.

**Acceptance:** Real data or clean omission; spacing matches HSR.

---

## Phase 7 — Cross-tab sync & polish

**Tasks:**

1. Sync focus with optimizer via `database.dbMeta.optCharKey` / router (HSR tab activation pattern).
2. Filter bar: search `w={200}`, layout like HSR `FilterBar.tsx`.
3. i18n: `page_characters` keys for sidebar and color modes.

**Acceptance:** Focus matches optimizer after tab switch; locale strings added.

---

## Phase 8 — QA

- [ ] `yarn run mini-ci`
- [ ] 1920×1080: list 300px, preview 1100×880, page ~1593px
- [ ] Default / Compact density
- [ ] DnD custom sort persists
- [ ] Add / edit / delete / optimize work
- [ ] No color-worker console errors
- [ ] Before/after screenshots in PR

---

## Out of scope (unless requested)

- Full HSR Optimizer / relics / showcase UID / Live2D
- HSR `characterConfigRegistry` wholesale
- Unrelated apps pages
- Git commits unless user asks

---

## Execution order

```
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

**Minimum “looks like Fribbels”:** Phases **1 + 2 + 3 + 5**  
**Full parity:** through **7**

---

## Starter prompt for the agent

```
Read libs/zzz/page-characters/AGENTS-PARITY.md.

Implement ONE phase only (I will specify which). Reference:
/run/media/endmin/Data/fribbels-hsr-optimizer/src/ (tabCharacters + characterPreview).

Target: libs/zzz/page-characters + libs/zzz/ui/src/Character.
Map HSR → ZZZ (wengine/disc/mindscape). Do not rewrite existing 1593/300/1100×880 shell.

After the phase: yarn run mini-ci. Do not commit unless asked.
```

**Example:** `Implement Phase 2 only per AGENTS-PARITY.md.`

---

## Notes for DeepSeek v4 Flash

- **One phase per run** — avoids context drift and half-finished refactors.
- **Read before edit** — open listed HSR file and our file side-by-side; do not invent APIs.
- **Exact paths** — use `@genshin-optimizer/zzz/*` imports; no `lib/...` paths from HSR.
- **Stop if blocked** — if ZZZ has no DPS sim (Phase 6), document and skip UI; do not mock numbers.
- **No drive-by changes** — only files listed in the active phase.
- **Verify visually** — `yarn nx serve zzz-frontend` → `#/characters` vs HSR live tab.

---

## Progress tracker

Update checkboxes as phases complete:

- [x] Phase 0 — Audit
- [x] Phase 1 — Tokens
- [ ] Phase 2 — List rows
- [ ] Phase 3 — Color pipeline
- [ ] Phase 4 — Sidebar
- [x] Phase 5 — Preview typography
- [x] Phase 6 — Combat scoring
- [ ] Phase 7 — Cross-tab polish
- [ ] Phase 8 — QA
