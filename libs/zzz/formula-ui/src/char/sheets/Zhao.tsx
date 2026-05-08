import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Zhao } from '@genshin-optimizer/zzz/formula'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Zhao'
const cond = Zhao.conditionals
const buff = Zhao.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_crit_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: 'Ether Veil',
        metadata: cond.etherVeil,
        fields: [
          fieldForBuff(buff.core_etherVeil_hp_),
          fieldForBuff(buff.core_etherVeil_atk),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: 'Ether Veil',
        metadata: cond.etherVeil,
        fields: [fieldForBuff(buff.ability_squad_dmg_)],
      },
    },
  ],
})

export default sheet
