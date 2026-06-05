import type { IDisc } from '@genshin-optimizer/zzz/zood'

export type ScoredDisc = {
  id: string
  disc: IDisc
  scoreCurrent: number
  scoreMaxPotential: number
}
