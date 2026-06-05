import type { DiscSubStatKey } from '@genshin-optimizer/zzz/consts'
import { calculateDiscScore } from '@genshin-optimizer/zzz/util'
import type { IDisc } from '@genshin-optimizer/zzz/zood'

export function computeCurrentScore(
  disc: IDisc,
  effectiveStats: DiscSubStatKey[],
  substatWeights?: Partial<Record<DiscSubStatKey, number>>
): number {
  const { efficiency } = calculateDiscScore(
    disc,
    effectiveStats,
    substatWeights
  )
  return efficiency
}
