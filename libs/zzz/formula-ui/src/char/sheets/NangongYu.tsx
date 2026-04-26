import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { NangongYu } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'NangongYu'
const [, ch] = trans('char', key)
const cond = NangongYu.conditionals
const buff = NangongYu.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_anomProf),
        fieldForBuff(buff.core_impact),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('inRhythm'),
        metadata: cond.inRhythm,
        fields: [
          fieldForBuff(buff.core_daze_),
          fieldForBuff(buff.core_squad_dmg_),
        ],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_resIgn_)],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_anomProf)],
    },
  ],
})

export default sheet