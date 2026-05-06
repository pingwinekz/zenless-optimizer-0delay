import { cmpGE, max, prod, sum } from '@genshin-optimizer/pando/engine'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Promeia'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const excessAnomMas = max(
  0,
  sum(own.initial.anomMas, -dm.core.anomMasThresh[0])
)

const ability_check_no_self = (node: NumNode | number) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('anomaly'),
      team.common.count.withSpecialty('support')
    ),
    2,
    node
  )

const sheet = register(
  key,
  entriesForChar(data_gen),

  ...registerAllDmgDazeAndAnom(key, dm),

  // Core Passive: Anomaly Prof from excess Anomaly Mastery
  registerBuff(
    'core_anomProf',
    ownBuff.combat.anomProf.add(
      prod(excessAnomMas, dm.core.anomProfPerExcessMas[0])
    )
  ),

  // Core Passive: Squad Abloom DMG from excess Anomaly Mastery (display only, not counted)
  registerBuff(
    'core_abloomDmg',
    teamBuff.dmg.anom_mv_mult_.add(
      prod(excessAnomMas, percent(dm.core.abloomDmgPerExcessMas[0]))
    ),
    'infer',
    true,
    false
  ),

  // Ability: Ice Anomaly Buildup (+30% when ANOTHER teammate is Anomaly or Support)
  registerBuff(
    'ability_iceAnomBuildup',
    ownBuff.combat.anomBuildup_.ice.add(
      ability_check_no_self(percent(dm.ability.selfIceAnomBuildup_))
    )
  ),

  // M2: Anomaly Prof
  registerBuff(
    'm2_anomProf',
    ownBuff.combat.anomProf.add(cmpGE(char.mindscape, 2, dm.m2.anomProf))
  ),

  // M4: Corrosive Chill restore (handled in formula via conditional)

  // M6: RES ignore (Ice only)
  registerBuff(
    'm6_resIgn_ice',
    ownBuff.combat.resIgn_.ice.add(
      cmpGE(char.mindscape, 6, percent(dm.m6.resIgnore_))
    )
  )
)
export default sheet
