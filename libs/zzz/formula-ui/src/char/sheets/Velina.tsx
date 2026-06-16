import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Velina } from '@genshin-optimizer/zzz/formula'
import { GameDesc } from '@genshin-optimizer/zzz/i18n'
import { trans } from '../../util'
import { CoreGameDesc, createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Velina'
const [, ch] = trans('char', key)
const cond = Velina.conditionals
const buff = Velina.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_common_dmg_),
        fieldForBuff(buff.core_anomMas),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('windbiteCond'),
        description: <CoreGameDesc characterKey={key} paragraph={2} />,
        metadata: cond.windbite_consumed,
        fields: [fieldForBuff(buff.core_windbite_vortex_anom_mv_mult_)],
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_wind_anomBuildupRes_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('chromaticTintCond'),
        description: <CoreGameDesc characterKey={key} paragraph={3} />,
        metadata: cond.chromatic_tint,
        fields: [fieldForBuff(buff.core_chromatic_anomBuildupRes_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('windAnomalyCond'),
        description: <CoreGameDesc characterKey={key} paragraph={5} />,
        metadata: cond.wind_anomaly,
        fields: [
          fieldForBuff(buff.core_condensedCyclone_abloom_),
          fieldForBuff(buff.core_sweepingCyclone_abloom_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('ultAbloomCond'),
        description: <GameDesc ns="char_Velina_gen" key18="ability.desc" />,
        metadata: cond.wind_anomaly,
        fields: [fieldForBuff(buff.ability_ult_abloom_anom_mv_mult_)],
      },
    },
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_wind_dmg_),
        fieldForBuff(buff.ability_vortex_dmg_),
        fieldForBuff(buff.ability_anomBuildupRes_),
        fieldForBuff(buff.ability_dazeInc_),
        fieldForBuff(buff.ability_anomBuildup_),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m1_wind_resIgn_),
        fieldForBuff(buff.m1_all_resIgn_),
      ],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m2_wind_dmg_),
        fieldForBuff(buff.m2_vortex_dmg_),
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_atk_)],
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description: (
          <GameDesc ns="char_Velina_gen" key18="mindscapes.6.desc" />
        ),
        metadata: cond.wind_anomaly,
        fields: [fieldForBuff(buff.m6_wind_anomBuildup_)],
      },
    },
  ],
})

export default sheet
