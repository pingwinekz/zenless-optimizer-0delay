import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Pyrois } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { CoreGameDesc, createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Pyrois'
const [, ch] = trans('char', key)
const cond = Pyrois.conditionals
const buff = Pyrois.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('sunflareCond'),
        description: <CoreGameDesc characterKey={key} paragraph={3} />,
        metadata: cond.sunflare,
        fields: [
          fieldForBuff(buff.sunflare_enerRegen_),
          fieldForBuff(buff.sunflare_common_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        {
          title: 'AA CD buff',
          fieldRef: buff.ability_crit_dmg_.tag,
        },
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        {
          title: 'M2 CR buff',
          fieldRef: buff.m1_crit_.tag,
        },
      ],
    },
  ],
})

export default sheet
