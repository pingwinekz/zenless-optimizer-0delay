import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'StarlightRiderFaceplate'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  critRate: data_gen[o++],
  sheerDmg: data_gen[o++],
  maxStacks: data_gen[o++][1],
  duration: data_gen[o++][1],
} as const

export default dm