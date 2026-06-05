import { ImgIcon } from '@genshin-optimizer/common/ui'
import { rarityDefIcon, specialityDefIcon } from '@genshin-optimizer/zzz/assets'
import type {
  AttributeKey,
  CharacterRarityKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allAttributeKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { SegmentedFilterRow } from '@genshin-optimizer/zzz/ui'
import { Box, CloseButton, Flex, TextInput } from '@mantine/core'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

export function FilterBar({
  specialtyType,
  onSpecialtyChange,
  attribute,
  onAttributeChange,
  rarity,
  onRarityChange,
  searchTerm,
  onSearchChange,
}: {
  specialtyType: SpecialityKey[]
  onSpecialtyChange: (v: SpecialityKey[]) => void
  attribute: AttributeKey[]
  onAttributeChange: (v: AttributeKey[]) => void
  rarity: CharacterRarityKey[]
  onRarityChange: (v: CharacterRarityKey[]) => void
  searchTerm: string
  onSearchChange: (v: string) => void
}) {
  const { t } = useTranslation('page_characters')

  return (
    <Flex gap={8} w="100%" mb={0} align="center" justify="space-between">
      <TextInput
        styles={{
          input: {
            height: 40,
            lineHeight: '40px',
            fontSize: 14,
            borderRadius: 4,
          },
        }}
        w={200}
        placeholder={t('searchPlaceholder')}
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onSearchChange(e.target.value.toLowerCase())
        }
        rightSection={
          searchTerm ? (
            <CloseButton size="sm" onClick={() => onSearchChange('')} />
          ) : undefined
        }
        rightSectionPointerEvents="all"
      />
      <Box style={{ flex: 1 }}>
        <SegmentedFilterRow
          tags={allSpecialityKeys.map((sk) => ({
            key: sk,
            display: <ImgIcon src={specialityDefIcon(sk)} size={1.5} />,
          }))}
          currentFilter={specialtyType}
          setCurrentFilters={onSpecialtyChange}
        />
      </Box>
      <Box style={{ width: 421 }}>
        <SegmentedFilterRow
          tags={allAttributeKeys.map((atr) => ({
            key: atr,
            display: (
              <ElementIcon
                ele={atr}
                iconProps={{ style: { fontSize: '1.3rem' } }}
              />
            ),
          }))}
          currentFilter={attribute}
          setCurrentFilters={onAttributeChange}
        />
      </Box>
      <Box style={{ minWidth: 180 }}>
        <SegmentedFilterRow
          tags={allCharacterRarityKeys.map((rk) => ({
            key: rk,
            display: <ImgIcon src={rarityDefIcon(rk)} size={1.2} />,
          }))}
          currentFilter={rarity}
          setCurrentFilters={onRarityChange}
        />
      </Box>
    </Flex>
  )
}
