# Guide: Adding GameDesc Descriptions to Character Conditionals

Replace hardcoded English description strings in character sheets with locale-driven `<GameDesc>` components for proper in-game formatting, number highlighting, and i18n support.

## Overview

Each character sheet defines conditionals (toggleable) and passive fields (always-on). Both need descriptions loaded from the generated locale file (`char_{CharKey}_gen.json`) via `<GameDesc>`.

Two distinct rendering paths exist:

| Path | Component | Where description is set |
|------|-----------|--------------------------|
| **Conditional** (toggleable) | `CharacterConditionalRow` | `conditional.description` in the character sheet |
| **Passive field** (always-on) | `PassiveFieldRow` | Not in the sheet — derived from `sectionKey` via `passiveSectionToDescKey()` |

## Step-by-step

### 1. Open the character sheet

File: `libs/zzz/formula-ui/src/char/sheets/{CharKey}.tsx`

### 2. Import `GameDesc`

```tsx
import { GameDesc } from '@genshin-optimizer/zzz/i18n'
```

For **core** conditionals, import `CoreGameDesc` instead (it dynamically resolves the character's core level):

```tsx
import { CoreGameDesc } from '../sheetUtil'
```

### 3. Open the generated locale to find correct locale keys

File: `libs/zzz/dm-localization/assets/locales/en/char_{CharKey}_gen.json`

Look for these sections:

```json
{
  "core": { "desc": [{ "0": "...", "1": "...", ... }, ...] },
  "ability": { "desc": { "0": "...", "1": "..." } },
  "mindscapes": {
    "1": { "desc": "..." },
    "2": { "desc": "..." },
    ...
  },
  "chain": {
    "UltimateSomething": { "desc": { "0": "...", "1": "..." } }
  }
}
```

### 4. Replace `description` strings in conditional documents

**Old pattern (hardcoded string):**

```tsx
conditional: {
  label: ch('m4Cond'),
  description:
    'Enemies suffering from the Exposed effect have increased PEN Ratio against them.',
  metadata: cond.exposed,
  fields: [fieldForBuff(buff.m4_pen_)],
},
```

**New pattern (GameDesc):**

```tsx
conditional: {
  label: ch('m4Cond'),
  description: <GameDesc ns="char_Yanagi_gen" key18="mindscapes.4.desc" />,
  metadata: cond.exposed,
  fields: [fieldForBuff(buff.m4_pen_)],
},
```

### 5. Locale key mapping

| Sheet section | Locale key pattern | Example |
|---|---|---|
| **core** | Use `CoreGameDesc` **NOT** raw `GameDesc` (see ⚠️ below) | `<CoreGameDesc characterKey={key} paragraph={0} />` |
| `ability` | `ability.desc` (or `ability.desc.{index}`) | `ability.desc`, `ability.desc.0` |
| `m1`–`m6` | `mindscapes.{N}.desc` | `mindscapes.1.desc` |
| `potential` | `potential.desc.{level}.{index}` | `potential.desc.0` |
| Skill abilities | `{skill}.{abilityName}.desc` | `chain.UltimateLingeringSnow.desc` |

The `chain.UltimateLingeringSnow.desc` key returns an object of paragraphs (`{ "0": "...", "1": "...", ... }`), which `GameDesc` renders with paragraph breaks.

> ⚠️ **Core conditionals MUST use `CoreGameDesc`, not raw `GameDesc`**
>
> The locale `core.desc` is an array indexed by core level (0–6). Using `GameDesc` with a hardcoded key like `key18="core.desc.0"` will **always show core level 0 values** (e.g. 125% instead of 250%), regardless of the character's actual core level.
>
> Instead, import and use the shared `CoreGameDesc` component from `../sheetUtil`:
>
> ```tsx
> import { CoreGameDesc } from '../sheetUtil'
>
> // In the sheet:
> conditional: {
>   description: <CoreGameDesc characterKey={key} paragraph={0} />,
>   ...
> }
> ```
>
> - **`characterKey`** — the `CharacterKey` constant (e.g. `'Yanagi'`)
> - **`paragraph`** — optional 0-based index into the core level's desc object.
>   Omit to render all paragraphs for that core level.
>
> Examples:
> - `<CoreGameDesc characterKey={key} />` → `core.desc.{coreLevel}` (all paragraphs)
> - `<CoreGameDesc characterKey={key} paragraph={0} />` → `core.desc.{coreLevel}.0`
> - `<CoreGameDesc characterKey={key} paragraph={1} />` → `core.desc.{coreLevel}.1`
>
> **How it works:** `CoreGameDesc` uses `useCharacter(characterKey)` to look up the character from the database directly, rather than relying on `useCharacterContext()` (which always returns the main character). This means it **works correctly in both contexts**:
> - ✅ **Main character view** — correctly reads the main character's core level
> - ✅ **Teammate card view** — correctly reads the **teammate's** core level via their key
>
> Without this, a teammate's core conditional would display the main character's core level values — e.g. showing 250%/20% (main's core level 6) instead of 166%/13.3% (teammate's core level 2).

### 6. Passive fields (always-on, no toggle)

Passive fields are rendered by `PassiveFieldRow` in `CharacterConditionalsDisplay.tsx`. This component automatically looks up the description via `passiveSectionToDescKey` — you **do not** need to change the sheet.

The `sectionKey` is assigned in `OptimizerForm.tsx` and `TeammateCard.tsx`:

```tsx
// libs/zzz/page-optimize/src/Optimize/OptimizerForm.tsx
passiveFields: passiveFields.map((f) => ({
  ...f,
  sectionKey: f.fieldRef.name.startsWith('ability_') ? 'core' : section,
}))
```

The mapping logic in `passiveSectionToDescKey`:

```
sectionKey 'core'    + fieldName starts with 'ability_'  → 'ability.desc'
sectionKey 'core'    otherwise                           → 'core.desc.0'*
sectionKey 'potential'                                   → 'potential.desc.0'
sectionKey 'm1'-'m6'                                     → 'mindscapes.{N}.desc'
```

> *Note: `passiveSectionToDescKey` still returns hardcoded `'core.desc.0'` for core passive fields. This has the same core-level issue as described above (always shows level 0). Fixing this requires updating `CharacterConditionalsDisplay.tsx` to dynamically resolve the core level — out of scope for a sheet migration.

### 7. Verify

- Check that the locale key exists in `char_{CharKey}_gen.json`
- Run `bun nx eslint:lint zzz-formula-ui` to verify the character sheet
- Run `bun nx eslint:lint zzz-stats` if you changed the mapped stats file

## ⚠️ Wengine phase: same teammate-context trap as core level

Teammate wengine descriptions have the same problem: `WengineConditionalRow` and `WenginePassiveFieldRow` in `WEngineConditionalsDisplay.tsx` originally used `useZzzCalcContext()` to resolve `own.wengine.phase`, which always returns the **main** character's phase, not the teammate's.

**Fix**: `WEngineConditionalsDisplay` now accepts an optional `wenginePhase` prop. When rendering a teammate, the `TeammateCard` passes the teammate's effective phase:

```tsx
// TeammateCard.tsx
const effectiveWenginePhase =
  teammateDatum?.wenginePhase ?? teammate?.wenginePhase ?? 1

<WEngineConditionalsDisplay
  wengineKey={teammateWengineKey}
  teammateKey={characterKey}
  wenginePhase={effectiveWenginePhase}    // ← pass teammate's phase
  showPassives={showWenginePassives}
/>
```

Inside `WEngineConditionalsDisplay`, when `wenginePhase` is provided, it's used directly for the description key (`phaseDescs.{phase-1}`). When not provided (main character view), it falls back to the calc context.

All `useZzzCalcContext()` calls must be **unconditional** to comply with React's rules of hooks — resolve the phase with a fallback expression instead of guarding the call:

```tsx
// ✅ Correct: unconditional hook call, phase resolved from prop or calc
const calc = useZzzCalcContext()
const phase = propPhase ?? (calc ? calc.compute(own.wengine.phase).val ?? 1 : 1)

// ❌ Wrong: conditional hook call (ESLint error)
// let phase = propPhase ?? 1
// if (!propPhase) {
//   const calc = useZzzCalcContext()  // conditional! violates rules of hooks
//   ...
// }
```

## ⚠️ Formula-level pitfall (description vs buff value mismatch)

Even after fixing the **description** text to show correct core level values, the **computed buff value** (shown below the description) may still display wrong values. This happens when the formula uses a **scalar** from `coreParams` instead of subscripting by core level.

**Example** — Miyabi's `core_anomBuildup_` had this issue:

```
Mapped stats (libs/zzz/stats/src/mappedStats/char/maps/Miyabi.ts):
  ❌ anomBuildup_: data_gen.coreParams[4][0]     ← scalar, always core level 0
  ✅ anomBuildup_: data_gen.coreParams[4]         ← array indexed by core level

Formula (libs/zzz/formula/src/data/char/sheets/Miyabi.ts):
  ❌ frostburn.ifOn(dm.core.anomBuildup_)                                  ← uses scalar
  ✅ frostburn.ifOn(subscript(char.core, dm.core.anomBuildup_))            ← uses correct level
```

**Pattern to follow**: If a core stat scales with core level (check the locale — if `core.desc.{level}.{index}` has different values per level), the mapped stats must expose the **full array** (without `[0]`), and the formula must use `subscript(char.core, ...)` to index into it.

## One-shot migration: bulk find-and-replace

To find all characters still using hardcoded descriptions:

```bash
rg '^\s{8}description:' libs/zzz/formula-ui/src/char/sheets/ --no-filename | head -40
```

For each match, the `description` string should be replaced with a `<GameDesc>` using the correct locale key from the character's `_gen.json` file.

## Example: Yanagi (reference for mindscapes, skill, ability)

See `libs/zzz/formula-ui/src/char/sheets/Yanagi.tsx`:

- `<CoreGameDesc characterKey={key} />` — core passive (all paragraphs, dynamic level)
- `<GameDesc ns="char_Yanagi_gen" key18="ability.desc" />` — additional ability conditional
- `<GameDesc ns="char_Yanagi_gen" key18="mindscapes.1.desc" />` — M1 conditional
- `<GameDesc ns="char_Yanagi_gen" key18="mindscapes.4.desc" />` — M4 conditional
- `<GameDesc ns="char_Yanagi_gen" key18="mindscapes.6.desc" />` — M6 conditional
- `<GameDesc ns="char_Yanagi_gen" key18="basic.BasicAttackTsukuyomiKagura.desc" />` — per-skill (basic)
- `<GameDesc ns="char_Yanagi_gen" key18="special.EXSpecialAttackGekkaRuten.desc" />` — per-skill (special)
- `<GameDesc ns="char_Yanagi_gen" key18="chain.UltimateRaieiTenge.desc" />` — per-skill (chain)

## Example: Miyabi (reference for per-paragraph core + all description types)

See `libs/zzz/formula-ui/src/char/sheets/Miyabi.tsx`:

- `<CoreGameDesc characterKey={key} paragraph={0} />` — core passive conditional (Icefire)
- `<CoreGameDesc characterKey={key} paragraph={1} />` — core passive conditional (Frostburn)
- `<GameDesc ns="char_Miyabi_gen" key18="ability.desc" />` — additional ability conditional
- `<GameDesc ns="char_Miyabi_gen" key18="mindscapes.1.desc" />` — M1 conditional
- `<GameDesc ns="char_Miyabi_gen" key18="mindscapes.6.desc" />` — M6 conditional
- `<GameDesc ns="char_Miyabi_gen" key18="chain.UltimateLingeringSnow.desc" />` — per-skill (chain/ult)
