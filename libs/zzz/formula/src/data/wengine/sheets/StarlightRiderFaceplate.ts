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

const key: WengineKey = 'StarlightRiderFaceplate'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialLaunched } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  entriesForWengine(key),

  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.passive_crit_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'physical_sheer_dmg_',
    ownBuff.combat.sheer_dmg_.physical.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(
          exSpecialLaunched,
          percent(subscript(phase, dm.physical_sheer_dmg_))
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
