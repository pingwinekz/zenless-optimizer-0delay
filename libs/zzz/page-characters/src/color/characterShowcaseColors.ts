import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { getAttributeColor } from './colorUtils'

const characterShowcaseColors: Partial<Record<CharacterKey, string>> = {}

export function getCharacterShowcaseColor(characterKey: CharacterKey): string {
  const custom = characterShowcaseColors[characterKey]
  if (custom) return custom
  const stat = getCharStat(characterKey)
  return getAttributeColor(stat.attribute)
}
