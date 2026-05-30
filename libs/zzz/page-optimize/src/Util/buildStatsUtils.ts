import { notEmpty, toDecimal } from '@genshin-optimizer/common/util'
import { presets } from '@genshin-optimizer/game-opt/engine'
import { constant } from '@genshin-optimizer/pando/engine'
import type { DiscSlotKey, PhaseKey } from '@genshin-optimizer/zzz/consts'
import type {
  ICachedCharacter,
  ICachedDisc,
  Team,
  DiscIds,
} from '@genshin-optimizer/zzz/db'
import { teamCharacterKeys, getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import {
  type TagMapNodeEntries,
  zzzCalculatorWithEntries,
  teamData,
  withMember,
  withPreset,
  charTagMapNodeEntries,
  wengineTagMapNodeEntries,
  discsToTagMapNodeEntries,
  conditionalEntries,
  convert,
  ownTag,
  ownBuff,
  enemy,
  Read,
} from '@genshin-optimizer/zzz/formula'
import { allStats } from '@genshin-optimizer/zzz/stats'

/** Stats derived from final (combat) calculations */
export type BuildCombatStats = {
  hp: number
  atk: number
  def: number
  impact: number
  critRate: number
  critDmg: number
  penRatio: number
  pen: number
  enerRegen: number
  anomProf: number
  anomMas: number
  dmgBonus: number
  defIgn: number
}

/** Stats derived from base calculations (before combat buffs) */
export type BuildBaseStats = {
  hp: number
  atk: number
  def: number
  impact: number
  critRate: number
  critDmg: number
  penRatio: number
  pen: number
  enerRegen: number
  anomProf: number
  anomMas: number
}

export type EnrichedBuild = {
  id: string
  index: number
  value: number
  wengineKey?: string
  wengineName?: string
  discIds: DiscIds
  discSetIds: string[]
  combatStats: BuildCombatStats | null
  baseStats: BuildBaseStats | null
}

/**
 * Compute enriched stats for a single build by creating a temporary
 * formula calculator with the build's disc/wengine data.
 * Returns both final (combat) and base stat sets simultaneously.
 */
export function computeBuildStats(
  character: ICachedCharacter,
  discs: Record<DiscSlotKey, ICachedDisc | undefined>,
  team: Team,
  targetTag?: Tag | Tag[]
): { final: BuildCombatStats; base: BuildBaseStats; targetValue?: number } {
  const entries = buildCalculatorEntries(character, discs, team)
  const calc = zzzCalculatorWithEntries(entries)

  // Must match the `src` set by `withMember()` above
  const ownReader = convert(ownTag, { et: 'own', src: character.key })

  const final: BuildCombatStats = {
    hp: calc.compute(ownReader.final.hp).val,
    atk: calc.compute(ownReader.final.atk).val,
    def: calc.compute(ownReader.final.def).val,
    impact: calc.compute(ownReader.final.impact).val,
    critRate: calc.compute(ownReader.common.cappedCrit_).val,
    critDmg: calc.compute(ownReader.final.crit_dmg_).val,
    penRatio: calc.compute(ownReader.final.pen_).val,
    pen: calc.compute(ownReader.final.pen).val,
    enerRegen: calc.compute(ownReader.final.enerRegen).val,
    anomProf: calc.compute(ownReader.final.anomProf).val,
    anomMas: calc.compute(ownReader.final.anomMas).val,
    dmgBonus: calc.compute(ownReader.final.dmg_).val,
    defIgn: calc.compute(ownReader.final.defIgn_).val,
  }

  const base: BuildBaseStats = {
    hp: calc.compute(ownReader.base.hp).val,
    atk: calc.compute(ownReader.base.atk).val,
    def: calc.compute(ownReader.base.def).val,
    impact: calc.compute(ownReader.base.impact).val,
    critRate: calc.compute(ownReader.common.cappedCrit_).val,
    critDmg: calc.compute(ownReader.base.crit_dmg_).val,
    penRatio: calc.compute(ownReader.base.pen_).val,
    pen: 0, // base raw pen is not applicable
    enerRegen: calc.compute(ownReader.base.enerRegen).val,
    anomProf: calc.compute(ownReader.base.anomProf).val,
    anomMas: calc.compute(ownReader.base.anomMas).val,
  }

  if (targetTag) {
    const tags = Array.isArray(targetTag) ? targetTag : [targetTag]
    const targetValue = tags.reduce((sum, tag) => {
      const targetRead = new Read(
        { src: character.key, ...tag },
        undefined
      ).with('preset', 'preset0' as any)
      const val = calc.compute(targetRead).val
      return sum + val
    }, 0)
    return { final, base, targetValue }
  }

  return { final, base, targetValue: undefined }
}

/**
 * Batch compute stats for an array of builds.
 * Uses requestIdleCallback-style batching to avoid blocking the UI.
 * Returns a Promise that resolves with an array of enriched builds.
 */
export async function batchComputeBuildStats(
  builds: { discIds: DiscIds; value: number; wengineKey?: string }[],
  getDisc: (id: string) => ICachedDisc | undefined,
  character: ICachedCharacter,
  team: Team,
  onProgress?: (completed: number, total: number) => void,
  targetTag?: Tag | Tag[]
): Promise<EnrichedBuild[]> {
  const BATCH_SIZE = 10
  const enriched: EnrichedBuild[] = []
  const total = builds.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = builds.slice(i, i + BATCH_SIZE)

    // Yield to browser between batches
    if (i > 0) {
      await new Promise<void>((resolve) => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => resolve(), { timeout: 50 })
        } else {
          setTimeout(resolve, 0)
        }
      })
    }

    for (let j = 0; j < batch.length; j++) {
      const build = batch[j]
      const discs = Object.fromEntries(
        Object.entries(build.discIds).map(([slot, id]) => [
          slot,
          id ? getDisc(id) : undefined,
        ])
      ) as Record<DiscSlotKey, ICachedDisc | undefined>

      const discValues = Object.values(discs).filter(notEmpty)

      // Get disc set keys
      const setCounts = new Map<string, number>()
      for (const disc of discValues) {
        const setKey = disc.setKey
        setCounts.set(setKey, (setCounts.get(setKey) ?? 0) + 1)
      }
      const discSetIds = Array.from(setCounts.entries())
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key)
      let combatStats: BuildCombatStats | null = null
      let baseStats: BuildBaseStats | null = null
      let value = build.value
      try {
        const result = computeBuildStats(
          character,
          discs,
          team,
          targetTag
        )
        combatStats = result.final
        baseStats = result.base
        // For rotation DMG (array targetTag), the solver already computed
        // the correct multi-preset value — don't override it with the
        // post-solver single-preset computation.
        if (
          !Array.isArray(targetTag) &&
          result.targetValue !== undefined
        ) {
          value = result.targetValue
        }
      } catch {
        // If stats computation fails, leave as null
      }

      enriched.push({
        id: buildRowId(build),
        index: i + j,
        value,
        wengineKey: build.wengineKey,
        discIds: build.discIds,
        discSetIds,
        combatStats,
        baseStats,
      })
    }

    onProgress?.(Math.min(i + BATCH_SIZE, total), total)
  }

  return enriched
}

/**
 * Build the calculator entries for a given build, used for computing
 * both stats and the optimization target value.
 */
function buildCalculatorEntries(
  character: ICachedCharacter,
  discs: Record<DiscSlotKey, ICachedDisc | undefined>,
  team: Team
): TagMapNodeEntries {
  const teamMembers = teamCharacterKeys(team)
  const frames = team.frames.length > 0 ? team.frames : [getTeamFrame0(team)]

  return [
    ...teamData(teamMembers),
    ...withMember(
      character.key,
      ...charTagMapNodeEntries({
        key: character.key,
        level: character.level,
        promotion: character.promotion,
        basic: character.basic,
        dodge: character.dodge,
        special: character.special,
        chain: character.chain,
        assist: character.assist,
        core: character.core,
        mindscape: character.mindscape,
        potential: character.potential,
      }),
      ...wengineTagMapNodeEntries(
        character.wengineKey
          ? {
              key: character.wengineKey,
              level: 60,
              modification: 5,
              phase: character.wenginePhase as PhaseKey,
            }
          : undefined
      ),
      ...discsToTagMapNodeEntries(Object.values(discs).filter(notEmpty))
    ),
    enemy.common.lvl.add(team.enemyLvl),
    enemy.common.def.add(team.enemyDef),
    enemy.common.stun_.add(team.enemyStunMultiplier / 100),
    enemy.common.unstun_.add(1),
    ...frames.flatMap((frame, i) => {
      const preset = presets[i] ?? 'preset0'
      return [
        ...withPreset(preset, ownBuff.common.critMode.add(frame.critMode)),
        ...frame.conditionals.flatMap(
          ({ sheet, src, dst, condKey, condValue }) =>
            withPreset(
              preset,
              conditionalEntries(sheet, src, dst)(condKey, condValue)
            )
        ),
        ...frame.bonusStats
          .filter(({ disabled }) => !disabled)
          .flatMap(({ tag, value }) =>
            withPreset(preset, {
              tag: {
                ...tag,
                src: character.key,
                sheet: 'agg',
                et: 'own',
              } as any,
              value: constant(toDecimal(value, tag.q ?? '')),
            })
          ),
        ...frame.enemyStats.flatMap(({ tag, value }) =>
          withPreset(preset, {
            tag: {
              ...tag,
              qt: 'common',
              et: 'enemy',
              sheet: 'agg',
            } as any,
            value: constant(toDecimal(value, tag.q ?? '')),
          })
        ),
      ]
    }),
    // Non-main teammates count
    ...team.teammates
      .filter((t) => t.characterKey !== character.key)
      .flatMap(({ characterKey: charKey }) => [
        ownBuff.common.count
          .withSpecialty(allStats.char[charKey].specialty as any)
          .add(1),
        ownBuff.common.count
          .withFaction(allStats.char[charKey].faction as any)
          .add(1),
        ownBuff.common.count
          .withTag({ attribute: allStats.char[charKey].attribute as any })
          .add(1),
      ]),
  ]
}

/**
 * Build a unique stable row ID from a build's wengine + disc combination.
 */
export function buildRowId(build: {
  wengineKey?: string
  discIds: DiscIds
}): string {
  return `${build.wengineKey ?? ''}-${Object.values(build.discIds).join('-')}`
}

/** Display name (short) for each stat */
export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  impact: 'IMP',
  critRate: 'CR',
  critDmg: 'CD',
  penRatio: 'PEN%',
  pen: 'PEN',
  enerRegen: 'ER',
  anomProf: 'AP',
  anomMas: 'AM',
  dmgBonus: 'DMG%',
  defIgn: 'DEF IGN',
}
