import { ColorText } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { NangongYu } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'
import { getVariant } from '../util'

const key: CharacterKey = 'NangongYu'
const [, ch] = trans('char', key)
const buff = NangongYu.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_anomProf),
        fieldForBuff(buff.core_impact),
        fieldForBuff(buff.core_anomBuildup_),
        fieldForBuff(buff.core_daze_),
        fieldForBuff(buff.core_squad_dmg_),
      ],
    },
  ],
  ability: [],
  m1: [
    {
      type: 'fields',
      fields: [{ title: ch('m1_resIgn_'), fieldRef: buff.m1_resIgn_.tag }],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_anomProf),
        {
          title: (
            <ColorText color={getVariant(buff.m4_basicAnomalyBuildup_.tag)}>
              {ch('m4_basicAnomalyBuildup_')}
            </ColorText>
          ),
          fieldRef: buff.m4_basicAnomalyBuildup_.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_daze_)],
    },
  ],
})

export default sheet
