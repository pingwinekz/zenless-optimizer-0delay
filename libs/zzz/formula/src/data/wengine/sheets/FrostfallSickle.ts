import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'FrostfallSickle'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { stacks } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  entriesForWengine(key),

  registerBuff(
    'cond_dmg_',
    ownBuff.combat.dmg_.ice.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(stacks, percent(subscript(phase, dm.cond_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
