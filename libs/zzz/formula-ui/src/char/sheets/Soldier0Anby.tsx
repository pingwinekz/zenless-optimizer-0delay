import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Soldier0Anby } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Soldier0Anby'
const [, ch] = trans('char', key)
const cond = Soldier0Anby.conditionals
const buff = Soldier0Anby.buffs
const formula = Soldier0Anby.formulas

const sheet = createBaseSheet(key, {
  potential: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_aftershock_dmg_)],
    },
  ],
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          'Increases common DMG and Aftershock CRIT DMG against enemies marked with Silver Star.',
        metadata: cond.markedWithSilverStar,
        fields: [
          fieldForBuff(buff.core_common_dmg_),
          fieldForBuff(buff.core_markedWithSilverStar_crit_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_crit_),
        fieldForBuff(buff.ability_aftershock_dmg_),
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          "Increases Soldier 0 Anby's CRIT Rate against enemies marked with Silver Star.",
        metadata: cond.markedWithSilverStar,
        fields: [fieldForBuff(buff.m2_crit_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          "Ignores a portion of the enemy's Electric RES when attacking enemies marked with Silver Star.",
        metadata: cond.markedWithSilverStar,
        fields: [fieldForBuff(buff.m4_electric_resIgn_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.m6_additional_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
