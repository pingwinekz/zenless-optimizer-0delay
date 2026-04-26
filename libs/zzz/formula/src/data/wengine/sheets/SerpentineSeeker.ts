import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'SerpentineSeeker'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { energyConsumed20 } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Base CRIT Rate
  registerBuff(
    'critRate_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.critRate))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // DEF ignore when consuming 20+ energy
  registerBuff(
    'defIgnore_',
    ownBuff.dmg.anom_mv_mult_.electric.add(
      cmpSpecialtyAndEquipped(
        key,
        energyConsumed20.ifOn(subscript(phase, dm.defIgnore))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet