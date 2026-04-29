import { cmpGE, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'StarlightBilly'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
getBaseTag(data_gen)

const { char } = own

const ability_dmg = cmpGE(
  sum(
    team.common.count.withSpecialty('stun'),
    team.common.count.withSpecialty('defense'),
    team.common.count.withSpecialty('support')
  ),
  1,
  percent(dm.ability.starlightMaxStacks * dm.ability.starlightDmgPerStack)
)

const core_critDmg = subscript(char.core, dm.core.critDmgPerUse)

// M2 + Ability + M6 combined for Full-Throttle Starlight and Ultimate
const m2_ability_m6 = ownBuff.combat.common_dmg_.add(
  sum(
    ability_dmg,
    cmpGE(char.mindscape, 2, dm.m2.dmg_),
    cmpGE(char.mindscape, 6, dm.m6.sheerDmg_)
  )
)

// M2 + Ability for EX Special Cool Wheelie
const m2_plus_ability = ownBuff.combat.common_dmg_.add(
  sum(ability_dmg, cmpGE(char.mindscape, 2, dm.m2.dmg_))
)

const ability_dmg_node = ownBuff.combat.common_dmg_.add(ability_dmg)

const sheet = register(
  key,
  entriesForChar(data_gen),
  ...registerAllDmgDazeAndAnom(key, dm,
    // M2 + Ability + M6: Full-Throttle Starlight, Ultimate
    dmgDazeAndAnomOverride(dm, 'basic', 'BasicAttackFullThrottleStarlight', 0,
      { damageType1: 'basic' }, 'atk', undefined, m2_ability_m6),
    dmgDazeAndAnomOverride(dm, 'chain', 'UltimateStarlightKnightFlyingKick', 0,
      { damageType1: 'chain' }, 'atk', undefined, m2_ability_m6),
    // M2 + Ability (no M6): EX Special Cool Wheelie
    dmgDazeAndAnomOverride(dm, 'special', 'EXSpecialAttackCoolWheelie', 0,
      { damageType1: 'special' }, 'atk', undefined, m2_plus_ability),
    // Ability-only (no M2/M6): other EX Specials and Chain Attack
    dmgDazeAndAnomOverride(dm, 'special', 'EXSpecialAttackHighTractionWheels', 0,
      { damageType1: 'special' }, 'atk', undefined, ability_dmg_node),
    dmgDazeAndAnomOverride(dm, 'special', 'EXSpecialAttackRockingFootwork', 0,
      { damageType1: 'special' }, 'atk', undefined, ability_dmg_node),
    dmgDazeAndAnomOverride(dm, 'chain', 'ChainAttackKnightsSwagger', 0,
      { damageType1: 'chain' }, 'atk', undefined, ability_dmg_node)
  ),

  registerBuff('core_critDmg', ownBuff.combat.crit_dmg_.add(core_critDmg)),
  registerBuff('ability_dmg_', ability_dmg_node, undefined, undefined, false),
  registerBuff('m1_physResIgn', ownBuff.combat.resIgn_.physical.add(
    cmpGE(char.mindscape, 1, percent(dm.m1.physResIgn)))),
  registerBuff('m4_critDmg', ownBuff.combat.crit_dmg_.add(
    cmpGE(char.mindscape, 4, percent(dm.m4.maxStacks * dm.m4.critDmgPerUse)))),
  registerBuff('m2_dmg_', ownBuff.combat.common_dmg_.add(cmpGE(char.mindscape, 2, dm.m2.dmg_)), undefined, undefined, false),
  registerBuff('m6_sheerDmg_', ownBuff.combat.common_dmg_.add(cmpGE(char.mindscape, 6, dm.m6.sheerDmg_)), undefined, undefined, false)
)
export default sheet