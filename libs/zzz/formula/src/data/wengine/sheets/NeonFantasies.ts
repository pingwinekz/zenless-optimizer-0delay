import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { entriesForWengine, registerWengine } from '../util'

const key: WengineKey = 'NeonFantasies'

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key)
  // TODO: Implement full buff formulas using subscript(phase, index)
  // phase[0] = Anomaly Prof (90, 103, 117, 130, 145)
  // phase[1] = squad DMG (0.15, 0.17, 0.195, 0.21, 0.24)
  // phase[5] = Additional Anomaly Prof at max stacks (60, 69, 78, 87, 96)
)
export default sheet