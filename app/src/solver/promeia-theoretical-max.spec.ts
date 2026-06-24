import {
  compileTagMapValues,
  setDebugMode,
} from '@zenless-optimizer/pando/engine'
import type { WengineKey } from '../consts'
import {
  charTagMapNodeEntries,
  conditionalEntries,
  convert,
  discTagMapNodeEntries,
  enemy,
  own,
  ownTag,
  teamData,
  wengineTagMapNodeEntries,
  withMember,
} from '../formula'
import { Calculator } from '../formula/calculator'
import { data, keys, values } from '../formula/data'
import type { TagMapNodeEntries } from '../formula/data/util'
import { generateTheoreticalDiscs } from './generateTheoreticalDiscs'

setDebugMode(true)
Object.assign(values, compileTagMapValues(keys, data))

describe('Promeia theoretical max', () => {
  it('evaluates theoretical max recipes via formula.base and compares with expected build', () => {
    const charKey = 'Promeia'
    const wengineKey: WengineKey = 'FrostfallSickle'
    const setFilter2 = ['PhaethonsMelody']
    const setFilter4 = ['NotesFromTheChained']

    // ── 1. Generate theoretical max discs ──
    const { recipes, recipeMap } = generateTheoreticalDiscs(
      charKey,
      setFilter2,
      setFilter4,
      { 4: ['anomProf'], 5: ['ice_dmg_'], 6: ['anomMas_'] }
    )
    console.log(`Generated ${recipes.length} recipes`)

    // ── 2. Base entries ──
    function buildCalc(
      recipeStats: Record<string, number>,
      setCounts: Record<string, number>
    ): Calculator {
      const entries: TagMapNodeEntries = [
        ...teamData([charKey]),
        ...withMember(
          charKey,
          ...charTagMapNodeEntries({
            key: charKey,
            level: 60,
            promotion: 5,
            core: 6,
            basic: 11,
            dodge: 11,
            special: 11,
            chain: 11,
            assist: 11,
            mindscape: 0,
            potential: 5,
          }),
          ...wengineTagMapNodeEntries({
            key: wengineKey,
            level: 60,
            modification: 5,
            phase: 1,
          }),
          ...discTagMapNodeEntries(recipeStats, setCounts as any),
          ...[conditionalEntries(wengineKey, charKey, null)('specialUsed', 0)]
        ),
        own.common.critMode.add('avg'),
        enemy.common.def.add(953),
      ]
      return new Calculator(keys, values, compileTagMapValues(keys, entries))
    }

    // ── 3. Evaluate recipes using formula.base path ──
    const aggReader = convert(ownTag, { et: 'own', sheet: 'agg', src: charKey })
    const baseFormulaRead = aggReader.formula.base.with(
      'name',
      'trialByColdAbloomDmgInst'
    )

    // Test a sample (first 500) to keep test fast
    const sampleSize = Math.min(500, recipes.length)
    let bestIdx = -1
    let bestVal = -Infinity

    for (let i = 0; i < sampleSize; i++) {
      const r = recipes[i] as Record<string, any>
      const recipeStats: Record<string, number> = {}
      const setCounts: Record<string, number> = {}
      for (const [key, val] of Object.entries(r)) {
        if (key === 'id') continue
        if (key === setFilter4[0] || key === setFilter2[0]) {
          setCounts[key] = val as number
        } else if (typeof val === 'number' && val !== 0) {
          recipeStats[key] = val as number
        }
      }

      const calc = buildCalc(recipeStats, setCounts)
      const val = calc.compute(baseFormulaRead).val

      if (val > bestVal) {
        bestVal = val
        bestIdx = i
      }
    }

    console.log(`Evaluated ${sampleSize} recipes out of ${recipes.length}`)
    console.log(`Best value: ${bestVal.toFixed(4)}, at index ${bestIdx}`)
    expect(bestVal).toBeGreaterThan(0)
    expect(bestIdx).toBeGreaterThanOrEqual(0)

    // ── 4. Print best recipe details ──
    const bestRecipe = recipes[bestIdx]
    const bestMeta = recipeMap[String(bestRecipe.id)]
    console.log(`\n=== BEST BUILD (sample of ${sampleSize}) ===`)
    console.log(`Main stats: ${JSON.stringify(bestMeta?.mainStats)}`)
    console.log(`Total rolls: ${JSON.stringify(bestMeta?.totalRolls)}`)

    // ── 5. Full scan for top 5 (limited to sample) ──
    const scored: { idx: number; val: number }[] = []
    for (let i = 0; i < sampleSize; i++) {
      const r = recipes[i] as Record<string, any>
      const recipeStats: Record<string, number> = {}
      const setCounts: Record<string, number> = {}
      for (const [key, val] of Object.entries(r)) {
        if (key === 'id') continue
        if (key === setFilter4[0] || key === setFilter2[0]) {
          setCounts[key] = val as number
        } else if (typeof val === 'number' && val !== 0) {
          recipeStats[key] = val as number
        }
      }
      const calc = buildCalc(recipeStats, setCounts)
      const val = calc.compute(baseFormulaRead).val
      if (scored.length < 5 || val > scored[scored.length - 1].val) {
        scored.push({ idx: i, val })
        scored.sort((a, b) => b.val - a.val)
        if (scored.length > 5) scored.pop()
      }
    }

    console.log('\n=== TOP 5 RESULTS ===')
    for (const { idx, val } of scored) {
      const rid = String(recipes[idx].id)
      const meta = recipeMap[rid]
      console.log(`\n#${idx} value=${val.toFixed(2)} recipe=${rid}`)
      console.log(`  Main: ${JSON.stringify(meta?.mainStats)}`)
      console.log(`  Rolls: ${JSON.stringify(meta?.totalRolls)}`)
    }

    // ── 6. Verify main stats ──
    expect(bestMeta?.mainStats['4']).toBe('anomProf')
    expect(bestMeta?.mainStats['5']).toBe('ice_dmg_')
    expect(bestMeta?.mainStats['6']).toBe('anomMas_')
    expect(bestMeta?.set4).toBe('NotesFromTheChained')
    expect(bestMeta?.set2).toBe('PhaethonsMelody')
  })
})
