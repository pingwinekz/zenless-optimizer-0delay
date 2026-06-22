import type { CharacterKey } from '../../../consts'
import { Yuzuha } from '../../../formula'
import { mappedStats } from '../../../stats'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Yuzuha'
const [, ch] = trans('char', key)
const cond = Yuzuha.conditionals
const buff = Yuzuha.buffs
const formula = Yuzuha.formulas
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          'When Tanuki Wish is active, ATK and common DMG are increased.',
        metadata: cond.tanuki_wish,
        fields: [
          fieldForBuff(buff.core_atk),
          fieldForBuff(buff.core_common_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        description:
          'When Tanuki Wish is active, Anomaly Buildup and Anomaly DMG are increased.',
        metadata: cond.tanuki_wish,
        fields: [
          fieldForBuff(buff.ability_anomBuildup_),
          fieldForBuff(buff.ability_anomaly_buff_),
          fieldForBuff(buff.ability_disorder_buff_),
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        description: 'Enemies in Sweet Scare state have reduced RES.',
        metadata: cond.sweet_scare,
        fields: [fieldForBuff(buff.m1_resRed_)],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('m1_buffInc_'),
          fieldValue: dm.m1.buffInc_ * 100,
          unit: '%',
        },
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponHit.2', {
          val1: '$t(skills.exSpecial)',
          val2: '$t(skills.ult)',
        }),
        description:
          'Upon hitting with EX Special Attack or Ultimate, common DMG and Anomaly Buildup are increased.',
        metadata: cond.exSpecial_ult_hit,
        fields: [
          fieldForBuff(buff.m2_common_dmg_),
          fieldForBuff(buff.m2_anomBuildup_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_assistFollowUp_dmg_),
        fieldForBuff(buff.m4_assistFollowUp_anomBuildup_),
      ],
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
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description:
          'When Powerful Shells hit, additional disorder DMG is dealt.',
        metadata: cond.powerful_shell_hits,
        fields: [fieldForBuff(buff.m6_addl_disorder_)],
      },
    },
  ],
})

export default sheet
