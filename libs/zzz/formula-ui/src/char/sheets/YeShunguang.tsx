import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { YeShunguang } from '@genshin-optimizer/zzz/formula'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'YeShunguang'
const cond = YeShunguang.conditionals
const buff = YeShunguang.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: 'Unity',
        metadata: cond.unity,
        fields: [fieldForBuff(buff.core_crit_), fieldForBuff(buff.core_dmg_)],
      },
    },
  ],
})

export default sheet
