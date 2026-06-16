import {
  cmpGE,
  max,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  customAnomalyDmg,
  own,
  ownBuff,
  percent,
  reader,
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

// Promeia's total Anomaly Mastery = initial * (1 + combat_%) + combat_flat
// We compute final.anomMas manually instead of reading agg-level `final.anomMas`
// to avoid the sum matching ALL characters' base entries (via mask=0 wildcard).
// initial = base * (1 + initial_%) + flat_disc
const promeiaInitAnomMas = sum(
  prod(
    reader.withTag({ et: 'own', qt: 'base', q: 'anomMas', sheet: key }),
    sum(
      percent(1),
      reader.withTag({
        et: 'own',
        qt: 'initial',
        q: 'anomMas_',
        sheet: 'agg',
        src: key,
      })
    )
  ),
  // Flat anomMas from disc substats (at sheet: 'dyn', scoped to Promeia via src)
  reader.withTag({
    et: 'own',
    qt: 'initial',
    q: 'anomMas',
    sheet: 'dyn',
    src: key,
  })
)
// final = initial * (1 + combat_%) + combat_flat
const promeiaFinalAnomMas = sum(
  prod(
    promeiaInitAnomMas,
    sum(
      percent(1),
      reader.withTag({
        et: 'own',
        qt: 'combat',
        q: 'anomMas_',
        sheet: 'agg',
        src: key,
      })
    )
  ),
  reader.withTag({
    et: 'own',
    qt: 'combat',
    q: 'anomMas',
    sheet: 'agg',
    src: key,
  })
)
const excessAnomMas = max(
  0,
  sum(promeiaFinalAnomMas, -dm.core.anomMasThresh[0])
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

  // Trial by Cold: Abloom DMG triggered by EX Special - Merciless Judgment
  ...customAnomalyDmg(
    'trialByColdAbloomDmgInst',
    {
      attribute: data_gen.attribute,
      damageType1: 'anomaly',
      damageType2: 'abloom',
    },
    prod(
      percent(subscript(own.char.core, dm.core.trialConsumeToTrigger)),
      own.final.atk,
      sum(percent(1), own.final.anom_mv_mult_)
    )
  ),

  // Core Passive: Anomaly Prof from excess Anomaly Mastery
  registerBuff(
    'core_anomProf',
    ownBuff.combat.anomProf.add(
      prod(excessAnomMas, dm.core.anomProfPerExcessMas[0])
    )
  ),

  // Core Passive: Squad Abloom DMG from excess Anomaly Mastery
  registerBuff(
    'core_abloomDmg',
    teamBuff.combat.anom_mv_mult_.addWithDmgType(
      'abloom',
      prod(excessAnomMas, percent(dm.core.abloomDmgPerExcessMas[0]))
    ),
    undefined,
    true
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

  // M6: All-Attribute RES ignore for Anomaly/Disorder DMG
  // Note: No 'disorder' damage type exists, so applying to anomaly covers ice anomaly
  // Disorder is ice+other so it won't get the RES reduction - this is a limitation
  registerBuff(
    'm6_resIgn_',
    ownBuff.combat.resIgn_.addWithDmgType(
      'anomaly',
      cmpGE(char.mindscape, 6, percent(dm.m6.resIgnore_))
    )
  )
)
export default sheet
