import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Pyrois } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { CoreGameDesc, createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Pyrois'
const [, ch] = trans('char', key)
const cond = Pyrois.conditionals
const buff = Pyrois.buffs
const formula = Pyrois.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('mirageCond'),
        description: <CoreGameDesc characterKey={key} paragraph={2} />,
        metadata: cond.mirage,
        fields: [fieldForBuff(buff.mirage_ult_crit_dmg_)],
      },
    },
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
    {
      type: 'conditional',
      conditional: {
        label: ch('contaminationCond'),
        description: <CoreGameDesc characterKey={key} paragraph={4} />,
        metadata: cond.contamination,
        fields: [
          {
            title: ch('contaminationDmg'),
            fieldRef: formula.core_contamination_dmg.tag,
          },
        ],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('eternalImprisonmentDmg'),
          fieldRef: formula.core_eternalImprisonment_dmg.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_crit_dmg_)],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_crit_)],
    },
  ],
})

export default sheet
