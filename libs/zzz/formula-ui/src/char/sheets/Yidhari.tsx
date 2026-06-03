import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Yidhari } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Yidhari'
const [, ch] = trans('char', key)
const cond = Yidhari.conditionals
const buff = Yidhari.buffs
const formula = Yidhari.formulas

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    chain: {
      EtherVeilWellspring: [
        {
          type: 'conditional',
          conditional: {
            label: ch('etherVeilCond'),
            description:
              'While Ether Veil: Wellspring is active, bonus HP is gained.',
            metadata: cond.etherVeil,
            fields: [fieldForBuff(buff.etherVeil_hp_)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_hpSheerForce)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description: 'When Yidhari has missing HP, bonus common DMG is gained.',
        metadata: cond.missingHp,
        fields: [fieldForBuff(buff.core_common_dmg_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description: 'When Yidhari has missing HP, bonus CRIT DMG is gained.',
        metadata: cond.missingHp,
        fields: [fieldForBuff(buff.ability_crit_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m1_basic_ice_resIgn_),
        fieldForBuff(buff.m1_exSpecial_ice_resIgn_),
      ],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_crit_dmg_)],
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('etherVeilCond'),
        description:
          'While Ether Veil: Wellspring is active, bonus HP is gained.',
        metadata: cond.etherVeil,
        fields: [fieldForBuff(buff.m4_hp_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('eruditionCond'),
        description: 'While Erudition is active, sheer DMG is increased.',
        metadata: cond.erudition,
        fields: [fieldForBuff(buff.m6_sheer_dmg_)],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: st('heal'),
          fieldRef: formula.m6_heal.tag,
        },
      ],
    },
  ],
})

export default sheet
