import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Miyabi } from '@genshin-optimizer/zzz/formula'
import { GameDesc } from '@genshin-optimizer/zzz/i18n'
import { st, trans } from '../../util'
import { CoreGameDesc, createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Miyabi'
const [, ch] = trans('char', key)
const cond = Miyabi.conditionals
const buff = Miyabi.buffs
const formula = Miyabi.formulas

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    chain: {
      UltimateLingeringSnow: [
        {
          type: 'conditional',
          conditional: {
            label: st('uponLaunch.1', { val1: '$t(skills.ult)' }),
            description: (
              <GameDesc
                ns="char_Miyabi_gen"
                key18="chain.UltimateLingeringSnow.desc"
              />
            ),
            metadata: cond.ult_used,
            fields: [fieldForBuff(buff.ult_ice_dmg_)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreIcefireCond'),
        description: <CoreGameDesc characterKey={key} paragraph={0} />,
        metadata: cond.icefire,
        fields: [fieldForBuff(buff.core_frost_anomBuildup_)],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_frostburnBreak_dmg'),
          fieldRef: formula.core_frostburnBreak_dmg.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreFrostburnCond'),
        description: <CoreGameDesc characterKey={key} paragraph={1} />,
        metadata: cond.frostburn,
        fields: [fieldForBuff(buff.core_anomBuildup_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('ability_dmg_'),
          fieldRef: buff.ability_dmg_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        description: <GameDesc ns="char_Miyabi_gen" key18="ability.desc" />,
        metadata: cond.disorder_triggered,
        fields: [
          {
            title: ch('ability_ice_resIgn_'),
            fieldRef: buff.ability_ice_resIgn_.tag,
          },
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        description: (
          <GameDesc ns="char_Miyabi_gen" key18="mindscapes.1.desc" />
        ),
        metadata: cond.fallen_frost,
        fields: [
          {
            title: ch('m1_defIgn_'),
            fieldRef: buff.m1_defIgn_.tag,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond2'),
        description: (
          <GameDesc ns="char_Miyabi_gen" key18="mindscapes.1.desc" />
        ),
        metadata: cond.level_3_charge_hit,
        fields: [fieldForBuff(buff.m1_anomBuildup_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_dmg_'),
          fieldRef: buff.m2_dmg_.tag,
        },
        fieldForBuff(buff.m2_dodgeCounter_dmg_),
        fieldForBuff(buff.m2_crit_),
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_frostburnBreak_dmg_'),
          fieldRef: buff.m4_frostburnBreak_dmg_.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description: (
          <GameDesc ns="char_Miyabi_gen" key18="mindscapes.6.desc" />
        ),
        metadata: cond.polar,
        fields: [
          {
            title: ch('m6_dmg_'),
            fieldRef: buff.m6_dmg_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
