import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
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

const { stacks } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  entriesForWengine(key),

  // Base: CRIT Rate +20%
  registerBuff(
    'base_critRate',
    ownBuff.combat.crit_.add(percent(subscript(phase, dm.critRate))),
    showSpecialtyAndEquipped(key)
  ),

  // Passive: On Basic Attack - Physical Sheer DMG stacks (up to 2)
  // Sheer DMG = 12% * stacks at max phase
  registerBuff(
    'cond_physical_sheer_dmg_',
    ownBuff.combat.sheer_dmg_.physical.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(stacks, percent(subscript(phase, dm.sheerDmg)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet