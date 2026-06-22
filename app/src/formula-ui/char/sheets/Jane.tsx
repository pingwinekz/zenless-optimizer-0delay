import type { CharacterKey } from '../../../consts'
import { Jane } from '../../../formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Jane'
const [, ch] = trans('char', key)
const cond = Jane.conditionals
const buff = Jane.buffs
const formula = Jane.formulas

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      Passion: [
        {
          type: 'conditional',
          conditional: {
            label: ch('passionCond'),
            description:
              'Boosts Anomaly Buildup and ATK while in the Passion state.',
            metadata: cond.passion,
            fields: [
              fieldForBuff(buff.passion_physical_anomBuildup_),
              fieldForBuff(buff.passion_atk),
            ],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('gnawedCond'),
        description: 'Increases CRIT Rate and CRIT DMG against Gnawed enemies.',
        metadata: cond.gnawed,
        fields: [
          fieldForBuff(buff.core_assault_crit_),
          fieldForBuff(buff.core_assault_crit_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        description:
          'Increases Physical Anomaly Buildup against enemies suffering an Attribute Anomaly.',
        metadata: cond.enemy_suffering_anomaly,
        fields: [fieldForBuff(buff.ability_physical_anomBuildup_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('passionCond'),
        description:
          'Boosts Physical Anomaly Buildup and all DMG while in the Passion state.',
        metadata: cond.passion,
        fields: [
          fieldForBuff(buff.m1_physical_anomBuildup_),
          fieldForBuff(buff.m1_common_dmg_),
        ],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('gnawedCond'),
        description:
          'Ignores enemy DEF and boosts Assault CRIT DMG against Gnawed enemies.',
        metadata: cond.gnawed,
        fields: [
          fieldForBuff(buff.m2_defIgn_),
          fieldForBuff(buff.m2_assault_defIgn_),
          fieldForBuff(buff.m2_assault_crit_dmg_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        description:
          'Increases Anomaly DMG after any squad member triggers Assault or Disorder.',
        metadata: cond.assault_or_disorder_triggered,
        fields: [fieldForBuff(buff.m4_anomaly_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('passionCond'),
        description:
          'Grants bonus CRIT Rate and CRIT DMG while in the Passion state.',
        metadata: cond.passion,
        fields: [fieldForBuff(buff.m6_crit_), fieldForBuff(buff.m6_crit_dmg_)],
      },
    },
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
