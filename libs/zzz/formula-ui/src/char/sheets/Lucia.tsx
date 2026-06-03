import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Lucia } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Lucia'
const [, ch] = trans('char', key)
const cond = Lucia.conditionals
const buff = Lucia.buffs
const formula = Lucia.formulas

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      EXSpecialAttackSymphonyOfTheReaperDaybreak: [
        {
          type: 'conditional',
          conditional: {
            label: ch('exSpecialCond'),
            description: 'Grants Sheer Force while in the Darkbreaker state.',
            metadata: cond.darkbreaker,
            fields: [fieldForBuff(buff.exSpecial_sheerForce)],
          },
        },
        {
          type: 'fields',
          fields: [
            {
              title: ch('harmony.flat_dmg'),
              fieldRef: buff.exSpecial_harmony_dmg_.tag,
            },
          ],
        },
      ],
    },
    chain: {
      UltimateChargeGreatArmor: [
        {
          type: 'fields',
          fields: [
            {
              title: st('heal'),
              fieldRef: formula.ult_heal.tag,
            },
          ],
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.etherVeil'),
        description: 'Increases HP while Ether Veil: Wellspring is active.',
        metadata: cond.etherVeil,
        fields: [fieldForBuff(buff.core_hp_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.dreamersNurseryRhyme'),
        description:
          "Increases all DMG while in the Dreamer's Nursery Rhyme state.",
        metadata: cond.dreamersNurseryRhyme,
        fields: [fieldForBuff(buff.core_common_dmg_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('exSpecialCond'),
        description: 'Increases CRIT DMG while in the Darkbreaker state.',
        metadata: cond.darkbreaker,
        fields: [fieldForBuff(buff.ability_crit_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.dreamersNurseryRhyme'),
        description:
          "Ignores enemy RES while in the Dreamer's Nursery Rhyme state.",
        metadata: cond.dreamersNurseryRhyme,
        fields: [fieldForBuff(buff.m1_resIgn_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.etherVeil'),
        description: 'Increases Harmony DMG while Ether Veil is active.',
        metadata: cond.etherVeil,
        fields: [
          {
            title: ch('harmony.dmg_'),
            fieldRef: buff.m2_harmony_dmg_.tag,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('exSpecialCond'),
        description: 'Increases Sheer DMG while in the Darkbreaker state.',
        metadata: cond.darkbreaker,
        fields: [fieldForBuff(buff.m2_sheer_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.etherVeil'),
        description:
          'Boosts ATK and Harmony CRIT stats while Ether Veil is active.',
        metadata: cond.etherVeil,
        fields: [
          fieldForBuff(buff.m6_atk_),
          {
            title: ch('harmony.crit_'),
            fieldRef: buff.m6_harmony_crit_.tag,
          },
          {
            title: ch('harmony.crit_dmg_'),
            fieldRef: buff.m6_harmony_crit_dmg_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
