import type { Candidate } from '@zenless-optimizer/game-opt/solver'

import type {
  CharacterKey,
  DiscMainStatKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
} from '../consts'
import {
  allDiscSlotKeys,
  allDiscSubStatKeys,
  discSlotToMainStatKeys,
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
} from '../consts'
import type { ZzzDatabase } from '../db'
import {
  getCharacterEffectiveMainStats,
  getCharacterEffectiveStats,
} from '../util'

const THEORETICAL_RARITY = 'S' as const
const THEORETICAL_LEVEL = 15
const TOTAL_DISCS = 6
const MAX_SUBSTATS_PER_DISC = 4
const UPGRADE_ROLLS_PER_DISC = 5
// Each substat per disc: 1 base roll + up to 5 upgrades = 6 total max
const MAX_ROLLS_PER_SUBSTAT = 6

/**
 * Module-level cache of all valid per-disc substat patterns.
 * Each pattern: 4 substats (indices into allDiscSubStatKeys), each with 1-6 rolls, sum=9.
 * Pre-computed once: C(10,4) = 210 type-choices × C(5+4-1,4-1) = 56 roll-distributions = 11,760.
 */
let _validPatternsCache: [number[], number[]][] | null = null

/** Build-level recipe metadata for display */
export interface BuildRecipe {
  id: string
  mainStats: Record<DiscSlotKey, DiscMainStatKey>
  /** Total rolls per substat across all 6 discs */
  totalRolls: Partial<Record<DiscSubStatKey, number>>
  /** Number of discs each substat appears on (for per-disc reconstruction) */
  appearances: Partial<Record<DiscSubStatKey, number>>
  /** Per-disc substat allocation: exactly 4 {key, upgrades} per disc, 6 discs */
  perDiscSubstats: { key: DiscSubStatKey; upgrades: number }[][]
  set4: DiscSetKey
  set2: DiscSetKey
}

/**
 * Generate build-level aggregate recipes for "theoretical max" mode.
 *
 * Each recipe represents a COMPLETE build's total stats across all 6 discs.
 * Instead of generating per-slot individual discs (which creates duplicate
 * solver results when the same stats are in different slot arrangements),
 * we generate one candidate per unique stat DISTRIBUTION.
 *
 * Returns a flat array of solver Candidate objects (one per recipe) plus
 * a recipe map with display metadata.
 */
export function generateTheoreticalDiscs(
  characterKey: CharacterKey,
  setFilter2: DiscSetKey[],
  setFilter4: DiscSetKey[],
  database?: ZzzDatabase
): {
  recipes: Candidate<string>[]
  recipeMap: Record<string, BuildRecipe>
} {
  // 1. Build set key list
  const setKeys = [...new Set([...setFilter4, ...setFilter2])]
  if (setKeys.length === 0) {
    return { recipes: [], recipeMap: {} }
  }

  // Use first set in each filter as the assigned set
  // (user selects exactly 1 4p + 1 2p, enforced by UI guidance)
  const set4 = setFilter4[0]
  const set2 = setFilter2[0]

  // 2. The composition explores ALL 10 substats so the solver can pick the best
  //    distribution. The aggregate totals are computed directly:
  //    totalRolls[S] = perDiscRolls[S] × (6 - slots where S is the main stat).
  const allSubstats = [...allDiscSubStatKeys]
  const effectiveSubstats = getCharacterEffectiveStats(characterKey)
  const effectiveMainStats = getMergedMainStatsInternal(characterKey, database)

  // 3. Pre-compute all valid per-disc patterns (4 substats, each 1-6 rolls, sum=9)
  const validPatterns = getValidPatterns()

  // 4. Generate main stat combinations for slots 4/5/6
  const mainStatCombos = generateMainStatCombos(effectiveMainStats)

  // 5. For each combination, create a build recipe
  const recipes: Candidate<string>[] = []
  const recipeMap: Record<string, BuildRecipe> = {}
  let recipeIndex = 0

  for (const mainStats of mainStatCombos) {
    // Combine fixed + selected main stats
    const allMainStats: Record<DiscSlotKey, DiscMainStatKey> = {
      '1': 'hp',
      '2': 'atk',
      '3': 'def',
      '4':
        mainStats.find(([s]) => s === '4')?.[1] ??
        discSlotToMainStatKeys['4'][0],
      '5':
        mainStats.find(([s]) => s === '5')?.[1] ??
        discSlotToMainStatKeys['5'][0],
      '6':
        mainStats.find(([s]) => s === '6')?.[1] ??
        discSlotToMainStatKeys['6'][0],
    }

    for (const [typeIndices, rollCounts] of validPatterns) {
      // Map indices to substat keys. Patterns may include substats that are
      // blocked on some discs (e.g., hp_ on slot 6) — computeSubstatAggregate
      // handles this via maxAppearances (reducing discs for blocked substats).
      const comboSubstats = typeIndices.map((i) => allSubstats[i])
      const comboRolls = [...rollCounts]

      // Build the flat Candidate object with ALL stats summed.
      const candidate: Record<string, any> = {
        id: `recipe_${recipeIndex}`,
        // Slot 1-3 fixed main stats
        hp: getDiscMainStatVal(THEORETICAL_RARITY, 'hp', THEORETICAL_LEVEL),
        atk: getDiscMainStatVal(THEORETICAL_RARITY, 'atk', THEORETICAL_LEVEL),
        def: getDiscMainStatVal(THEORETICAL_RARITY, 'def', THEORETICAL_LEVEL),
      }

      // Slot 4-6 main stats (summed: slots 4/5 can share same stat, e.g. hp_)
      candidate[allMainStats['4']] =
        (candidate[allMainStats['4']] ?? 0) +
        getDiscMainStatVal(
          THEORETICAL_RARITY,
          allMainStats['4'],
          THEORETICAL_LEVEL
        )
      candidate[allMainStats['5']] =
        (candidate[allMainStats['5']] ?? 0) +
        getDiscMainStatVal(
          THEORETICAL_RARITY,
          allMainStats['5'],
          THEORETICAL_LEVEL
        )
      candidate[allMainStats['6']] =
        (candidate[allMainStats['6']] ?? 0) +
        getDiscMainStatVal(
          THEORETICAL_RARITY,
          allMainStats['6'],
          THEORETICAL_LEVEL
        )

      // Substat values: computed directly — each substat's total rolls =
      // perDiscRolls × (6 - slots where main stat overlaps). The formula
      // solver evaluates the aggregate math; no per-disc simulation needed.
      const aggregate = computeSubstatAggregate(
        comboSubstats,
        comboRolls,
        allMainStats,
        effectiveSubstats
      )

      for (const [key, value] of Object.entries(aggregate.totals)) {
        candidate[key] = (candidate[key] ?? 0) + value
      }

      // Set counters
      if (set4 === set2) {
        candidate[set4] = 6
      } else {
        candidate[set4] = 4
        candidate[set2] = 2
      }

      // Cap Crit Rate at 0.95 (95%) — with base 5% this gives 100% total.
      // CR above 100% provides zero benefit in the formula (cappedCrit_),
      // and those substat rolls would be better spent on CD, ATK%, etc.
      if (typeof candidate.crit_ === 'number') {
        candidate.crit_ = Math.min(candidate.crit_, 0.95)
      }

      const id = `recipe_${recipeIndex}`
      candidate.id = id

      recipes.push(candidate as Candidate<string>)

      recipeMap[id] = {
        id,
        mainStats: allMainStats,
        totalRolls: aggregate.rolls,
        appearances: aggregate.appearances,
        perDiscSubstats: aggregate.perDisc,
        set4,
        set2,
      }

      recipeIndex++
    }
  }

  return { recipes, recipeMap }
}

/**
 * Get all valid per-disc substat patterns.
 * Each valid pattern has exactly 4 substats, each with 1-6 rolls, summing to 9.
 * Total: C(10,4) × C(5+4-1,4-1) = 210 × 56 = 11,760 patterns.
 *
 * The patterns are represented as arrays of indices into allDiscSubStatKeys
 * (the 4 chosen substat types) and their corresponding roll counts.
 */
function getValidPatterns(): [number[], number[]][] {
  if (_validPatternsCache) return _validPatternsCache

  const all = [...allDiscSubStatKeys]
  const n = all.length
  const patterns: [number[], number[]][] = []

  // Step 1: choose 4 indices from 10 (C(10,4) = 210)
  function choose4(start: number, chosen: number[]) {
    if (chosen.length === MAX_SUBSTATS_PER_DISC) {
      // Step 2: distribute 5 upgrade rolls among 4 positions (C(5+4-1,4-1) = 56)
      // Each of the 4 gets 1 base + (0-5) upgrades = 1-6 total
      const upgrades = [0, 0, 0, 0]
      const enumUpgrades = (idx: number, remaining: number) => {
        if (idx === MAX_SUBSTATS_PER_DISC - 1) {
          upgrades[idx] = remaining
          const rolls = upgrades.map((u) => u + 1) // 1 base + upgrades
          if (rolls.every((r) => r <= MAX_ROLLS_PER_SUBSTAT)) {
            patterns.push([[...chosen], [...rolls]])
          }
          return
        }
        for (let v = 0; v <= remaining; v++) {
          upgrades[idx] = v
          enumUpgrades(idx + 1, remaining - v)
        }
      }
      enumUpgrades(0, UPGRADE_ROLLS_PER_DISC)
      return
    }
    for (let i = start; i < n; i++) {
      chosen.push(i)
      choose4(i + 1, chosen)
      chosen.pop()
    }
  }
  choose4(0, [])

  _validPatternsCache = patterns
  return patterns
}

/**
 * Generate all main stat combinations for slots 4/5/6.
 */
function generateMainStatCombos(
  effectiveMainStats: Partial<Record<DiscSlotKey, DiscMainStatKey[]>>
): [DiscSlotKey, DiscMainStatKey][][] {
  const slot4Opts = effectiveMainStats['4'] ?? discSlotToMainStatKeys['4']
  const slot5Opts = effectiveMainStats['5'] ?? discSlotToMainStatKeys['5']
  const slot6Opts = effectiveMainStats['6'] ?? discSlotToMainStatKeys['6']

  const combos: [DiscSlotKey, DiscMainStatKey][][] = []
  for (const m4 of slot4Opts) {
    for (const m5 of slot5Opts) {
      for (const m6 of slot6Opts) {
        combos.push([
          ['4', m4],
          ['5', m5],
          ['6', m6],
        ])
      }
    }
  }
  return combos
}

interface SubstatAggregate {
  totals: Record<string, number>
  rolls: Record<DiscSubStatKey, number>
  appearances: Record<DiscSubStatKey, number>
  /** Per-disc breakdown: 6 arrays of {key, upgrades (not including base 1)} */
  perDisc: { key: DiscSubStatKey; upgrades: number }[][]
}

/**
 * Per-disc fill: each disc MUST have exactly 4 unique substats. The pattern
 * specifies 4 substats and their roll counts (1 base + 0-5 upgrades each,
 * sum=9). On discs where a pattern substat matches the main stat, it's
 * replaced by a filler substat (other type, 1 base roll, 0 upgrades).
 * The blocked substat's upgrade rolls are redistributed to the other 3.
 * This guarantees 4 substats per disc, 9 rolls each, 54 total.
 */
/** @internal exported for testing */
export function computeSubstatAggregate(
  comboSubstats: DiscSubStatKey[],
  comboRolls: number[],
  allMainStats: Record<DiscSlotKey, DiscMainStatKey>,
  effectiveSubstats?: DiscSubStatKey[]
): SubstatAggregate {
  const rolls: Record<DiscSubStatKey, number> = {} as Record<
    DiscSubStatKey,
    number
  >
  const totals: Record<string, number> = {}
  const appearances: Record<DiscSubStatKey, number> = {} as Record<
    DiscSubStatKey,
    number
  >
  const perDisc: { key: DiscSubStatKey; upgrades: number }[][] = []

  // Build list of pattern substats (keep original order from getValidPatterns)
  const patternSubstats = comboSubstats.map((key, i) => ({
    key,
    perDiscRolls: comboRolls[i],
  }))

  for (let discIdx = 0; discIdx < TOTAL_DISCS; discIdx++) {
    const slotKey = allDiscSlotKeys[discIdx]
    const mainStat = allMainStats[slotKey]

    // Start with all 4 pattern substats
    const discSubs = patternSubstats.map((s) => ({
      key: s.key,
      upgrades: s.perDiscRolls,
    }))

    // Check if any pattern substat matches the main stat
    const blocked = discSubs.find((s) => s.key === mainStat)
    if (blocked) {
      // Keep 1 base roll for the filler, redistribute the rest
      const extra = blocked.upgrades - 1 // upgrade rolls to redistribute
      blocked.upgrades = 1 // filler keeps 1 base roll
      blocked.key = pickFiller(mainStat, patternSubstats, effectiveSubstats)

      // Redistribute extra rolls to the other 3 pattern substats
      // Give to the lowest-alloc substats first, capped at 6 each
      const others = discSubs.filter((s) => s.key !== blocked.key)
      for (let r = 0; r < extra; r++) {
        let bestIdx = -1
        let bestVal = Infinity
        for (let i = 0; i < others.length; i++) {
          if (
            others[i].upgrades < MAX_ROLLS_PER_SUBSTAT &&
            others[i].upgrades < bestVal
          ) {
            bestIdx = i
            bestVal = others[i].upgrades
          }
        }
        if (bestIdx >= 0) others[bestIdx].upgrades++
      }
    }

    // Add to totals and track appearances
    for (const s of discSubs) {
      rolls[s.key] = (rolls[s.key] ?? 0) + s.upgrades
      totals[s.key] =
        (totals[s.key] ?? 0) +
        getDiscSubStatBaseVal(s.key, THEORETICAL_RARITY) * s.upgrades
      appearances[s.key] = (appearances[s.key] ?? 0) + 1
    }
    perDisc.push(discSubs)
  }

  return {
    totals,
    rolls,
    appearances,
    perDisc,
  }
}

/**
 * Pick a filler substat: prefer the character's effective substats (in order),
 * falling back to the first available type if none of the effective ones fit.
 */
function pickFiller(
  mainStat: DiscMainStatKey,
  patternSubstats: { key: DiscSubStatKey; perDiscRolls: number }[],
  effectiveSubstats?: DiscSubStatKey[]
): DiscSubStatKey {
  const patternKeys = new Set(patternSubstats.map((s) => s.key))
  // Prefer effective substats in priority order
  if (effectiveSubstats) {
    for (const effKey of effectiveSubstats) {
      if (effKey !== mainStat && !patternKeys.has(effKey)) return effKey
    }
  }
  // Fallback: any available substat
  for (const k of allDiscSubStatKeys) {
    if (k !== mainStat && !patternKeys.has(k)) return k
  }
  return 'def_'
}

// ─── Merged main stat helper (inline to avoid page-discs dependency) ───

function getMergedMainStatsInternal(
  charKey: CharacterKey,
  database?: ZzzDatabase
): Partial<Record<DiscSlotKey, DiscMainStatKey[]>> {
  const defaults = getCharacterEffectiveMainStats(charKey)
  if (!database) return defaults
  const override = database.statWeights.get(charKey)
  if (!override || !override.mainStats) return defaults
  const merged = { ...defaults }
  for (const [slot, stats] of Object.entries(override.mainStats)) {
    merged[slot as DiscSlotKey] = stats as DiscMainStatKey[]
  }
  return merged
}
