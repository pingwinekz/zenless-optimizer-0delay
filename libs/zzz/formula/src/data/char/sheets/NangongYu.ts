import { cmpGE, max, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import { own, ownBuff, percent, register, registerBuff } from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'NangongYu'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const impactFromMastery = max(
  0,
  sum(own.initial.anomMas, -dm.core.masteryThresh)
)

const core_anomBuildup_ = ownBuff.combat.anomBuildup_.ether.add(
  percent(subscript(char.core, dm.core.anomalyBuildup))
)
const core_daze_ = ownBuff.combat.dazeInc_.add(
  percent(subscript(char.core, dm.core.daze))
)
const core_squad_dmg_ = ownBuff.combat.common_dmg_.add(
  percent(subscript(char.core, dm.core.squadDmg))
)

const m4_basicAnomalyBuildup_ = ownBuff.combat.anomBuildup_.ether.add(
  cmpGE(
    char.mindscape,
    4,
    percent(dm.m4.basicAdorableExplosiveImpactAnomalyBuildup)
  )
)

const m6_daze_ = ownBuff.combat.dazeInc_.add(
  cmpGE(char.mindscape, 6, percent(dm.m6.daze))
)

const allAnomBuffs = [core_anomBuildup_, core_squad_dmg_, core_daze_, m6_daze_]
const chargedAnomBuffs = [
  core_anomBuildup_,
  m4_basicAnomalyBuildup_,
  core_squad_dmg_,
  core_daze_,
  m6_daze_,
]

const sheet = register(
  key,
  entriesForChar(data_gen),

  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackShootingStarStep',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackShootingStarStep',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackShootingStarStep',
      2,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackAdorableExplosiveImpact',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...chargedAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackAdorableExplosiveImpact',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...chargedAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackAdorableExplosiveImpact',
      2,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...chargedAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackAdorableExplosiveImpact',
      3,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...chargedAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackSpinningMeteor',
      0,
      { ...baseTag, damageType1: 'dash' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DodgeCounterAsteroidWaltz',
      0,
      { ...baseTag, damageType1: 'dodgeCounter' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackTheWeightOfLove',
      0,
      { ...baseTag, damageType1: 'special' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackTheUnbearableWeightOfLove',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackCometGravity',
      0,
      { ...baseTag, damageType1: 'chain' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateMeteorShower',
      0,
      { ...baseTag, damageType1: 'ult' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'QuickAssistEmergencySave',
      0,
      { ...baseTag, damageType1: 'quickAssist' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'DefensiveAssistPerfectedChoreography',
      0,
      { ...baseTag, damageType1: 'defensiveAssist' },
      'atk',
      undefined,
      ...allAnomBuffs
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'AssistFollowUpImprovisedPerformance',
      0,
      { ...baseTag, damageType1: 'assistFollowUp' },
      'atk',
      undefined,
      ...allAnomBuffs
    )
  ),

  registerBuff(
    'core_anomProf',
    ownBuff.combat.anomProf.add(subscript(char.core, dm.core.anomalyProf))
  ),

  registerBuff('core_impact', ownBuff.combat.impact.add(impactFromMastery)),

  registerBuff(
    'core_anomBuildup_',
    core_anomBuildup_,
    undefined,
    undefined,
    false
  ),
  registerBuff('core_daze_', core_daze_, undefined, undefined, false),
  registerBuff('core_squad_dmg_', core_squad_dmg_, undefined, true, false),

  registerBuff(
    'm1_resIgn_',
    ownBuff.combat.resIgn_.add(
      cmpGE(char.mindscape, 1, percent(dm.m1.resDecrease))
    )
  ),

  registerBuff(
    'm4_anomProf',
    ownBuff.combat.anomProf.add(cmpGE(char.mindscape, 4, dm.m4.anomalyProf))
  ),
  registerBuff(
    'm4_basicAnomalyBuildup_',
    m4_basicAnomalyBuildup_,
    undefined,
    undefined,
    false
  ),

  registerBuff('m6_daze_', m6_daze_, undefined, undefined, false)
)
export default sheet
