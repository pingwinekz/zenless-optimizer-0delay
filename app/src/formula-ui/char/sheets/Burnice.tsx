import type { CharacterKey } from '../../../consts'
import { Burnice } from '../../../formula'
import { mappedStats } from '../../../stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Burnice'
const [, ch] = trans('char', key)
const cond = Burnice.conditionals
const buff = Burnice.buffs
const formula = Burnice.formulas
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      EXSpecialAttackIntenseHeatTossingMethod: [
        {
          type: 'conditional',
          conditional: {
            label: ch('abloom'),
            description:
              'While in the Abloom state from EX Special Attack, Burnice increases Anomaly Multiplier for all elements.',
            metadata: cond.abloom,
            fields: [
              fieldForBuff(buff.exSpecial_ether_anom_mv_mult_),
              fieldForBuff(buff.exSpecial_electric_anom_mv_mult_),
              fieldForBuff(buff.exSpecial_fire_anom_mv_mult_),
              fieldForBuff(buff.exSpecial_physical_anom_mv_mult_),
              fieldForBuff(buff.exSpecial_ice_anom_mv_mult_),
            ],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_afterburn_dmg'),
          fieldRef: formula.core_afterburn_dmg.tag,
        },
        {
          title: ch('core_afterburn_anomBuildup'),
          fieldRef: formula.core_afterburn_anomBuildup.tag,
        },

        {
          title: ch('core_afterburn_dmg_'),
          fieldRef: buff.core_afterburn_dmg_.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_fire_anomBuildup_)],
    },
  ],
  potential: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.potential_anomMas),
        fieldForBuff(buff.potential_common_dmg_),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        // Not sure about this one
        {
          title: ch('m1_afterburn_mv_mult'),
          fieldValue: dm.m1.afterburn_dmg * 100,
          unit: '%',
        },
        {
          title: ch('m1_afterburn_anomBuildup'),
          fieldRef: buff.m1_afterburn_fire_anomBuildup_.tag,
        },
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        description:
          'When triggering the Afterburn effect, Burnice gains increased PEN Ratio.',
        metadata: cond.thermal_penetration,
        fields: [fieldForBuff(buff.m2_pen_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_exSpecial_crit_'),
          fieldRef: buff.m4_exSpecial_crit_.tag,
        },
        {
          title: ch('m4_assistSkill_crit_'),
          fieldRef: buff.m4_assistSkill_crit_.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_additional_afterburn_dmg'),
          fieldRef: formula.m6_additional_afterburn_dmg.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description:
          'After hitting an enemy with EX Special Attack Double Shot, Burnice ignores a portion of enemy Fire RES.',
        metadata: cond.exSpecial_active,
        fields: [
          fieldForBuff(buff.m6_burn_fire_resIgn_),
          {
            title: ch('m6_fire_resIgn'),
            fieldRef: buff.m6_fire_resIgn_.tag,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6CondBurn'),
        description:
          'When Additional Burn is active, Burnice increases her Fire Anomaly Multiplier.',
        metadata: cond.additional_burn,
        fields: [fieldForBuff(buff.m6_fire_anom_mv_mult_)],
      },
    },
  ],
})

export default sheet
