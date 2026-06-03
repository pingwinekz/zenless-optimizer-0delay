# Implementation Plan: ZZZ TeammateCard Alignment with Fribbels

## Overview

Three changes to the teammate card system:
1. **Editable overrides** - Add `mindscape` and `wenginePhase` to `TeammateDatum` schema for future build save/load
2. **Disc set conditional display** - When a disc set is selected, show its conditionals and apply them to the teammate via `setFrameConditional`
3. **Fribbels sizing** - Restructure the card layout to 420×490px with two-section (character + W-Engine) vertical layout

## Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `libs/zzz/db/src/Database/DataManagers/TeamDataManager.ts` | Add `mindscape?`, `wenginePhase?` to `teammateDatumSchema`, update `validateTeammates`, add `setTeammateOverride()` method |
| 2 | `libs/zzz/page-optimize/src/Optimize/TeammateCard.tsx` | Full rewrite: 420×490 two-section layout, mindscape/wenginePhase SegmentedControls, disc set conditional display |
| 3 | `libs/zzz/page-optimize/src/Optimize/CharacterConditionalsDisplay.tsx` | Accept optional `mindscape` prop override instead of always using `mainChar.mindscape` |
| 4 | `libs/zzz/page-optimize/src/Optimize/WEngineConditionalsDisplay.tsx` | Accept optional `teammateKey` prop for teammate context |
| 5 | `libs/zzz/page-optimize/src/Optimize/TeammatesSection.tsx` | Pass full `TeammateDatum` to `TeammateCard` |

---

## Step 1: Extend `TeammateDatum` schema (`TeamDataManager.ts`)

Add optional override fields:

```ts
const teammateDatumSchema = z.object({
  characterKey: z.enum(allCharacterKeys),
  optConfigId: z.string().optional(),
  mindscape: z.number().int().min(0).max(6).optional(),   // override (0-6)
  wenginePhase: z.number().int().min(1).max(5).optional(), // override (1-5)
})
```

Update `validateTeammates()` to carry the new fields through:

```ts
teammates.push({
  characterKey: raw.characterKey,
  optConfigId,
  mindscape: raw.mindscape,
  wenginePhase: raw.wenginePhase,
})
```

Add a new method `setTeammateOverride()`:

```ts
setTeammateOverride(
  teamKey: CharacterKey,
  characterKey: CharacterKey,
  override: { mindscape?: number; wenginePhase?: number }
) {
  this.set(teamKey, (team) => ({
    teammates: team.teammates.map((t) =>
      t.characterKey === characterKey ? { ...t, ...override } : t
    ),
  }))
}
```

---

## Step 2: Fix `CharacterConditionalsDisplay` to accept `mindscape` prop

Currently uses `useCharacterContext()!` → `mainChar.mindscape` for all characters. For teammates, we need to pass the teammate's own mindscape.

Add optional `mindscapeOverride` prop:

```tsx
export function CharacterConditionalsDisplay({
  characterKey,
  mindscapeOverride,
}: {
  characterKey: CharacterKey
  mindscapeOverride?: number
}) {
  const mainChar = useCharacterContext()!
  const effectiveMindscape = mindscapeOverride ?? mainChar.mindscape
  // ...
  // Pass effectiveMindscape instead of mainChar.mindscape to CharacterConditionalRow
}
```

---

## Step 3: Fix `WEngineConditionalsDisplay` for teammate context

Same pattern - accept optional teammate context. The current component uses `mainChar.key` for the `src` field in `setFrameConditional`. For teammates, `src` must be the teammate's character key.

Add `teammateKey` prop:

```tsx
export function WEngineConditionalsDisplay({
  wengineKey,
  teammateKey,
}: {
  wengineKey: WengineKey | ''
  teammateKey?: CharacterKey
}) {
  const mainChar = useCharacterContext()!
  const src = teammateKey ?? mainChar.key
  // Use src in setFrameConditional instead of mainChar.key
}
```

---

## Step 4: Rewrite `TeammateCard.tsx` (full rewrite)

Match fribbels layout: **420×490px card** with two sections (character area top, W-Engine area bottom), each section having left column (select + conditionals) and right column (segmented control + icon).

### Layout Structure (matching fribbels' CSS)

```
┌─────────────────────────────── 420px ──────────────────────┐
│ Character Area                              ┌─ 135px ───┐ │
│  ┌─ Left Column ──────────────┐              │ M0-6 Seg  │ │
│  │ CharacterSelect + sync btn │              │ Avatar    │ │
│  │ CharacterConditionals      │              │ 96×96     │ │
│  │ Disc Set (4p) selector     │              │ Disc cond │ │
│  └────────────────────────────┘              └───────────┘ │
├───────────────────────────────────────────────────────────┤
│ W-Engine Area                             ┌─ 135px ────┐ │
│  ┌─ Left Column ──────────────┐              │ Phase 1-5 │ │
│  │ WengineAutocomplete        │              │ W-Eng     │ │
│  │ WEngineConditionals        │              │ 96×96     │ │
│  └────────────────────────────┘              └───────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Key Implementation Details

**Right column - Character area:**
- `SegmentedControl` for mindscape (0-6) — reads/writes `TeammateDatum.mindscape` override
- `ImgIcon` 96×96 character avatar using `characterAsset(characterKey, 'circle')`
- Disc Set 4-piece selector (only show the 6 teamBuff disc sets: AstralVoice, BunnyInWonderland, KingOfTheSummit, MoonlightLullaby, SwingJazz, YunkuiTales)

**Left column - Character area:**
- `CharacterSelect` equivalent (existing "Change Character" button → `CharacterSingleSelectionModal`)
- Sync button + close button
- `CharacterConditionalsDisplay` with `mindscapeOverride={teammateDatum.mindscape ?? teammate.mindscape}`

**Disc set conditional integration:**
- When a teamBuff disc set is selected in the 4p selector, show its conditionals inline
- Use `setFrameConditional(teamKey, 0, discSetKey, condKey, src=teammateCharKey, null, value)`
- This routes through `teamData()` to apply teamBuff to all members
- Custom `DiscSetConditionalRow` component scoped to the teammate as `src`

**Right column - W-Engine area:**
- `SegmentedControl` for wengine phase (1-5) — reads/writes `TeammateDatum.wenginePhase` override
- `ImgIcon` 96×96 W-Engine icon using `wengineAsset(wengineKey, 'icon')`

**Left column - W-Engine area:**
- `WengineAutocomplete` for W-Engine selection
- `WEngineConditionalsDisplay` with `teammateKey={characterKey}`

**Fixed card dimensions:**
```tsx
<CardThemed bgt="light" style={{ width: 420, height: 490, overflow: 'auto' }}>
```

### Sync Logic

When sync button is clicked, reset the teammate's `mindscape` and `wenginePhase` overrides to `undefined` (use roster values), since the roster values are the "default" and overrides are only for build customization.

---

## Step 5: Update `TeammatesSection.tsx`

Pass the `TeammateDatum` to `TeammateCard` so it can read the override values:

```tsx
<TeammateCard
  key={slotIndex}
  slotIndex={slotIndex}
  characterKey={extraTeammates[slotIndex]}
  teammateDatum={team.teammates[slotIndex + 1]}
  onRemove={() => removeTeammate(slotIndex)}
/>
```

---

## Team Data Flow for Optimization

The `buildCalculatorEntries` function in `buildStatsUtils.ts` currently ignores teammate disc sets and uses hardcoded values for teammate W-Engine stats (level 60, modification 5). For now, the disc set selector is non-functional for optimization but the conditionals DO apply via `setFrameConditional` → `team.frames[0].conditionals[]`.

The teammate's mindscape override is read from `TeammateDatum.mindscape` and used when building teammate character stats (future enhancement: pass `TeammateDatum` overrides into `buildCalculatorEntries`).

---

## What Works Immediately After Implementation

1. Mindscape override selector (0-6 SegmentedControl) on each teammate card
2. W-Engine phase override selector (1-5 SegmentedControl) on each teammate card
3. Values stored in `TeammateDatum` schema (persisted in DB)
4. Disc set selector shows only teamBuff disc sets (6 options)
5. When a teamBuff disc set is selected, its conditionals appear and toggle correctly via `setFrameConditional`
6. CharacterConditionalsDisplay correctly uses the teammate's mindscape (not main character's)
7. Sync button resets overrides to roster values
8. Card sized to 420×490px matching fribbels

## What Is Deferred

1. Actually feeding teammate mindscape/W-Engine phase overrides into `buildCalculatorEntries` (requires updating the calc entry builder)
2. Disc set piece counts for teammates (non-functional per user request)
3. The "Builds" save/load system (uses the new override fields as foundation)

---

## Key Reference Files

| Purpose | Path |
|---------|------|
| Team data structure + schema | `libs/zzz/db/src/Database/DataManagers/TeamDataManager.ts` |
| TeammateCard component | `libs/zzz/page-optimize/src/Optimize/TeammateCard.tsx` |
| CharacterConditionalsDisplay | `libs/zzz/page-optimize/src/Optimize/CharacterConditionalsDisplay.tsx` |
| WEngineConditionalsDisplay | `libs/zzz/page-optimize/src/Optimize/WEngineConditionalsDisplay.tsx` |
| TeammatesSection | `libs/zzz/page-optimize/src/Optimize/TeammatesSection.tsx` |
| OptimizerForm integration | `libs/zzz/page-optimize/src/Optimize/OptimizerForm.tsx` (lines 186-190) |
| buildCalculatorEntries | `libs/zzz/page-optimize/src/Util/buildStatsUtils.ts` (line 240) |
| teamData routing | `libs/zzz/formula/src/util.ts` (line 159) |
| Character assets | `libs/zzz/assets/src/index.ts` |
| W-Engine assets | `libs/zzz/assets/src/index.ts` |
| Disc set constants | `libs/zzz/consts/src/disc.ts` |
| PhaseKey type | `libs/zzz/consts/src/wengine.ts` (line 116) |
| Mindscape icon assets | `libs/zzz/assets/src/common/mindscape.ts` |

## ZZZ Disc Sets with Team Buffs (teamBuff)

| Disc Set | Conditional | Type | Effect |
|----------|------------|------|--------|
| **AstralVoice** | `astral` | num (0-3) | teamBuff.combat.common_dmg_ |
| **BunnyInWonderland** | `stacks` | num (0-3) | teamBuff.combat.common_dmg_ |
| **KingOfTheSummit** | `launchExSpecialOrChain` | bool | teamBuff.combat.crit_dmg_ |
| **MoonlightLullaby** | `exSpecial_ult_used` | bool | teamBuff.combat.common_dmg_ |
| **SwingJazz** | `chain_or_ult` | bool | teamBuff.combat.common_dmg_ |
| **YunkuiTales** | `uponLaunchExSpecialChainOrUlt` | num (0-3) | teamBuff.combat.sheer_dmg_ |

## ZZZ Key Types

```ts
// Character mindscape (0-6)
mindscape: zodBoundedNumber(0, 6, 0)

// W-Engine phase (1-5)  
phase: PhaseKey  // 1 | 2 | 3 | 4 | 5

// Conditional schema
{ sheet: Sheet, src: Src, dst: Dst, condKey: string, condValue: number }
```

## Fribbels Reference (HSR TeammateCard)

- Fixed 420×490px card with vertical scroll
- Character area: CharacterSelect + sync + conditionals | Eidolon SegmentedControl + Avatar + relic/ornament set pickers
- LC area: LightConeSelect + conditionals | Superimposition SegmentedControl + LC Avatar
- Team relic/ornament set pickers auto-detect from equipped relics via `calculateTeammateSets()`
- State stored in `useOptimizerRequestStore.teammates[index]`
