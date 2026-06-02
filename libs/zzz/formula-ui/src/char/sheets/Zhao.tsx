import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Zhao } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Zhao'
const [, ch] = trans('char', key)
const cond = Zhao.conditionals
const buff = Zhao.buffs
const formula = Zhao.formulas
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      BasicAttackFinalVerdict: [
        {
          type: 'conditional',
          conditional: {
            label: ch('finalVerdictCond'),
            description:
              'With sufficient charge time, Final Verdict deals bonus flat DMG.',
            metadata: cond.chargeTime,
            fields: [
              fieldForBuff(buff.basic_flat_dmg),
              fieldForBuff(buff.chain_flat_dmg),
              fieldForBuff(buff.assistFollowUp_flat_dmg),
            ],
          },
        },
      ],
    },
    special: {
      SpecialAttackShatterfrostSurge: [
        {
          type: 'fields',
          fields: [{ title: st('heal'), fieldRef: formula.special_heal.tag }],
        },
      ],
      EXSpecialAttackFrostflowTundra: [
        {
          type: 'fields',
          fields: [{ title: st('heal'), fieldRef: formula.exSpecial_heal.tag }],
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_crit_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('etherVeilWellspringCond'),
        description:
          'While Ether Veil: Wellspring is active, HP and ATK are increased.',
        metadata: cond.etherVeilWellspring,
        fields: [fieldForBuff(buff.core_hp_), fieldForBuff(buff.core_atk)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        description: 'While Zhao is in Ether Veil, common DMG is increased.',
        metadata: cond.inEtherVeil,
        fields: [fieldForBuff(buff.ability_common_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: st('offField'),
        description: 'When Zhao is off-field, resistance ignore is increased.',
        metadata: cond.offField,
        fields: [fieldForBuff(buff.m1_resIgn_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        description: 'When Zhao recovers HP, ATK is increased for the team.',
        metadata: cond.recoversHp,
        fields: [fieldForBuff(buff.m2_atk_), fieldForBuff(buff.m2_team_atk_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_ult_crit_dmg_),
        fieldForBuff(buff.m4_chain_crit_dmg_),
        fieldForBuff(buff.m4_basic_crit_dmg_),
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6CoreBuff'),
          fieldValue: dm.m6.critIncrease_ * 100,
          unit: '%',
        },
        {
          title: ch('m6ChargeIncrease'),
          fieldValue: dm.m6.finalVerdictChargeIncrease_ * 100,
          unit: '%',
        },
      ],
    },
  ],
})

export default sheet
