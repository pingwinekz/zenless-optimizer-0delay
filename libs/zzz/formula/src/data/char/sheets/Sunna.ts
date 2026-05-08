import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  cmpGE,
  constant,
  min,
  prod,
  subscript,
} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
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

const {
  boolConditional,
  delusionReprise,
  etherVeil,
  focusedCreation,
  ult_used,
} = allBoolConditionals(key)

const m6_crit_ = ownBuff.combat.crit_.add(
  cmpGE(char.mindscape, 6, focusedCreation.ifOn(1))
)
const m6_crit_dmg_ = ownBuff.combat.crit_dmg_.add(
  cmpGE(
    char.mindscape,
    6,
    focusedCreation.ifOn(
      min(
        percent(dm.m6.maxCritEx),
        prod(own.initial.atk, percent(dm.m6.critexPerAtk))
      )
    )
  )
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

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
    'ability_stun_',
    enemyDebuff.common.stun_.add(delusionReprise.ifOn(constant(0.3))),
    undefined,
    true
  ),
  registerBuff(
    'm2_etherVeil_atk',
    teamBuff.combat.atk.add(
      cmpGE(
        char.mindscape,
        2,
        etherVeil.ifOn(prod(own.initial.atk, percent(dm.m2.etherVeilAtk)))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 4, ult_used.ifOn(percent(dm.m4.squadDmg_)))
    ),
    undefined,
    true
  ),
  registerBuff('m6_crit_', m6_crit_, undefined, true),
  registerBuff('m6_crit_dmg_', m6_crit_dmg_, undefined, true)
)
export default sheet
