import type { CharacterKey } from '../../../consts'
import { Dialyn } from '../../../formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Dialyn'
const [, ch] = trans('char', key)
const cond = Dialyn.conditionals
const buff = Dialyn.buffs
const formula = Dialyn.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_impact)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('maliciousComplaint'),
        description:
          'Increases Daze dealt to enemies under the Malicious Complaint effect.',
        metadata: cond.malicious_complaint,
        fields: [fieldForBuff(buff.core_stun_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_exSpecial_crit_dmg_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('overwhelminglyPositive'),
        description:
          'Increases DMG dealt by squad members under the Overwhelmingly Positive effect.',
        metadata: cond.overwhelmingly_positive,
        fields: [fieldForBuff(buff.ability_common_dmg_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('prevMember'),
        description:
          'Determines the buff based on the previous teammate Specialty.',
        metadata: cond.atk_sheerForce,
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: (_, value) => ch(`prevMemberCond.${value}`),
        description:
          'Increases ATK DMG or Rupture DMG based on the previous teammate Specialty.',
        metadata: cond.prevMember,
        badge: (_, value) => (value === 0 ? null : value),
        fields: [
          fieldForBuff(buff.ability_attack_dmg),
          fieldForBuff(buff.ability_rupture_dmg),
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('overwhelminglyPositive'),
        description:
          'Ignores a portion of enemy RES when a squad member has Overwhelmingly Positive.',
        metadata: cond.overwhelmingly_positive,
        fields: [fieldForBuff(buff.m1_resIgn_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('maliciousComplaint'),
        description:
          'Increases Stun and DMG dealt to enemies under the Malicious Complaint effect.',
        metadata: cond.malicious_complaint,
        fields: [
          fieldForBuff(buff.m2_stun_),
          fieldForBuff(buff.m2_common_dmg_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('overwhelminglyPositive'),
        description:
          'Increases ATK of squad members under the Overwhelmingly Positive effect.',
        metadata: cond.overwhelmingly_positive,
        fields: [fieldForBuff(buff.m4_atk)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [{ title: st('dmg'), fieldRef: formula.m6_dmg.tag }],
    },
  ],
})

export default sheet
