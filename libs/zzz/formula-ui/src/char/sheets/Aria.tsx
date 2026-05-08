import { ColorText } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Aria } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'
import { getVariant } from '../util'

const key: CharacterKey = 'Aria'
const [, ch] = trans('char', key)
const cond = Aria.conditionals
const buff = Aria.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_anomProf)],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m1_abloom'),
          fieldRef: buff.m1_abloom.tag,
        },
        {
          title: ch('m1_abloom_crit_dmg'),
          fieldRef: buff.m1_abloom_crit_dmg.tag,
        },
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.boolConditional,
        fields: [fieldForBuff(buff.m2_defIgn)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.boolConditional,
        fields: [
          {
            title: (
              <ColorText color={getVariant(buff.m6_enhanced_dmg.tag)}>
                {ch('m6_enhanced_dmg')}
              </ColorText>
            ),
            fieldRef: buff.m6_enhanced_dmg.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
