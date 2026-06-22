import { ColorText } from '@zenless-optimizer/common/ui'
import type { CharacterKey } from '../../../consts'
import { Cissia } from '../../../formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'
import { getVariant } from '../util'

const key: CharacterKey = 'Cissia'
const [, ch] = trans('char', key)
const cond = Cissia.conditionals
const buff = Cissia.buffs

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    chain: {
      UltimateOphidiophobia: [
        {
          type: 'conditional',
          conditional: {
            label: ch('etherVeil'),
            description:
              'When Cissia enters Ether Veil: Cold-Blooded, the entire squad gains bonus CRIT DMG.',
            metadata: cond.etherVeil,
            fields: [fieldForBuff(buff.core_etherVeil_crit_dmg_)],
          },
        },
      ],
    },
    basic: {
      CorrodeBone: [
        {
          type: 'conditional',
          conditional: {
            label: ch('corrodeBone_crit_stacks'),
            description:
              'Increases CRIT Rate against enemies for each stack of Corrode Bone.',
            metadata: cond.corrodeBone_crit_stacks,
            fields: [fieldForBuff(buff.core_corrodeBone_crit_)],
          },
        },
      ],
    },
  },
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_squad_crit_dmg_),
        fieldForBuff(buff.ability_self_crit_dmg_),
      ],
    },
  ],
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: (
            <ColorText color={getVariant(buff.core_defIgn_.tag)}>
              {ch('core_defIgn_')}
            </ColorText>
          ),
          fieldRef: buff.core_defIgn_.tag,
        },
        {
          title: (
            <ColorText color={getVariant(buff.core_corrodeBone_dmg_.tag)}>
              {ch('core_corrodeBone_dmg_')}
            </ColorText>
          ),
          fieldRef: buff.core_corrodeBone_dmg_.tag,
        },
        {
          title: (
            <ColorText color={getVariant(buff.core_corrodeBone_daze_.tag)}>
              {ch('core_corrodeBone_daze_')}
            </ColorText>
          ),
          fieldRef: buff.core_corrodeBone_daze_.tag,
        },
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        {
          title: (
            <ColorText color={getVariant(buff.m1_electric_resIgn_.tag)}>
              {ch('m1_electric_resIgn')}
            </ColorText>
          ),
          fieldRef: buff.m1_electric_resIgn_.tag,
        },
        {
          title: (
            <ColorText color={getVariant(buff.m1_corrodeBone_resIgn_.tag)}>
              {ch('m1_corrodeBone_resIgn_')}
            </ColorText>
          ),
          fieldRef: buff.m1_corrodeBone_resIgn_.tag,
        },
      ],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: (
            <ColorText color={getVariant(buff.m2_serpentsKiss_dmg_.tag)}>
              {ch('m2_serpentsKiss_dmg_')}
            </ColorText>
          ),
          fieldRef: buff.m2_serpentsKiss_dmg_.tag,
        },
      ],
    },
  ],
})

export default sheet
