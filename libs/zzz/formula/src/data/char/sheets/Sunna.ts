import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import { cmpGE, constant, min, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Sunna'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  // Custom damage - Cat's Gaze (Note: uses Sunna's stats as placeholder.
  // Real implementation would need triggering agent's stats but system doesn't support this)
  ...customDmg(
    'cats_gaze_attack',
    { attribute: 'physical', damageType1: 'basic' },
    prod(own.final.atk, percent(subscript(char.core, dm.core.catsGazeAttackDmg)))
  ),
  ...customDmg(
    'cats_gaze_anomaly',
    { attribute: 'physical', damageType1: 'basic' },
    prod(own.final.atk, percent(subscript(char.core, dm.core.catsGazeAnomalyDmg)))
  ),

  // Buffs
  registerBuff(
    'core_atk',
    teamBuff.combat.atk.add(
      boolConditional.ifOn(
        min(
          subscript(char.core, dm.core.maxAtkBonus),
          prod(own.initial.atk, percent(dm.core.atk_))
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm6_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 6, boolConditional.ifOn(1))
    )
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.combat.common_dmg_.add(listConditional.map({ val1: 1, val2: 2 }))
  ),
  registerBuff('enemy_defRed_', enemyDebuff.common.defRed_.add(numConditional))
)
export default sheet
