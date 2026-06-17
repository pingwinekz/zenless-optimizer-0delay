import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Velina'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

// Conditionals
const { windbite_consumed, chromatic_tint, wind_anomaly } =
  allBoolConditionals(key)

// Ability check: party has another Anomaly character or shares same attribute (Wind)
const ability_check = (a: number | NumNode) =>
  cmpGE(
    sum(team.common.count.withSpecialty('anomaly'), team.common.count.wind),
    3,
    a
  )

// Core Passive: Breeze in Bloom — ER scaling
// ER > 1.2, each 0.01 → +0.21% DMG (max 35%), +0.5 Anomaly Mastery (max 84)
const core_common_dmg_ = ownBuff.combat.common_dmg_.add(
  min(
    percent(dm.core.maxDmg),
    prod(
      max(0, sum(own.initial.enerRegen, -dm.core.erThreshold)),
      percent(dm.core.dmgPerStep / dm.core.erStep)
    )
  )
)
const core_anomMas = ownBuff.combat.anomMas.add(
  min(
    dm.core.maxAnomMas,
    prod(
      max(0, sum(own.initial.enerRegen, -dm.core.erThreshold)),
      dm.core.anomMasPerStep / dm.core.erStep
    )
  )
)

// Core Passive: Windbite — boosted Vortex DMG multiplier (core-scaled, 90-150%)
const core_windbite_vortex_anom_mv_mult_ =
  ownBuff.combat.anom_mv_mult_.addWithDmgType(
    'vortex',
    windbite_consumed.ifOn(
      percent(subscript(char.core, dm.core.condensedCycloneVortexDmg))
    )
  )

// Core Passive: Cyclone explosion Abloom DMG multipliers (core-scaled)
// Condensed Cyclone Abloom: 85-145%
const core_condensedCyclone_abloom_ =
  ownBuff.combat.anom_mv_mult_.wind.addWithDmgType(
    'abloom',
    wind_anomaly.ifOn(
      percent(subscript(char.core, dm.core.condensedCycloneAbloom))
    )
  )
// Sweeping Cyclone Abloom: 135-255%
const core_sweepingCyclone_abloom_ =
  ownBuff.combat.anom_mv_mult_.wind.addWithDmgType(
    'abloom',
    wind_anomaly.ifOn(
      percent(subscript(char.core, dm.core.sweepingCycloneAbloom))
    )
  )

// Core Passive: Sweeping Cyclone — reduces Wind Anomaly Buildup RES by 7%
const core_wind_anomBuildupRes_ = enemyDebuff.common.anomBuildupRes_.wind.add(
  dm.core.windAnomResRed_
)

// Core Passive: Chromatic Tint — reduces Attribute Anomaly Buildup RES by 7%
const core_chromatic_anomBuildupRes_ =
  enemyDebuff.common.anomBuildupRes_.wind.add(
    chromatic_tint.ifOn(dm.core.chromaticAnomResRed_)
  )

// Additional Ability: Tea Party Etiquette
// Windswept DMG +10% (as damageType bonus, not attribute-based)
const ability_wind_dmg_ = ownBuff.combat.dmg_.windswept.map((r) =>
  r.add(ability_check(percent(dm.ability.windsweptVortexDmg_)))
)
// Vortex DMG +10%
const ability_vortex_dmg_ = ownBuff.combat.dmg_.vortex.map((r) =>
  r.add(ability_check(percent(dm.ability.windsweptVortexDmg_)))
)
// Ult triggers Abloom DMG at 680% against Wind Anomaly enemies
const ability_ult_abloom_anom_mv_mult_ =
  ownBuff.combat.anom_mv_mult_.wind.addWithDmgType(
    'abloom',
    ability_check(wind_anomaly.ifOn(percent(dm.ability.ultAbloomDmg)))
  )
// Chromatic Tint AnomBuildup RES reduction +7%
const ability_anomBuildupRes_ = enemyDebuff.common.anomBuildupRes_.wind.add(
  ability_check(dm.ability.anomResRed_)
)
// Daze inflicted +30%
const ability_dazeInc_ = ownBuff.combat.dazeInc_.add(
  ability_check(percent(dm.ability.daze_))
)
// Accumulated Anomaly Buildup +15%
const ability_anomBuildup_ = ownBuff.combat.anomBuildup_.wind.add(
  ability_check(percent(dm.ability.anomBuildup_))
)

// M1: Windswept Wind RES Ignore 20%, All-Attribute RES Ignore 20%
const m1_wind_resIgn_ = ownBuff.combat.resIgn_.wind.add(
  cmpGE(char.mindscape, 1, percent(dm.m1.windResIgn_))
)
const m1_all_resIgn_ = ownBuff.combat.resIgn_.add(
  cmpGE(char.mindscape, 1, percent(dm.m1.allResIgn_))
)

// M2: Windswept DMG +15% (as damageType bonus, not attribute-based)
const m2_wind_dmg_ = ownBuff.combat.dmg_.windswept.map((r) =>
  r.add(cmpGE(char.mindscape, 2, percent(dm.m2.windsweptVortexDmg_)))
)
// Vortex DMG +15%
const m2_vortex_dmg_ = ownBuff.combat.dmg_.vortex.map((r) =>
  r.add(cmpGE(char.mindscape, 2, percent(dm.m2.windsweptVortexDmg_)))
)

// M4: EX Special Attack → ATK +15%
const m4_atk_ = ownBuff.combat.atk_.add(cmpGE(char.mindscape, 4, dm.m4.atk_))

// M6: Wind Anomaly Buildup +20% when enemy suffering Wind Anomaly
const m6_wind_anomBuildup_ = ownBuff.combat.anomBuildup_.wind.add(
  cmpGE(char.mindscape, 6, wind_anomaly.ifOn(percent(dm.m6.windAnomBuildup_)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  // Buffs
  registerBuff('core_common_dmg_', core_common_dmg_),
  registerBuff('core_anomMas', core_anomMas),
  registerBuff(
    'core_windbite_vortex_anom_mv_mult_',
    core_windbite_vortex_anom_mv_mult_
  ),
  registerBuff('core_condensedCyclone_abloom_', core_condensedCyclone_abloom_),
  registerBuff('core_sweepingCyclone_abloom_', core_sweepingCyclone_abloom_),
  registerBuff('core_wind_anomBuildupRes_', core_wind_anomBuildupRes_),
  registerBuff(
    'core_chromatic_anomBuildupRes_',
    core_chromatic_anomBuildupRes_
  ),
  registerBuff('ability_wind_dmg_', ability_wind_dmg_),
  registerBuff('ability_vortex_dmg_', ability_vortex_dmg_),
  registerBuff(
    'ability_ult_abloom_anom_mv_mult_',
    ability_ult_abloom_anom_mv_mult_
  ),
  registerBuff('ability_anomBuildupRes_', ability_anomBuildupRes_),
  registerBuff('ability_dazeInc_', ability_dazeInc_),
  registerBuff('ability_anomBuildup_', ability_anomBuildup_),
  registerBuff('m1_wind_resIgn_', m1_wind_resIgn_),
  registerBuff('m1_all_resIgn_', m1_all_resIgn_),
  registerBuff('m2_wind_dmg_', m2_wind_dmg_),
  registerBuff('m2_vortex_dmg_', m2_vortex_dmg_),
  registerBuff('m4_atk_', m4_atk_),
  registerBuff('m6_wind_anomBuildup_', m6_wind_anomBuildup_)
)
export default sheet
