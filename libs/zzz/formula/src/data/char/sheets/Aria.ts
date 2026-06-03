import {
  cmpGE,
  constant,
  max,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Aria'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { boolConditional } = allBoolConditionals(key, undefined, {
  boolConditional: 6,
})

const m6_perfectPitch_dmg_ = ownBuff.combat.dmg_.ether.add(
  cmpGE(char.mindscape, 6, boolConditional.ifOn(percent(dm.m6.enhancedDmg)))
)
const m6_ult_dmg_ = ownBuff.combat.dmg_.ether.add(
  cmpGE(char.mindscape, 6, boolConditional.ifOn(percent(dm.m6.enhancedDmg)))
)

const sheet = register(
  key,
  entriesForChar(data_gen),
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPerfectPitch',
      4,
      { ...baseTag, attribute: 'ether' },
      'atk',
      undefined,
      m6_perfectPitch_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'Ultimate100Energy',
      0,
      { ...baseTag, attribute: 'ether' },
      'atk',
      undefined,
      m6_ult_dmg_
    )
  ),
  registerBuff(
    'core_anomProf',
    ownBuff.combat.anomProf.add(subscript(char.core, dm.core.anomProf))
  ),
  registerBuff(
    'm1_abloom',
    ownBuff.combat.crit_.add(
      cmpGE(
        char.mindscape,
        1,
        sum(
          constant(dm.m1.abloomCrit),
          max(
            0,
            prod(
              max(0, sum(own.initial.anomMas, -dm.m1.anomMasteryThreshold)),
              percent(dm.m1.critPerExcessMastery)
            )
          )
        )
      )
    ),
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm1_abloom_crit_dmg',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 1, constant(dm.m1.abloomCritDmg))
    ),
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm2_defIgn',
    ownBuff.combat.defIgn_.add(
      cmpGE(
        char.mindscape,
        2,
        sum(
          constant(dm.m2.defIgn),
          boolConditional.ifOn(constant(dm.m2.delusionDefIgn))
        )
      )
    )
  ),
  registerBuff(
    'm6_enhanced_dmg',
    ownBuff.combat.dmg_.ether.add(
      cmpGE(char.mindscape, 6, boolConditional.ifOn(percent(dm.m6.enhancedDmg)))
    ),
    undefined,
    undefined,
    false
  )
)

export default sheet
