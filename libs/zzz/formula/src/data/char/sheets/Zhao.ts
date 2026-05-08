import {
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { NumNode } from '@genshin-optimizer/pando/engine'
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
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Zhao'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { etherVeil, boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const floorDiv = (x: NumNode, divisor: number, max: number) =>
  sum(...Array.from({ length: max }, (_, i) => cmpGE(x, (i + 1) * divisor, 1)))

const excessHp = max(sum(own.initial.hp, -dm.ability.hpThreshold), 0)

const sheet = register(
  key,
  entriesForChar(data_gen),
  ...registerAllDmgDazeAndAnom(key, dm),

  // Core: CRIT Rate per 1000 initial Max HP (floor division)
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(
      prod(
        floorDiv(own.initial.hp, dm.core.hpDivisor, 50),
        percent(subscript(char.core, dm.core.crit__per_hp))
      )
    )
  ),
  // Core: Squad Max HP% while Ether Veil: Wellspring is active
  registerBuff(
    'core_etherVeil_hp_',
    teamBuff.combat.hp_.add(etherVeil.ifOn(percent(dm.core.squadHp_))),
    undefined,
    true
  ),
  // Core: Squad ATK when Ether Veil: Wellspring is activated
  registerBuff(
    'core_etherVeil_atk',
    teamBuff.combat.atk.add(
      etherVeil.ifOn(subscript(char.core, dm.core.squadAtk))
    ),
    undefined,
    true
  ),
  // Additional Ability: squad DMG% scaling with initial Max HP (floor division)
  registerBuff(
    'ability_squad_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('attack'),
          team.common.count.withSpecialty('anomaly'),
          team.common.count.withSpecialty('support')
        ),
        1,
        etherVeil.ifOn(
          min(
            percent(dm.ability.maxDmg_),
            sum(
              percent(dm.ability.squadDmg_),
              prod(
                floorDiv(excessHp, dm.ability.hpPerBonus, 30),
                percent(dm.ability.dmgPerHp)
              )
            )
          )
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
