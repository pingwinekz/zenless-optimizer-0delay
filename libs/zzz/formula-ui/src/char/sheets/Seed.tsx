import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Seed } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Seed'
const [, ch] = trans('char', key)
const cond = Seed.conditionals
const buff = Seed.buffs
const formula = Seed.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.onslaught'),
        description:
          'Seed gains bonus ATK and CRIT DMG when the Vanguard unleashes an EX Special Attack.',
        metadata: cond.onslaught,
        fields: [
          fieldForBuff(buff.core_atk),
          fieldForBuff(buff.core_crit_dmg_),
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.directStrike'),
        description:
          "Increases the Vanguard's ATK and CRIT DMG when Seed unleashes an EX Special Attack.",
        metadata: cond.directStrike,
        fields: [
          fieldForBuff(buff.core_vanguard_atk),
          fieldForBuff(buff.core_vanguard_crit_dmg_),
          fieldForBuff(buff.core_dmg_),
        ],
        targeted: true,
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_basic_dmg_),
        fieldForBuff(buff.ability_basic_electric_resIgn_),
        fieldForBuff(buff.ability_ult_dmg_),
        fieldForBuff(buff.ability_ult_electric_resIgn_),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_basic_crit_dmg_)],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.onslaught'),
        description:
          "Seed ignores a portion of the enemy's DEF while the onslaught effect is active.",
        metadata: cond.onslaught,
        fields: [fieldForBuff(buff.m2_defIgn_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.directStrikeDisplay'),
        description:
          "The Vanguard ignores a portion of the enemy's DEF when the direct strike effect is active.",
        metadata: cond.directStrikeDisplay,
        fields: [fieldForBuff(buff.m2_vanguard_defIgn_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        description:
          'Increases Basic Attack DMG for each 5 Energy consumed by EX Special Attack: Raining Iron Petals.',
        metadata: cond.energy_consumed,
        fields: [fieldForBuff(buff.m2_basic_dmg_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.onslaught'),
        description:
          'Activates additional effects while the onslaught state is active.',
        metadata: cond.onslaught,
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.directStrike'),
        description:
          'Activates additional effects on the Vanguard when the direct strike state is active.',
        metadata: cond.directStrike,
        targeted: true,
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_ult_dmg_)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m6_crit_dmg_),
        {
          title: st('dmg'),
          fieldRef: formula.m6_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
