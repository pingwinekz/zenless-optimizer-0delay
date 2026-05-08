import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'YeShunguang'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { boolConditional, unity } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  entriesForChar(data_gen),
  ...registerAllDmgDazeAndAnom(key, dm),

  // Core: Unity — CRIT Rate and DMG
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(
      unity.ifOn(percent(subscript(char.core, dm.core.crit_)))
    )
  ),
  registerBuff(
    'core_dmg_',
    ownBuff.combat.common_dmg_.add(
      unity.ifOn(percent(subscript(char.core, dm.core.dmg_)))
    )
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
