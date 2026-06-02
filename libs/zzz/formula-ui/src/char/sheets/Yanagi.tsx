import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Yanagi } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Yanagi'
const [, ch] = trans('char', key)
const cond = Yanagi.conditionals
const buff = Yanagi.buffs

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      BasicAttackTsukuyomiKagura: [
        {
          type: 'conditional',
          conditional: {
            label: ch('jougenCond'),
            description:
              'While Yanagi is in Jougen stance, Electric DMG is increased.',
            metadata: cond.jougen,
            fields: [fieldForBuff(buff.basic_electric_dmg_)],
          },
        },
        {
          type: 'conditional',
          conditional: {
            label: ch('kagenCond'),
            description:
              'While Yanagi is in Kagen stance, PEN Ratio is increased.',
            metadata: cond.kagen,
            fields: [fieldForBuff(buff.basic_pen_)],
          },
        },
      ],
    },
    special: {
      EXSpecialAttackGekkaRuten: [
        {
          type: 'conditional',
          conditional: {
            label: (_, value) => ch(`polarityDisorderCond.${value}`),
            description:
              'When triggering Polarity Disorder, anomaly base DMG and flat DMG are increased.',
            metadata: cond.polarityDisorder,
            badge: (_, value) => (value === 0 ? null : value),
            fields: [
              fieldForBuff(buff.exSpecial_anom_base_),
              fieldForBuff(buff.exSpecial_anom_flat_dmg),
            ],
          },
        },
        {
          type: 'conditional',
          conditional: {
            label: ch('m2Cond'),
            description:
              'Tracks Thrust stacks used to trigger additional effects.',
            metadata: cond.thrusts,
          },
        },
      ],
    },
    chain: {
      UltimateRaieiTenge: [
        {
          type: 'conditional',
          conditional: {
            label: (_, value) => ch(`polarityDisorderCond.${value}`),
            description:
              'When triggering Polarity Disorder, anomaly base DMG and flat DMG are increased.',
            badge: (_, value) => (value === 0 ? null : value),
            metadata: cond.polarityDisorder,
            fields: [
              fieldForBuff(buff.ult_anom_base_),
              fieldForBuff(buff.ult_anom_flat_dmg),
            ],
          },
        },
        {
          type: 'conditional',
          conditional: {
            label: ch('m2Cond'),
            description:
              'Tracks Thrust stacks used to trigger additional effects.',
            metadata: cond.thrusts,
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        description:
          'Upon launching EX Special Attack, additional disorder DMG and Electric DMG are increased.',
        metadata: cond.exSpecial_used,
        fields: [
          fieldForBuff(buff.core_addl_disorder_),
          fieldForBuff(buff.core_electric_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.basic)' }),
        description:
          'Upon hitting with Basic Attack, Electric Anomaly Buildup is increased.',
        metadata: cond.basic_hit,
        fields: [fieldForBuff(buff.ability_electric_anomBuildup_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        description:
          "With one or more stacks of Clarity, Yanagi's Anomaly Proficiency is increased.",
        metadata: cond.clarity,
        fields: [fieldForBuff(buff.m1_anomProf)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_electric_anomBuildup_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        description: 'Tracks Thrust stacks used to trigger additional effects.',
        metadata: cond.thrusts,
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        description:
          'Enemies suffering from the Exposed effect have increased PEN Ratio against them.',
        metadata: cond.exposed,
        fields: [fieldForBuff(buff.m4_pen_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description:
          'While Yanagi is in Shinrabanshou state, EX Special Attack DMG is increased.',
        metadata: cond.shinrabanshou,
        fields: [fieldForBuff(buff.m6_exSpecial_dmg_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        description: 'Tracks Thrust stacks used to trigger additional effects.',
        metadata: cond.thrusts,
      },
    },
  ],
})

export default sheet
