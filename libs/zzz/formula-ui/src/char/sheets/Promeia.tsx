import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Promeia } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Promeia'
const [, ch] = trans('char', key)
const buff = Promeia.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_anomProf),
        {
          title: ch('core_abloomDmg'),
          fieldRef: buff.core_abloomDmg.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_iceAnomBuildup)],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_anomProf)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_resIgn_)],
    },
  ],
})

export default sheet
