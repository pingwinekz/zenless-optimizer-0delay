# MUI → Mantine Migration Plan

**Goal**: Replace all `@mui/material`, `@emotion/react`, `@emotion/styled`, and related dependencies with `@mantine/core` + `@mantine/hooks` + `@tabler/icons-react` across the entire GO monorepo.

**Estimated scope**: ~350 files touched, ~17 developer-days.

**Why**: The existing MUI-based layout in `libs/zzz/page-optimize` cannot produce the desired tabbed/panel UI. Rather than fighting MUI, swap to Mantine (as used by Fribbels HSR optimizer) for a clean, modern component library with better dark-mode, CSS-variable theming, and composable layouts.

---

## Current Inventory

| Layer | Location | Files | Key Dependencies |
|-------|----------|-------|------------------|
| Deps | root `package.json` | 1 | `@mui/material` ^5.16, `@mui/icons-material` ^5.14, `@emotion/react` 11.11, `@emotion/styled` 11.11, `@emotion/babel-plugin` 11.11 |
| Theme (common) | `libs/common/ui/src/theme/` | 1 file, 402 lines | MUI `createTheme`, Palette augmentation, 40+ custom palette colors, `Mui*` component overrides |
| Theme (ZZZ) | `libs/zzz/theme/src/` | 1 file, 153 lines | Extends common theme with ZZZ element/rank colors, Button/Chip/SvgIcon color overrides |
| Shared components | `libs/common/ui/src/components/` | 26 items (CardThemed, DropdownButton, SqBadge, StarDisplay, etc.) | All MUI-based |
| ZZZ UI components | `libs/zzz/ui/src/` | ~60+ items (CharacterCard, CompactDiscCard, toggle buttons, editors) | Wrap MUI components heavily |
| Custom SVG icons | `libs/common/svgicons/src/icons/` + `libs/zzz/svgicons/src/icons/` | ~43 files | Use `@mui/icons-material/createSvgIcon` wrapper |
| Game-opt sheet UI | `libs/game-opt/sheet-ui/src/` + `libs/game-opt/formula-ui/src/` | ~25 files | MUI Accordion, Collapse, List, Slider, Switch |
| App shell | `apps/zzz-frontend/src/app/App.tsx` | 1 file | `ThemeProvider`, `StyledEngineProvider`, `CssBaseline`, `Container`, `Box` |
| Page header | `apps/zzz-frontend/src/app/Header.tsx` | 1 file, 327 lines | `AppBar`, `Tabs`, `Drawer`, `Button`, `Skeleton` |
| Page optimize | `libs/zzz/page-optimize/src/` | 18 items (directories + files) | The primary motivation — heavy MUI usage |

---

## Phases

### Phase 0 — Install dependencies & configure tooling
**Effort**: 0.5 day · **Files touched**: 3

- Install new packages:
  ```
  yarn add @mantine/core @mantine/hooks @mantine/notifications @mantine/modals
  yarn add @tabler/icons-react
  yarn add --dev postcss postcss-preset-mantine postcss-simple-vars
  ```
- Remove old packages:
  ```
  yarn remove @mui/material @mui/icons-material @emotion/react @emotion/styled @emotion/babel-plugin @mui/types
  ```
- Remove `@emotion/babel-plugin` from root `.babelrc` (if referenced).
- Add `postcss.config.js` at root:
  ```js
  module.exports = { plugins: { 'postcss-preset-mantine': {}, 'postcss-simple-vars': { variables: { 'mantine-breakpoint-xs': '36em', ... } } } }
  ```
- **Validation**: `yarn install` succeeds.

---

### Phase 1 — Theme: MUI → Mantine
**Effort**: 1 day · **Files touched**: 5

1. **Delete** `libs/common/ui/src/theme/index.ts` — no longer needed.
2. **Delete** `libs/zzz/theme/src/Theme.tsx` — no longer needed.
3. **Create** `libs/zzz/theme/src/mantine-theme.ts`:
   - Use Mantine's `createTheme()` with CSS variables.
   - Map all 40+ custom palette colors to Mantine CSS variables (e.g., `--mantine-color-contentNormal`, `--mantine-color-fire-*`).
   - Set `primaryColor`, `fontFamily`, `defaultRadius`, `colors`, `shadows`.
   - Port dark-mode background colors: `#0C1020` default.
4. **Update** `libs/zzz/theme/src/index.ts` to export the new Mantine theme.
5. **Update** `apps/zzz-frontend/src/app/App.tsx`:
   ```tsx
   import { MantineProvider } from '@mantine/core'
   import { mantineTheme } from '@genshin-optimizer/zzz/theme'
   // Remove ThemeProvider, CssBaseline, StyledEngineProvider
   <MantineProvider theme={mantineTheme}>
   ```
6. **Add** `@mantine/core/styles.css` import in `apps/zzz-frontend/src/main.tsx` or `styles.scss`.

**Validation**: App loads, dark background renders, no JS errors.

---

### Phase 2 — App shell: Box/Container/AppBar/Footer → Mantine
**Effort**: 1 day · **Files touched**: 3

1. **Replace** `App.tsx` layout:
   - `<MantineProvider>` wraps everything.
   - `Box` + `Container` → Mantine `<Container>` with `AppShell` or plain flex layout.
   - Remove `useRefSize` / `ScrollTop` if Mantine provides equivalent.
2. **Rewrite** `Header.tsx`:
   - `AppBar` + `Toolbar` → Mantine `AppShell.Header` or `Group`/`Flex`.
   - `Tabs` → Mantine `Tabs`.
   - `Drawer` → Mantine `Drawer` (mobile nav).
   - `Button` → Mantine `Button`.
   - `Skeleton` → Mantine `Skeleton`.
   - `Chip` → Mantine `Badge` or `Chip`.
   - MUI icons → `@tabler/icons-react` equivalents.
   - Keep React Router links.
3. **Rewrite** `Footer.tsx` similarly.

**Validation**: Navigation between pages works, mobile drawer opens/closes.

---

### Phase 3 — Custom SVG icons → plain React components
**Effort**: 1 day · **Files touched**: ~43

- Replace every `createSvgIcon(...)` wrapper with a plain React component returning `<svg>...</svg>`.
- Or replace with `@tabler/icons-react` equivalents where possible.
- Update all `index.ts` barrels.
- This is mechanical — each file gets the same transformation.

**Validation**: All icons render correctly in the app.

---

### Phase 4 — Shared common/ui components
**Effort**: 2 days · **Files touched**: ~26

Port each component in `libs/common/ui/src/components/`:

| Component | MUI dependency | Mantine replacement |
|-----------|---------------|-------------------|
| `Card/CardThemed` | `Card`, `CardContent`, `styled` | `Card` from Mantine |
| `Card/CardHeaderCustom` | `CardHeader`, `Typography` | `Card.Section` + `Group`/`Title` |
| `DropdownButton` | `Button`, `Menu`, `ButtonGroup` | `Menu` + `Button` |
| `NumberInputLazy` | `TextField` | `NumberInput` |
| `TextFieldLazy` | `TextField` | `TextInput` |
| `StatInput` | `TextField`, `Slider` | `NumberInput` + `Slider` |
| `GeneralAutocomplete` | `Autocomplete`, `TextField` | `Select` or `Autocomplete` |
| `BootstrapTooltip` | `Tooltip`, `styled` | `Tooltip` |
| `InfoTooltip` | `Tooltip`, `IconButton` | `Tooltip` + `ActionIcon` |
| `ModalWrapper` | `Modal`, `Box` | `Modal` |
| `SqBadge` | `Chip`, `styled` | `Badge` |
| `StarDisplay` | `Box` + custom render | `Group` + `Icon` |
| `ColorText` | `Box`/`Typography` | `Text` |
| `ConditionalWrapper` | No UI dep | Keep as-is |
| `CodeBlock` | `Typography` | `Code` |
| `CustomNumberInput` | `TextField` | `NumberInput` |
| `HeaderTally` | `Box`, `Chip` | `Group`, `Badge` |
| `ImgFullwidth` | `Box` | Keep as-is |
| `ImgIcon` | `Box` | Keep as-is |
| `ScrollTop` | `Fab`, `Zoom` | Keep or replace with `Affix` |
| `ShowingAndSortOptionSelect` | `TextField`, `Menu`, `Button` | `Select`, `Menu`, `Button` |
| `SolidColoredToggleButton` | `ToggleButton`, `styled` | `ToggleButton` or CSS |
| `SolidToggleButtonGroup` | `ToggleButtonGroup` | `SegmentedControl` or `Button.Group` |
| `SortByButton` | `Button`, `Menu` | `Menu` + `Button` |
| `TextButton` | `Button`, `styled` | `Button` variant="subtle" |
| `TranslateBase` | No UI dep | Keep as-is |

**Validation**: Import pages (PageHome, PageCharacters) still render their UI cards.

---

### Phase 5 — ZZZ-specific UI components
**Effort**: 4 days · **Files touched**: ~60

Port every component in `libs/zzz/ui/src/`. These are the heaviest MUI consumers — CharacterCard, DiscCard, WengineCard, toggle buttons, editors, fields, conditional displays.

**Strategy**: Work bottom-up:
- Atomic components (buttons, badges, chips) first.
- Composite cards (CharacterCard, CompactDiscCard) next.
- Full-page components (CharacterSheet, DiscSheet) last.

**Validation**: `PageCharacters`, `PageDiscs`, `PageWengines` render with all sub-components.

---

### Phase 6 — Game-opt formula/sheet display components
**Effort**: 2 days · **Files touched**: ~25

Port `libs/game-opt/sheet-ui/src/` and `libs/game-opt/formula-ui/src/`:

| MUI component | Mantine replacement |
|--------------|-------------------|
| `Accordion` | `Accordion` (Mantine has it) |
| `Collapse` | `Collapse` (Mantine has it) |
| `List` | `List` (Mantine has it) |
| `Slider` | `Slider` |
| `Switch` | `Switch` |
| `Divider` | `Divider` |

**Validation**: Document/Field/Conditional display trees render in optimize page.

---

### Phase 7 — Page-optimize (target page)
**Effort**: 3 days · **Files touched**: ~18

This is the primary motivation. Rewrite `libs/zzz/page-optimize/src/`:

1. Replace MUI `Grid` with Mantine `Grid` or `SimpleGrid`.
2. Replace all remaining direct MUI imports (`Box`, `Typography`, `Skeleton`, `Button`, `Slider`, `Select`, `Switch`, `Tooltip`, etc.) with Mantine equivalents.
3. Implement the desired tabbed panel layout using Mantine `Tabs` or `AppShell.Navbar`/`Aside`.

By this point, every dependency listed in phases 1–6 is already ported, so this phase is purely about the page-specific layout and composition.

**Validation**: `PageOptimize` renders with the new tabbed layout. No MUI imports remain in this directory.

---

### Phase 8 — Cleanup & validation
**Effort**: 2.5 days · **Files touched**: 0 (non-functional)

1. `grep -r '@mui/'` across the entire repo — fix any remaining imports.
2. `grep -r '@emotion/'` across the entire repo — fix any remaining imports.
3. Run `yarn run mini-ci` (format, typecheck, lint, test).
4. Run `yarn nx build zzz-frontend` — verify production build succeeds.
5. Remove unused `@mui/types` from devDependencies if still present.
6. Remove `@emotion/babel-plugin` from root `.babelrc` if any.

**Validation**: Zero MUI/Emotion strings remain in source. `mini-ci` passes.

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| Mantine `Card` API differs from MUI `Card` significantly | Port `CardThemed` early (Phase 4) and test exhaustively |
| 43 SVG icons need manual conversion | Batch them in Phase 3; mechanical work |
| Mantine v9 may not be stable; v7/v8 API diffs | Pin to latest stable Mantine version when starting |
| `postcss-preset-mantine` processing may conflict with existing build | Add to `postcss.config.js`; test build immediately (Phase 0) |
| Mantine `Tabs` component may not perfectly replicate desired layout | Prototype in isolation before Phase 7 |
| ~60 ZZZ UI files = highest-volume phase | Work bottom-up; validate after each sub-group |

---

## Ordering Rationale

1. **Phase 0** — must be first (deps must be installed).
2. **Phase 1** — must be early (theme powers every component).
3. **Phase 2** — must be early (layout shell powers every page).
4. **Phase 3** — independent, no deps on other phases.
5. **Phase 4** — shared components (blocking every page).
6. **Phase 5** — ZZZ components (blocking all ZZZ pages).
7. **Phase 6** — formula/sheet components (blocking optimize page).
8. **Phase 7** — page-optimize itself (everything else must be done first).
9. **Phase 8** — final cleanup.

Phases 2 and 3 can run in parallel with Phase 4 if multiple people work on it.
