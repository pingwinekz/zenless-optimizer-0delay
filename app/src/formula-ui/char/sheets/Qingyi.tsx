import type { CharacterKey } from '../../../consts'
import { Qingyi } from '../../../formula'
import { mappedStats } from '../../../stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Qingyi'
const [, ch] = trans('char', key)
const cond = Qingyi.conditionals
const buff = Qingyi.buffs
const formula = Qingyi.formulas
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      BasicAttackEnchantedMoonlitBlossoms: [
        {
          type: 'conditional',
          conditional: {
            label: ch('flashConnectCond'),
            description:
              'Increases DMG and Daze when Flash Connect is consumed at over 75%.',
            metadata: cond.flash_connect_consumed,
            fields: [
              fieldForBuff(buff.flash_connect_dmg_),
              fieldForBuff(buff.flash_connect_dazeInc_),
            ],
          },
        },
      ],
    },
    chain: {
      ChainAttackTranquilSerenade: [
        {
          type: 'fields',
          fields: [fieldForBuff(buff.chain_dmg_)],
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('subjugationCond'),
        description: 'Increases Stun multiplier based on Subjugation stacks.',
        metadata: cond.subjugation,
        fields: [fieldForBuff(buff.core_stun_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_basic_dazeInc_),
        fieldForBuff(buff.ability_atk),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_defRed_), fieldForBuff(buff.m1_crit_)],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_stun_'),
          fieldValue: dm.m2.stun_mult_ * 100,
          unit: '%',
        },
        fieldForBuff(buff.m2_dazeInc_),
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_shield'),
          fieldRef: formula.m4_shield.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_crit_dmg_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        description:
          'Reduces enemy RES when Qingyi hits with Basic Attack: Enchanted Moonlit Blossoms.',
        metadata: cond.moonlit_blossoms_hit,
        fields: [fieldForBuff(buff.m6_resRed_)],
      },
    },
  ],
})

export default sheet
