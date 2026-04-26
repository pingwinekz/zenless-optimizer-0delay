import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Cissia } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Cissia'
const [, ch] = trans('char', key)
const cond = Cissia.conditionals
const buff = Cissia.buffs

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      CorrodeBone: [
        {
          type: 'conditional',
          conditional: {
            label: ch('corrodeBone_crit_stacks'),
            metadata: cond.corrodeBone_crit_stacks,
            fields: [fieldForBuff(buff.core_corrodeBone_crit_)],
          },
        },
      ],
    },
  },
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_squad_crit_dmg_),
        fieldForBuff(buff.ability_self_crit_dmg_),
      ],
    },
  ],
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_defIgn_),
        fieldForBuff(buff.core_corrodeBone_dmg_),
        fieldForBuff(buff.core_corrodeBone_daze_),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m1_electric_resIgn'),
          fieldRef: buff.m1_electric_resIgn_.tag,
        },
        {
          title: ch('m1_corrodeBone_electric_resIgn'),
          fieldRef: buff.m1_corrodeBone_electric_resIgn_.tag,
        },
      ],
    },
  ],
})

export default sheet
