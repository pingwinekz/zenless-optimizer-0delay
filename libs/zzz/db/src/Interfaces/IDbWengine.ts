import type { MilestoneKey, PhaseKey, WengineKey } from '@genshin-optimizer/zzz/consts'

export interface ICachedWengine {
  id: string
  key: WengineKey
  level: number
  modification: MilestoneKey
  phase: PhaseKey
}
