import { cmpGE, max, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'NangongYu'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { inRhythm } = allBoolConditionals(key)

const impactFromMastery = max(
  0,
  sum(own.initial.anomMas, -dm.core.masteryThresh)
)

const sheet = register(
  key,
  entriesForChar(data_gen),

  ...registerAllDmgDazeAndAnom(key, dm),

  registerBuff(
    'core_anomProf',
    ownBuff.combat.anomProf.add(subscript(char.core, dm.core.anomalyProf))
  ),

  registerBuff('core_impact', ownBuff.combat.impact.add(impactFromMastery)),

  registerBuff(
    'core_daze_',
    ownBuff.combat.dazeInc_.add(
      inRhythm.ifOn(percent(subscript(char.core, dm.core.daze)))
    )
  ),

  registerBuff(
    'core_squad_dmg_',
    teamBuff.combat.common_dmg_.add(
      inRhythm.ifOn(percent(subscript(char.core, dm.core.squadDmg)))
    )
  ),

  registerBuff(
    'm1_resIgn_',
    ownBuff.combat.resIgn_.add(
      cmpGE(char.mindscape, 1, percent(dm.m1.resDecrease))
    )
  ),

  registerBuff(
    'm4_anomProf',
    ownBuff.combat.anomProf.add(cmpGE(char.mindscape, 4, dm.m4.anomalyProf))
  )
)
export default sheet
