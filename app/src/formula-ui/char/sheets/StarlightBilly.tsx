import { ColorText } from '@zenless-optimizer/common/ui'
import type { CharacterKey } from '../../../consts'
import { StarlightBilly } from '../../../formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'
import { getVariant } from '../util'

const key: CharacterKey = 'StarlightBilly'
const [, ch] = trans('char', key)
const buff = StarlightBilly.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_critDmg)],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        {
          title: (
            <ColorText color={getVariant(buff.ability_dmg_.tag)}>
              {ch('ability_dmg_')}
            </ColorText>
          ),
          fieldRef: buff.ability_dmg_.tag,
        },
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_physResIgn)],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: (
            <ColorText color={getVariant(buff.m2_dmg_.tag)}>
              {ch('m2_dmg_')}
            </ColorText>
          ),
          fieldRef: buff.m2_dmg_.tag,
        },
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_critDmg)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: (
            <ColorText color={getVariant(buff.m6_sheer_.tag)}>
              {ch('m6_sheer_')}
            </ColorText>
          ),
          fieldRef: buff.m6_sheer_.tag,
        },
      ],
    },
  ],
})

export default sheet
