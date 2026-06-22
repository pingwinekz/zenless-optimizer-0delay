import type { CharacterKey } from '../../../consts'
import { OrphieMagus } from '../../../formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'OrphieMagus'
const [, ch] = trans('char', key)
const cond = OrphieMagus.conditionals
const buff = OrphieMagus.buffs
const formula = OrphieMagus.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_crit_),
        fieldForBuff(buff.core_aftershock_dmg_),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description: 'OrphieMagus gains bonus ATK while Zeroed In on a target.',
        metadata: cond.zeroedIn,
        fields: [fieldForBuff(buff.core_atk)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          "Aftershocks ignore a portion of the target's DEF while OrphieMagus is Zeroed In.",
        metadata: cond.zeroedIn,
        fields: [fieldForBuff(buff.ability_aftershock_defIgn_)],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_fire_resIgn_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          "Increases OrphieMagus's damage against the Zeroed In target.",
        metadata: cond.zeroedIn,
        fields: [fieldForBuff(buff.m1_common_dmg_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.ult)' }),
        description: 'Increases ATK after using an Ultimate.',
        metadata: cond.ultUsed,
        fields: [fieldForBuff(buff.m2_atk_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_common_dmg_)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.m6_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
