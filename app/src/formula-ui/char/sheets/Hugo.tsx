import type { CharacterKey } from '../../../consts'
import { Hugo } from '../../../formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Hugo'
const [, ch] = trans('char', key)
const cond = Hugo.conditionals
const buff = Hugo.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreDarkAbyssReverb'),
        description:
          'Increases CRIT Rate and CRIT DMG while in the Dark Abyss Reverb state.',
        metadata: cond.dark_abyss_reverb,
        fields: [
          fieldForBuff(buff.core_crit_),
          fieldForBuff(buff.core_crit_dmg_),
        ],
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_atk)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreStunLeft'),
        description:
          'Increases EX Special Attack and Ultimate motion value based on remaining Stun time.',
        metadata: cond.stun_left,
        fields: [
          fieldForBuff(buff.core_exSpecial_mv_mult_),
          fieldForBuff(buff.core_ult_mv_mult_),
        ],
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_exSpecial_dazeInc_)],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        description: 'Increases Chain Attack DMG against normal enemies.',
        metadata: cond.normal_enemy,
        fields: [fieldForBuff(buff.ability_chain_dmg_)],
      },
    },
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_exSpecial_dmg_),
        fieldForBuff(buff.ability_ult_dmg_),
      ],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreDarkAbyssReverb'),
        description:
          'Increases EX Special Attack and Ultimate CRIT stats while in the Dark Abyss Reverb state.',
        metadata: cond.dark_abyss_reverb,
        fields: [
          fieldForBuff(buff.m1_exSpecial_crit_),
          fieldForBuff(buff.m1_exSpecial_crit_dmg_),
          fieldForBuff(buff.m1_ult_crit_),
          fieldForBuff(buff.m1_ult_crit_dmg_),
        ],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m2_exSpecial_defIgn_),
        fieldForBuff(buff.m2_ult_defIgn_),
      ],
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        description:
          'Ignores a portion of enemy Ice RES after a Charged Shot hits.',
        metadata: cond.charged_shot_hit,
        fields: [fieldForBuff(buff.m4_ice_resIgn_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m6_exSpecial_dmg_),
        fieldForBuff(buff.m6_ult_dmg_),
        fieldForBuff(buff.m6_exSpecial_mv_mult_),
      ],
    },
  ],
})

export default sheet
