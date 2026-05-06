import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'FrostfallSickle'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  cond_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  maxStacks: data_gen[o++][1],
  stacksPerUse: data_gen[o++][1],
  cond2_dmg_: data_gen[o++],
} as const

export default dm
