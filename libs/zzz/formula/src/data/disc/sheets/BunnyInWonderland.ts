import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'BunnyInWonderland'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { def_assist_or_evasive_assist, exSpecialUsed } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  entriesForDisc(key),

  registerBuff(
    'set4_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(discCount, 4, cmpEq(own.char.specialty, 'defense', percent(0.18)))
    ),
    showCond4Set
  )
)
export default sheet