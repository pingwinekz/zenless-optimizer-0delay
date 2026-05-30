# Character Priority System for Disc Filtering

## Overview

Add a character priority system that excludes discs equipped by higher-priority characters during optimization. Priority is determined by character order in the Characters tab (position 1 = highest priority). The existing `customSortOrder` array is reused for priority storage.

## Implementation Steps

### 1. Add `useCharacterPriority` to OptConfig Schema

**File**: `libs/zzz/db/src/Database/DataManagers/OptConfigDataManager.ts`

Add a new boolean field to the `optConfigSchema` (after `useEquipped` at line 98):

```typescript
useCharacterPriority: zodBoolean(),
```

This enables users to toggle priority-based filtering on/off. Default is `false`.

---

### 2. Create Priority Utility Function

**New File**: `libs/zzz/util/src/character/characterPriority.ts`

```typescript
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'

/**
 * Get priority index for a character from the customSortOrder array.
 * Lower index = higher priority (more protected).
 * Returns Infinity if character not in priority list (least protected).
 */
export function getCharacterPriority(
  characterKey: CharacterKey,
  customSortOrder: string[]
): number {
  const index = customSortOrder.indexOf(characterKey)
  return index === -1 ? Infinity : index
}

/**
 * Check if a disc owner has higher priority than the current character.
 * Higher priority = lower index = disc is protected.
 */
export function hasHigherPriority(
  discOwnerKey: CharacterKey,
  currentCharacterKey: CharacterKey,
  customSortOrder: string[]
): boolean {
  const ownerPriority = getCharacterPriority(discOwnerKey, customSortOrder)
  const currentPriority = getCharacterPriority(currentCharacterKey, customSortOrder)
  return ownerPriority < currentPriority
}
```

**Export**: Add to `libs/zzz/util/src/index.ts`:
```typescript
export * from './character/characterPriority'
```

---

### 3. Modify Disc Filtering Logic

**File**: `libs/zzz/page-optimize/src/Optimize/index.tsx`

Update the `discsBySlot` useMemo (lines 109-151) to check priorities:

```typescript
const discsBySlot = useMemo(() => {
  const slotKeyMap = {
    4: optConfig.slot4,
    5: optConfig.slot5,
    6: optConfig.slot6,
  } as const
  const isFilteredSlot = (slotKey: DiscSlotKey): slotKey is '4' | '5' | '6' =>
    ['4', '5', '6'].includes(slotKey)

  // Get custom sort order for priority checking
  const displayCharacter = database.displayCharacter.get()
  const customSortOrder = displayCharacter?.customSortOrder ?? []

  return discs.reduce(
    (discsBySlot, disc) => {
      const { slotKey, mainStatKey, level, location } = disc
      if (level < optConfig.levelLow || level > optConfig.levelHigh)
        return discsBySlot

      // Existing logic: exclude if useEquipped is false
      if (location && !optConfig.useEquipped && location !== characterKey)
        return discsBySlot

      // NEW: Priority-based filtering
      if (
        location &&
        optConfig.useEquipped &&
        optConfig.useCharacterPriority &&
        location !== characterKey
      ) {
        // Check if disc owner has higher priority
        if (hasHigherPriority(location, characterKey, customSortOrder)) {
          return discsBySlot
        }
      }

      if (
        isFilteredSlot(slotKey) &&
        !slotKeyMap[slotKey].includes(mainStatKey)
      )
        return discsBySlot
      discsBySlot[disc.slotKey].push(disc)
      return discsBySlot
    },
    {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    } as Record<DiscSlotKey, ICachedDisc[]>
  )
}, [
  optConfig.slot4,
  optConfig.slot5,
  optConfig.slot6,
  optConfig.levelLow,
  optConfig.levelHigh,
  optConfig.useEquipped,
  optConfig.useCharacterPriority,
  discs,
  characterKey,
  database.displayCharacter,
])
```

Add import for `hasHigherPriority`:
```typescript
import { hasHigherPriority } from '@genshin-optimizer/zzz/util'
```

---

### 4. Add Toggle in Optimizer UI

**File**: `libs/zzz/page-optimize/src/Optimize/OptimizerForm.tsx`

Add a new toggle in the `OptimizerOptionsSection` (after the `useEquipped` toggle around line 303):

```typescript
<Flex align="center">
  <Switch
    checked={!!optConfig.useCharacterPriority}
    onChange={(e) => setOption('useCharacterPriority', e.currentTarget.checked)}
    disabled={disabled || !optConfig.useEquipped}
    size="xs"
  />
  <Text size="xs">Use Character Priority</Text>
</Flex>
```

Add a tooltip explaining the feature:
```typescript
<HoverCard width={400} position="left" withArrow openDelay={300} closeDelay={200}>
  <HoverCard.Target>
    <IconHelp size={16} style={{ cursor: 'pointer', opacity: 0.6 }} />
  </HoverCard.Target>
  <HoverCard.Dropdown>
    <Text size="sm">
      When enabled, discs equipped by higher-priority characters (higher in the
      character list) will be excluded from optimization. Set priorities by
      dragging characters in the Characters tab.
    </Text>
  </HoverCard.Dropdown>
</HoverCard>
```

Note: The toggle is disabled when `useEquipped` is false, since priority filtering only makes sense when using equipped discs.

---

### 5. Show Priority Numbers in Character List

**File**: `libs/zzz/page-characters/src/index.tsx`

Modify the rank calculation (lines 232-235) to use `customSortOrder` for priority numbers:

```typescript
const rankMap = useMemo(() => {
  const customOrder = displayCharacter.customSortOrder
  if (customOrder && customOrder.length > 0) {
    // Use custom sort order for priority numbers
    return new Map(customOrder.map((ck, i) => [ck, i]))
  }
  // Fallback to filtered order
  return new Map(filteredCharKeys.map((ck, i) => [ck, i]))
}, [filteredCharKeys, displayCharacter.customSortOrder])
```

This ensures the rank numbers displayed (1, 2, 3...) correspond to priority positions, not just the current sort order.

---

### 6. Add Tests

**New File**: `libs/zzz/util/src/character/characterPriority.test.ts`

```typescript
import { describe, expect, it } from 'vitest'
import { getCharacterPriority, hasHigherPriority } from './characterPriority'

describe('getCharacterPriority', () => {
  it('returns index for characters in customSortOrder', () => {
    const order = ['Ellen', 'ZhuYuan', 'Lycaon']
    expect(getCharacterPriority('Ellen', order)).toBe(0)
    expect(getCharacterPriority('ZhuYuan', order)).toBe(1)
    expect(getCharacterPriority('Lycaon', order)).toBe(2)
  })

  it('returns Infinity for characters not in customSortOrder', () => {
    const order = ['Ellen', 'ZhuYuan']
    expect(getCharacterPriority('Lycaon', order)).toBe(Infinity)
  })

  it('returns Infinity for empty customSortOrder', () => {
    expect(getCharacterPriority('Ellen', [])).toBe(Infinity)
  })
})

describe('hasHigherPriority', () => {
  it('returns true when disc owner has higher priority', () => {
    const order = ['Ellen', 'ZhuYuan', 'Lycaon']
    expect(hasHigherPriority('Ellen', 'ZhuYuan', order)).toBe(true)
  })

  it('returns false when disc owner has lower priority', () => {
    const order = ['Ellen', 'ZhuYuan', 'Lycaon']
    expect(hasHigherPriority('Lycaon', 'ZhuYuan', order)).toBe(false)
  })

  it('returns false when disc owner has same priority', () => {
    const order = ['Ellen', 'ZhuYuan']
    expect(hasHigherPriority('Ellen', 'Ellen', order)).toBe(false)
  })

  it('returns false when disc owner is not in priority list', () => {
    const order = ['Ellen', 'ZhuYuan']
    expect(hasHigherPriority('Lycaon', 'Ellen', order)).toBe(false)
  })
})
```

---

## File Changes Summary

| File | Change Type |
|------|-------------|
| `libs/zzz/db/src/Database/DataManagers/OptConfigDataManager.ts` | Modify schema |
| `libs/zzz/util/src/character/characterPriority.ts` | New file |
| `libs/zzz/util/src/index.ts` | Add export |
| `libs/zzz/page-optimize/src/Optimize/index.tsx` | Modify filtering logic |
| `libs/zzz/page-optimize/src/Optimize/OptimizerForm.tsx` | Add toggle UI |
| `libs/zzz/page-characters/src/index.tsx` | Modify rank calculation |
| `libs/zzz/util/src/character/characterPriority.test.ts` | New test file |

---

## User Flow

1. **Set Priorities**: In the Characters tab, drag characters to reorder them. Position 1 = highest priority, position 2 = second priority, etc.
2. **Enable Filtering**: In the Optimizer tab, enable "Use Equipped Discs" and then "Use Character Priority"
3. **Optimize**: The optimizer will exclude discs equipped by higher-priority characters

---

## Edge Cases

- **Empty `customSortOrder`**: All characters have equal priority (no filtering)
- **Unprioritized characters**: Characters not in the priority list get `Infinity` priority (least protected)
- **Same character optimizing**: Discs equipped by the current character are always included
- **Performance**: Priority check is O(1) per disc after getting `customSortOrder`
