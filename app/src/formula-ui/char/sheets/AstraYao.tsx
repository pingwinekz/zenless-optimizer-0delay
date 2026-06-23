import type { CharacterKey } from '../../../consts'
import { AstraYao } from '../../../formula'
import { mappedStats } from '../../../stats'
import { trans } from '../../util'
import { GameDesc } from '../../../i18n'
import { CoreGameDesc, createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'AstraYao'
const [, ch] = trans('char', key)
const cond = AstraYao.conditionals
const buff = AstraYao.buffs
const formula = AstraYao.formulas
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      IdyllicCadenza: [
        {
          type: 'conditional',
          conditional: {
            label: ch('idyllic_cadenzaCond'),
            description: (
              <GameDesc
                ns="char_AstraYao_gen"
                key18="special.IdyllicCadenza.desc"
              />
            ),
            metadata: cond.idyllic_cadenza,
            fields: [
              fieldForBuff(buff.common_dmg_),
              fieldForBuff(buff.crit_dmg_),
            ],
          },
        },
      ],
    },
    chain: {
      UltimateFantasianSonata: [
        {
          type: 'fields',
          fields: [
            { title: ch('ult_heal'), fieldRef: formula.ultimate_heal.tag },
          ],
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_atk)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('idyllic_cadenzaCond'),
        description: <CoreGameDesc characterKey={key} />,
        metadata: cond.idyllic_cadenza,
        fields: [],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        description: (
          <GameDesc
            ns="char_AstraYao_gen"
            key18="mindscapes.1.desc"
          />
        ),
        metadata: cond.attack_hits,
        fields: [fieldForBuff(buff.m1_resRed_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_atkBuffInc_'),
          fieldValue: dm.m2.atk_ * 100,
          unit: '%',
        },
        {
          title: ch('m2_maxIncrease'),
          fieldValue: dm.m2.max_increase,
        },
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_attack_quickAssist_extraDmg),
        fieldForBuff(buff.m4_anomaly_quickAssist_anomBuildup_),
        fieldForBuff(buff.m4_stun_quickAssist_dazeInc_),
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_mv_mult_'),
          fieldRef: buff.m6_mv_mult_.tag,
        },
        {
          title: ch('m6_crit_'),
          fieldRef: buff.m6_crit_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description: (
          <GameDesc
            ns="char_AstraYao_gen"
            key18="mindscapes.6.desc"
          />
        ),
        metadata: cond.precise_assist_triggered,
        fields: [
          {
            title: ch('m6_capriccio_crit_'),
            fieldRef: buff.m6_capriccio_crit_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
