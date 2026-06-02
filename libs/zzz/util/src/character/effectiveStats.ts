import type {
  CharacterKey,
  DiscMainStatKey,
  DiscSlotKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'

type CharacterPlan = {
  effectiveStats: DiscSubStatKey[]
  substatWeights: Partial<Record<DiscSubStatKey, number>>
  mainStats: Partial<Record<DiscSlotKey, DiscMainStatKey[]>>
}

/* ───────── Archetype templates ───────── */
// Each character explicitly maps to one of these. This keeps the data
// maintainable while still being per-character rather than per-specialty.

const DPS_EFFECTIVE: DiscSubStatKey[] = ['atk_', 'crit_', 'crit_dmg_', 'atk', 'pen']
const DPS_WEIGHTS: Partial<Record<DiscSubStatKey, number>> = {
  crit_: 1.5,
  crit_dmg_: 1.5,
  atk_: 1.2,
  pen: 1.2,
  atk: 1.0,
}
const DPS_MAIN: Partial<Record<DiscSlotKey, DiscMainStatKey[]>> = {
  4: ['crit_', 'crit_dmg_', 'atk_'],
  5: [
    'atk_',
    'pen_',
    'electric_dmg_',
    'fire_dmg_',
    'ice_dmg_',
    'physical_dmg_',
    'ether_dmg_',
  ],
  6: ['atk_', 'enerRegen_'],
}

const DPS: CharacterPlan = {
  effectiveStats: DPS_EFFECTIVE,
  substatWeights: DPS_WEIGHTS,
  mainStats: DPS_MAIN,
}

const ANOMALY_EFFECTIVE: DiscSubStatKey[] = ['anomProf', 'atk_', 'pen', 'atk']
const ANOMALY_WEIGHTS: Partial<Record<DiscSubStatKey, number>> = {
  anomProf: 1.5,
  atk_: 1.2,
  pen: 1.2,
  atk: 1.0,
}
const ANOMALY_MAIN: Partial<Record<DiscSlotKey, DiscMainStatKey[]>> = {
  4: ['anomProf', 'atk_'],
  5: [
    'atk_',
    'pen_',
    'electric_dmg_',
    'fire_dmg_',
    'ice_dmg_',
    'physical_dmg_',
    'ether_dmg_',
  ],
  6: ['anomMas_', 'atk_'],
}

const ANOMALY: CharacterPlan = {
  effectiveStats: ANOMALY_EFFECTIVE,
  substatWeights: ANOMALY_WEIGHTS,
  mainStats: ANOMALY_MAIN,
}

const STUN: CharacterPlan = {
  effectiveStats: ['atk_', 'crit_', 'crit_dmg_', 'atk', 'pen'],
  substatWeights: {
    crit_: 1.5,
    crit_dmg_: 1.5,
    atk_: 1.2,
    pen: 1.2,
    atk: 1.0,
  },
  mainStats: {
    4: ['crit_', 'crit_dmg_', 'atk_'],
    5: [
      'atk_',
      'pen_',
      'electric_dmg_',
      'fire_dmg_',
      'ice_dmg_',
      'physical_dmg_',
      'ether_dmg_',
    ],
    6: ['impact_', 'atk_'],
  },
}

const SUPPORT_EFFECTIVE: DiscSubStatKey[] = ['atk_', 'hp_', 'atk', 'def_']
const SUPPORT_WEIGHTS: Partial<Record<DiscSubStatKey, number>> = {
  atk_: 1.2,
  hp_: 1.2,
  atk: 1.0,
  def_: 1.0,
}
const SUPPORT_MAIN: Partial<Record<DiscSlotKey, DiscMainStatKey[]>> = {
  4: ['atk_', 'hp_'],
  5: ['atk_', 'hp_', 'pen_'],
  6: ['enerRegen_', 'atk_'],
}

const SUPPORT: CharacterPlan = {
  effectiveStats: SUPPORT_EFFECTIVE,
  substatWeights: SUPPORT_WEIGHTS,
  mainStats: SUPPORT_MAIN,
}

const DEFENSE_EFFECTIVE: DiscSubStatKey[] = [
  'def_',
  'atk_',
  'crit_',
  'crit_dmg_',
  'def',
  'atk',
]
const DEFENSE_WEIGHTS: Partial<Record<DiscSubStatKey, number>> = {
  def_: 1.3,
  atk_: 1.2,
  crit_: 1.5,
  crit_dmg_: 1.5,
  def: 1.0,
  atk: 1.0,
  hp_: 1.0,
}
const DEFENSE_MAIN: Partial<Record<DiscSlotKey, DiscMainStatKey[]>> = {
  4: ['def_', 'crit_', 'crit_dmg_'],
  5: ['def_', 'atk_'],
  6: ['def_', 'impact_'],
}

const DEFENSE: CharacterPlan = {
  effectiveStats: DEFENSE_EFFECTIVE,
  substatWeights: DEFENSE_WEIGHTS,
  mainStats: DEFENSE_MAIN,
}

const RUPTURE_EFFECTIVE: DiscSubStatKey[] = ['anomProf', 'atk_', 'pen', 'atk']
const RUPTURE_WEIGHTS: Partial<Record<DiscSubStatKey, number>> = {
  anomProf: 1.5,
  atk_: 1.2,
  pen: 1.2,
  atk: 1.0,
}
const RUPTURE_MAIN: Partial<Record<DiscSlotKey, DiscMainStatKey[]>> = {
  4: ['anomProf', 'atk_'],
  5: [
    'atk_',
    'pen_',
    'electric_dmg_',
    'fire_dmg_',
    'ice_dmg_',
    'physical_dmg_',
    'ether_dmg_',
  ],
  6: ['anomMas_', 'atk_'],
}

const RUPTURE: CharacterPlan = {
  effectiveStats: RUPTURE_EFFECTIVE,
  substatWeights: RUPTURE_WEIGHTS,
  mainStats: RUPTURE_MAIN,
}

/* ─────── Per-character plans ─────── */

const characterPlans: Record<CharacterKey, CharacterPlan> = {
  // ═══ Attack characters ═══
  Anton: DPS,
  Billy: DPS,
  Cissia: DPS,
  Corin: DPS,
  Ellen: DPS,
  Evelyn: DPS,
  Harumasa: DPS,
  Hugo: DPS,
  Nekomata: DPS,
  OrphieMagus: DPS,
  Seed: DPS,
  Soldier0Anby: DPS,
  Soldier11: DPS,
  YeShunguang: DPS,
  ZhuYuan: DPS,

  // ═══ Anomaly characters ═══
  Alice: ANOMALY,
  Aria: ANOMALY,
  Burnice: ANOMALY,
  Grace: ANOMALY,
  Jane: ANOMALY,
  Piper: ANOMALY,
  Promeia: ANOMALY,
  Vivian: ANOMALY,
  Yanagi: ANOMALY,

  // Miyabi — unique "hybrid anomaly" that also wants CRIT due to anomaly CRIT mechanic
  Miyabi: {
    effectiveStats: ['anomProf', 'atk_', 'crit_', 'crit_dmg_', 'pen', 'atk'],
    substatWeights: {
      anomProf: 1.3,
      crit_: 1.5,
      crit_dmg_: 1.5,
      atk_: 1.2,
      pen: 1.2,
      atk: 1.0,
    },
    mainStats: {
      4: ['anomProf', 'crit_', 'crit_dmg_', 'atk_'],
      5: ['atk_', 'pen_', 'ice_dmg_'],
      6: ['anomMas_', 'atk_'],
    },
  },

  // ═══ Stun characters ═══
  Anby: STUN,
  Dialyn: STUN,
  JuFufu: STUN,
  Koleda: STUN,
  Lighter: STUN,
  Lycaon: STUN,
  NangongYu: STUN,
  Pulchra: STUN,
  Qingyi: STUN,
  Trigger: STUN,

  // ═══ Support characters ═══
  AstraYao: {
    effectiveStats: ['atk_', 'atk', 'hp_', 'def_'],
    substatWeights: { atk_: 1.5, atk: 1.3, hp_: 1.0, def_: 1.0 },
    mainStats: SUPPORT_MAIN,
  },
  Lucia: SUPPORT,
  Lucy: {
    effectiveStats: ['atk_', 'atk', 'hp_', 'def_'],
    substatWeights: { atk_: 1.5, atk: 1.3, hp_: 1.0, def_: 1.0 },
    mainStats: SUPPORT_MAIN,
  },
  Nicole: {
    effectiveStats: ['atk_', 'hp_', 'pen', 'atk', 'def_'],
    substatWeights: { atk_: 1.2, hp_: 1.2, pen: 1.2, atk: 1.0, def_: 1.0 },
    mainStats: SUPPORT_MAIN,
  },
  Rina: {
    effectiveStats: ['pen', 'atk_', 'atk', 'hp_'],
    substatWeights: { pen: 1.5, atk_: 1.2, atk: 1.0, hp_: 1.0 },
    mainStats: { 4: ['atk_', 'hp_'], 5: ['pen_', 'atk_', 'hp_'], 6: ['enerRegen_', 'atk_'] },
  },
  Soukaku: {
    effectiveStats: ['atk_', 'atk', 'hp_', 'def_'],
    substatWeights: { atk_: 1.5, atk: 1.3, hp_: 1.0, def_: 1.0 },
    mainStats: SUPPORT_MAIN,
  },
  Sunna: SUPPORT,
  Yuzuha: SUPPORT,

  // ═══ Defense characters ═══
  Ben: DEFENSE,
  PanYinhu: DEFENSE,

  // Caesar — support-oriented shield tank
  Caesar: {
    effectiveStats: ['hp_', 'atk_', 'def_', 'atk', 'def'],
    substatWeights: { hp_: 1.3, atk_: 1.2, def_: 1.2, atk: 1.0, def: 1.0 },
    mainStats: { 4: ['hp_', 'def_', 'atk_'], 5: ['hp_', 'def_', 'atk_'], 6: ['def_', 'impact_'] },
  },

  // Seth — AP-scaling shield
  Seth: {
    effectiveStats: ['anomProf', 'atk_', 'hp_', 'atk'],
    substatWeights: { anomProf: 1.5, atk_: 1.2, hp_: 1.2, atk: 1.0 },
    mainStats: { 4: ['anomProf', 'hp_', 'atk_'], 5: ['hp_', 'atk_', 'def_'], 6: ['enerRegen_', 'atk_'] },
  },
  Zhao: DEFENSE,

  // ═══ Rupture characters ═══
  Banyue: RUPTURE,
  Manato: RUPTURE,
  StarlightBilly: RUPTURE,
  Yidhari: RUPTURE,
  Yixuan: RUPTURE,
}

/* ─────── Public getters ─────── */

export function getCharacterEffectiveStats(
  charKey: CharacterKey
): DiscSubStatKey[] {
  return characterPlans[charKey]?.effectiveStats ?? DPS.effectiveStats
}

export function getCharacterSubstatWeights(
  charKey: CharacterKey
): Partial<Record<DiscSubStatKey, number>> {
  return characterPlans[charKey]?.substatWeights ?? DPS.substatWeights
}

export function getCharacterEffectiveMainStats(
  charKey: CharacterKey
): Partial<Record<DiscSlotKey, DiscMainStatKey[]>> {
  return characterPlans[charKey]?.mainStats ?? DPS.mainStats
}

export function getAllCharacterEffectiveStats(): Record<
  CharacterKey,
  DiscSubStatKey[]
> {
  return Object.fromEntries(
    Object.keys(characterPlans).map((ck) => [
      ck as CharacterKey,
      getCharacterEffectiveStats(ck as CharacterKey),
    ])
  ) as Record<CharacterKey, DiscSubStatKey[]>
}

export function getAllCharacterEffectiveMainStats(): Record<
  CharacterKey,
  Partial<Record<DiscSlotKey, DiscMainStatKey[]>>
> {
  return Object.fromEntries(
    Object.keys(characterPlans).map((ck) => [
      ck as CharacterKey,
      getCharacterEffectiveMainStats(ck as CharacterKey),
    ])
  ) as Record<
    CharacterKey,
    Partial<Record<DiscSlotKey, DiscMainStatKey[]>>
  >
}

export function getAllCharacterSubstatWeights(): Record<
  CharacterKey,
  Partial<Record<DiscSubStatKey, number>>
> {
  return Object.fromEntries(
    Object.keys(characterPlans).map((ck) => [
      ck as CharacterKey,
      getCharacterSubstatWeights(ck as CharacterKey),
    ])
  ) as Record<CharacterKey, Partial<Record<DiscSubStatKey, number>>>
}
