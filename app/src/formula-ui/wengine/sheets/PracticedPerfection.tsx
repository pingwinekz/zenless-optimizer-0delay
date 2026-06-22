import type { UISheetElement } from '@zenless-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '../../../assets'
import type { WengineKey } from '../../../consts'
import { PracticedPerfection } from '../../../formula'
import { mappedStats } from '../../../stats'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'PracticedPerfection'
const [chg, _ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key)
const cond = PracticedPerfection.conditionals
const buff = PracticedPerfection.buffs

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
      fields: [tagToTagField(buff.anomMas.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        metadata: cond.stacks,
        label: st('stacks'),
        fields: [
          tagToTagField(buff.stacks_phys_dmg_.tag),
          {
            title: st('duration'),
            fieldValue: dm.duration,
          },
        ],
      },
    },
  ],
}

export default sheet
