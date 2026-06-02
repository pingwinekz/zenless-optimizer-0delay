import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Harumasa } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Harumasa'
const [, ch] = trans('char', key)
const cond = Harumasa.conditionals
const buff = Harumasa.buffs
const formula = Harumasa.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_dash_crit_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          'Increases Dash Attack CRIT DMG when the attack triggers a critical hit.',
        metadata: cond.gleaming_edge,
        fields: [fieldForBuff(buff.core_dash_crit_dmg_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        description:
          'Increases DMG dealt to enemies under an Attribute Anomaly.',
        metadata: cond.enemy_anomaly,
        fields: [fieldForBuff(buff.ability_common_dmg_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        description:
          'Increases Dash Attack DMG while possessing Electro Blitz.',
        metadata: cond.electro_blitz,
        fields: [fieldForBuff(buff.m2_dash_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description:
          'Increases Electric RES Ignore and deals additional DMG after Ha-Oto no Ya hits.',
        metadata: cond.haOtoNoYa,
        fields: [
          fieldForBuff(buff.m6_electric_resIgn_),
          {
            title: st('dmg'),
            fieldRef: formula.m6_dmg.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
