import { ImgIcon } from '@genshin-optimizer/common/ui'
import { rarityDefIcon, specialityDefIcon } from '@genshin-optimizer/zzz/assets'
import type {
  AttributeKey,
  CharacterKey,
  CharacterRarityKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import { milestoneMaxLevel } from '@genshin-optimizer/zzz/consts'
import type { ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { CharacterName } from '@genshin-optimizer/zzz/ui'
import { ActionIcon, Box, Flex, Tooltip } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import classes from './ShowcaseCharacterHeader.module.css'
import { StatText } from './StatText'

export function ShowcaseCharacterHeader({
  characterKey,
  attribute,
  rarity,
  specialty,
  character,
  onEdit,
  onDelete,
}: {
  characterKey: CharacterKey
  attribute: AttributeKey
  rarity: CharacterRarityKey
  specialty: SpecialityKey
  character: ICachedCharacter
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Box>
      <Flex className={classes.headerRow}>
        <ElementIcon
          ele={attribute}
          iconProps={{ style: { fontSize: '2rem' } }}
        />
        <ImgIcon src={rarityDefIcon(rarity)} size={1.2} />
        <ImgIcon src={specialityDefIcon(specialty)} size={1.5} />
      </Flex>
      <StatText className={classes.characterName}>
        <CharacterName characterKey={characterKey} />
      </StatText>
      <StatText className={classes.characterLevel}>
        Lv.{character.level}/{milestoneMaxLevel[character.promotion]}
        {' · M'}
        {character.mindscape} · C{character.core}
        {getCharStat(characterKey).potentialParams.length > 0 &&
          ` · P${character.potential}`}
      </StatText>
      <Flex gap={2} mt={2} justify="center">
        {onEdit && (
          <Tooltip label="Edit character">
            <ActionIcon size="xs" variant="subtle" c="gray.3" onClick={onEdit}>
              <IconEdit size={12} />
            </ActionIcon>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip label="Delete character">
            <ActionIcon
              size="xs"
              variant="subtle"
              c="gray.3"
              onClick={onDelete}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Tooltip>
        )}
      </Flex>
    </Box>
  )
}
