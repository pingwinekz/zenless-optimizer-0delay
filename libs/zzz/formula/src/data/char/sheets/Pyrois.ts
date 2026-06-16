import type { NumNode } from '@genshin-optimizer/pando/engine'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import { isStunned } from '../../common/enemy'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
} from '../../util'
import { entriesForChar, getBaseTag, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Pyrois'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

// Conditionals
const { mirage, sunflare, contamination } = allBoolConditionals(key)

// Ability check: party has a Stun or Support character
const ability_check = (a: number | NumNode) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('stun'),
      team.common.count.withSpecialty('support')
    ),
    1,
    a
  )

// Core Passive: Upper Branch — Mirage (Ult: Total Annihilation)
// Ult deals 40% increased CRIT DMG against Stunned enemies
const mirage_ult_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'ult',
  mirage.ifOn(isStunned.ifOn(percent(dm.core.mirageCritDmg_)))
)

// Core Passive: Lower Branch — Sunflare (Ult: Triumphant Return)
// Energy Generation Rate +15%, DMG dealt +20-40% (core-scaled)
const sunflare_enerRegen_ = ownBuff.initial.enerRegen_.add(
  sunflare.ifOn(dm.core.sunflareEnerRegen)
)
const sunflare_common_dmg_ = ownBuff.combat.common_dmg_.add(
  sunflare.ifOn(percent(subscript(char.core, dm.core.sunflareDmg_)))
)

// Additional Ability: Glorious Legion
// +40% CRIT DMG when Stun or Support in squad
const ability_crit_dmg_ = ownBuff.combat.crit_dmg_.add(
  ability_check(percent(dm.ability.crit_dmg_))
)

// Mindscape 1: +8% CRIT Rate on entering battle
const m1_crit_ = ownBuff.combat.crit_.add(
  cmpGE(char.mindscape, 1, percent(dm.m1.crit_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  // Core Passive: Left Branch — Unbound Swordstorm (vs Contamination)
  // Heavy attacks deal additional ATK% DMG vs Contaminated enemies
  ...customDmg(
    'core_contamination_dmg',
    { ...baseTag, damageType1: 'elemental' },
    contamination.ifOn(
      prod(own.final.atk, percent(subscript(char.core, dm.core.leftBranchAtk)))
    )
  ),

  // Core Passive: Right Branch — Eternal Imprisonment (vs Stunned)
  // Heavy attacks deal additional ATK% DMG vs Stunned enemies
  ...customDmg(
    'core_eternalImprisonment_dmg',
    { ...baseTag, damageType1: 'elemental' },
    isStunned.ifOn(
      prod(own.final.atk, percent(subscript(char.core, dm.core.rightBranchAtk)))
    )
  ),

  // Buffs
  registerBuff(
    'mirage_ult_crit_dmg_',
    mirage_ult_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'sunflare_enerRegen_',
    sunflare_enerRegen_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'sunflare_common_dmg_',
    sunflare_common_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff('ability_crit_dmg_', ability_crit_dmg_),
  registerBuff('m1_crit_', m1_crit_)
)
export default sheet
