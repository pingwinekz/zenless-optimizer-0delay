import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { StarlightBilly } from '@genshin-optimizer/zzz/formula'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'StarlightBilly'
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
      fields: [fieldForBuff(buff.ability_dmg_)],
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
      fields: [fieldForBuff(buff.m2_dmg_)],
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
      fields: [fieldForBuff(buff.m6_sheerDmg_)],
    },
  ],
})

export default sheet