import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Image } from '@mantine/core'

export function CharIconCircle({
  characterKey,
}: { characterKey: CharacterKey }) {
  const charAsset = characterAsset(characterKey, 'circle')
  return <Image src={charAsset} w="1.5em" h="1.5em" />
}
