import type { CharacterKey } from '../../../consts'
import { Ellen } from '../../../formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Ellen'
const [, ch] = trans('char', key)
const cond = Ellen.conditionals
const buff = Ellen.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_basic_crit_dmg_),
        fieldForBuff(buff.core_dash_crit_dmg_),
        fieldForBuff(buff.core_chain_crit_dmg_),
        fieldForBuff(buff.core_ult_crit_dmg_),
      ],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: st('dealsDamage', { val1: '$t(attributes.ice)' }),
        description: 'Increases Ice DMG dealt by Ellen.',
        metadata: cond.ice_attacks,
        fields: [
          fieldForBuff(buff.ability_ice_dmg_),
          fieldForBuff(buff.ability_crit_dmg_),
          fieldForBuff(buff.ability_ice_resIgn_),
        ],
      },
    },
  ],
  potential: [
    {
      type: 'conditional',
      conditional: {
        label: st('dealsDamage', { val1: '$t(attributes.ice)' }),
        metadata: cond.ice_attacks,
        fields: [
          fieldForBuff(buff.ability_crit_dmg_),
          fieldForBuff(buff.ability_ice_resIgn_),
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        description:
          'Increases CRIT Rate for each Flash Freeze Charge consumed.',
        metadata: cond.flash_freeze_consumed,
        fields: [fieldForBuff(buff.m1_crit_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        description:
          'Increases EX Special Attack CRIT DMG based on Flash Freeze Charge.',
        metadata: cond.flash_freeze,
        fields: [fieldForBuff(buff.m2_exSpecial_crit_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description:
          'Increases PEN Ratio after using EX Special Attack, Chain Attack, or gaining Quick Charge.',
        metadata: cond.exSpecial_chain_quickCharge,
        fields: [fieldForBuff(buff.m6_pen_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond2'),
        description:
          'Increases dash attack motion value when all Feast Begins stacks are consumed.',
        metadata: cond.feast_begins,
        fields: [fieldForBuff(buff.m6_dash_mv_mult_)],
      },
    },
  ],
})

export default sheet
