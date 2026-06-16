import type {
  AnyNode,
  ReRead,
  TagMapEntries,
} from '@genshin-optimizer/pando/engine'
import {
  TagMapSubset,
  compileTagMapValues,
  constant,
} from '@genshin-optimizer/pando/engine'
import { Calculator } from './calculator'
import { keys, values } from './data'
import type { Tag } from './data/util'
export { Calculator } from './calculator'
export { data as formulaData } from './data'
export * from './conditionalUtil'
export * from './data/util'
export * from './util'
// meta exports — not using `export * from './meta'` so we can merge agg formulas into `formulas`
// Re-export character, wengine, disc namespaces (e.g., Velina, DrillRigRedAxis) that formula-ui uses
// These come from the meta module where each sheet is a `* as` namespace
import {
  buffs as _metaBuffs,
  conditionals as _metaConditionals,
  formulas as _metaFormulas,
} from './meta'
export { _metaConditionals as conditionals, _metaBuffs as buffs }
export * from './meta/char'
export * from './meta/disc'
export * from './meta/wengine'
export * as enemyMeta from './meta/common'
export * as anomalyMeta from './meta/common'
import { formulas as _aggFormulas } from './meta/agg'
export const formulas = { ..._metaFormulas, agg: _aggFormulas } as const

export function zzzCalculatorWithValues(extras: TagMapEntries<number>) {
  return zzzCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function zzzCalculatorWithEntries(
  extras: TagMapEntries<AnyNode | ReRead>
) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values, extraEntries)
}

/**
 * Create a Tag Map that allows looking up a value using a tag
 */
export function createTagMap<V>(values: Array<{ tag: Tag; value: V }>) {
  return new TagMapSubset(keys, compileTagMapValues(keys, values))
}
