import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { SolExuvia } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'SolExuvia'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = SolExuvia.conditionals
const buff = SolExuvia.buffs

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
      fields: [
        {
          title: 'CR buff',
          fieldRef: buff.crit_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond'),
        metadata: cond.eclipse_active,
        fields: [
          tagToTagField(buff.etherResIgn_.tag),
          {
            title: 'Duration',
            fieldValue: dm.duration,
          },
        ],
      },
    },
  ],
}

export default sheet
