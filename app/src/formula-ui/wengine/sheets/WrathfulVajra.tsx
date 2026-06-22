import type { UISheetElement } from '@zenless-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '../../../assets'
import type { WengineKey } from '../../../consts'
import { WrathfulVajra } from '../../../formula'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'WrathfulVajra'
const [chg, _ch] = trans('wengine', key)
const icon = wengineAsset(key)
const cond = WrathfulVajra.conditionals
const buff = WrathfulVajra.buffs

const sheet: UISheetElement = {
  title: chg('phase'),
  img: icon,
  documents: [
    {
      type: 'text',
      text: (
        <PhaseWrapper wKey={key}>
          {(phase) => chg(`phaseDescs.${phase - 1}`)}
        </PhaseWrapper>
      ),
    },
    {
      type: 'fields',
      fields: [tagToTagField(buff.passive_crit_.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.2', {
          val1: '$t(skills.exSpecial)',
          val2: '$t(skills.assistFollowUp)',
        }),
        metadata: cond.exSpecialAssistLaunched,
        fields: [tagToTagField(buff.cond_fire_sheer_dmg_.tag)],
      },
    },
  ],
}

export default sheet
