import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Sunna } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Sunna'
const [, ch] = trans('char', key)
const cond = Sunna.conditionals
const buff = Sunna.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.boolConditional,
        fields: [fieldForBuff(buff.core_atk)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('delusionReprise'),
        metadata: cond.delusionReprise,
        fields: [fieldForBuff(buff.ability_stun_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.etherVeil,
        fields: [fieldForBuff(buff.m2_etherVeil_atk)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.ult)' }),
        metadata: cond.ult_used,
        fields: [fieldForBuff(buff.m4_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.focusedCreation,
        fields: [fieldForBuff(buff.m6_crit_), fieldForBuff(buff.m6_crit_dmg_)],
      },
    },
  ],
})

export default sheet
