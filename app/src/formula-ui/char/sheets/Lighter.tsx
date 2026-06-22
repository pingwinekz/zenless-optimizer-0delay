import type { CharacterKey } from '../../../consts'
import { Lighter } from '../../../formula'
import { mappedStats } from '../../../stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Lighter'
const [, ch] = trans('char', key)
const cond = Lighter.conditionals
const buff = Lighter.buffs
const formula = Lighter.formulas
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.morale_consumed'),
        description: 'Increases Impact when Morale Points are consumed.',
        metadata: cond.morale_consumed,
        fields: [fieldForBuff(buff.core_impact_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.morale_burst_hit'),
        description:
          'Reduces enemy Ice and Fire RES when Morale Burst attacks hit.',
        metadata: cond.morale_burst_hit,
        fields: [
          fieldForBuff(buff.core_ice_resRed_),
          fieldForBuff(buff.core_fire_resRed_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        description: 'Increases Ice and Fire DMG based on Elation stacks.',
        metadata: cond.elation,
        fields: [
          fieldForBuff(buff.ability_ice_dmg_),
          fieldForBuff(buff.ability_fire_dmg_),
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('collapseCond'),
        description:
          'Further reduces enemy Ice and Fire RES against enemies with Collapse.',
        metadata: cond.collapse,
        fields: [
          fieldForBuff(buff.m1_ice_resRed_),
          fieldForBuff(buff.m1_fire_resRed_),
        ],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('m1_finishing_move_dmg_'),
          fieldRef: buff.m1_finishing_move_dmg_.tag,
        },
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('collapseCond'),
        description: 'Increases Daze dealt to enemies with Collapse.',
        metadata: cond.collapse,
        fields: [fieldForBuff(buff.m2_stun_)],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_elation_inc_'),
          fieldValue: dm.m2.ability_buff_inc_ * 100,
          unit: '%',
        },
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_enerRegen_)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_blazing_impact_dmg'),
          fieldRef: formula.m6_blazing_impact_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
