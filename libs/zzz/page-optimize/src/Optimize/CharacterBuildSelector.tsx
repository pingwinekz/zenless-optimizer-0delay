import { objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { CharacterBuild } from '@genshin-optimizer/zzz/db'
import {
  useCharacter,
  useCharacterBuilds,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { Button, Flex, Select, Text } from '@mantine/core'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function CharacterBuildSelector({
  characterKey,
  label,
  compact = false,
}: {
  characterKey: CharacterKey | undefined
  label?: string
  compact?: boolean
}) {
  const { t } = useTranslation('page_characters')
  const { database } = useDatabaseContext()
  const character = useCharacter(characterKey ?? undefined)
  const builds = useCharacterBuilds(characterKey ?? undefined)
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null)

  const charBuilds = useMemo(
    () =>
      builds
        .filter((b): b is CharacterBuild => !!b)
        .map((b) => ({
          value: (b as CharacterBuild & { id: string }).id,
          label: b.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [builds]
  )

  const handleLoad = useCallback(
    (buildId: string) => {
      if (!characterKey || !character) return
      const build = database.characterBuilds.get(buildId)
      if (!build) return

      // Build up the new equippedDiscs map
      const newEquippedDiscs = objKeyMap(allDiscSlotKeys, (slotKey) => {
        const buildDiscId = build.discIds[slotKey]
        return buildDiscId && database.discs.get(buildDiscId) ? buildDiscId : ''
      })

      // 1. Swap discs: unequip current, equip build's
      for (const slotKey of allDiscSlotKeys) {
        const buildDiscId = newEquippedDiscs[slotKey]
        const currentChar = database.chars.get(characterKey)
        const currentDiscId = currentChar?.equippedDiscs[slotKey]

        if (currentDiscId && currentDiscId !== buildDiscId) {
          const disc = database.discs.get(currentDiscId)
          if (disc) {
            database.discs.setCached(currentDiscId, { ...disc, location: '' })
          }
        }
        if (buildDiscId) {
          const disc = database.discs.get(buildDiscId)
          if (disc) {
            database.discs.setCached(buildDiscId, {
              ...disc,
              location: characterKey,
            })
          }
        }
      }

      // 2. Update character wengine and equippedDiscs
      const currentChar = database.chars.get(characterKey)
      if (currentChar) {
        database.chars.setCached(characterKey, {
          ...currentChar,
          wengineKey: build.wengineKey as WengineKey | '',
          wenginePhase: build.wenginePhase,
          equippedDiscs: newEquippedDiscs,
        })
      }

      setSelectedBuildId(null)
    },
    [characterKey, character, database]
  )

  if (!characterKey || !character) return null

  if (compact) {
    // Compact variant: inline select + load button
    return (
      <Flex align="center" gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Select
          data={charBuilds}
          value={selectedBuildId}
          onChange={(val) => setSelectedBuildId(val)}
          placeholder={label ?? t('characterBuilds.title')}
          size="xs"
          clearable
          searchable
          nothingFoundMessage={t('characterBuilds.noBuilds') as string}
          style={{ flex: 1, minWidth: 0 }}
          comboboxProps={{ withinPortal: false }}
        />
        <Button
          size="compact-xs"
          variant="light"
          disabled={!selectedBuildId}
          onClick={() => {
            if (selectedBuildId) handleLoad(selectedBuildId)
          }}
        >
          {t('characterBuilds.load')}
        </Button>
      </Flex>
    )
  }

  // Full variant: label + select + load button
  return (
    <Flex direction="column" gap={4}>
      {label && (
        <Text size="xs" fw={600}>
          {label}
        </Text>
      )}
      <Flex align="center" gap={4}>
        <Select
          data={charBuilds}
          value={selectedBuildId}
          onChange={(val) => setSelectedBuildId(val)}
          placeholder={t('characterBuilds.title')}
          size="xs"
          clearable
          searchable
          nothingFoundMessage={t('characterBuilds.noBuilds') as string}
          style={{ flex: 1 }}
          comboboxProps={{ withinPortal: false }}
        />
        <Button
          size="compact-xs"
          variant="light"
          disabled={!selectedBuildId}
          onClick={() => {
            if (selectedBuildId) handleLoad(selectedBuildId)
          }}
        >
          {t('characterBuilds.load')}
        </Button>
      </Flex>
    </Flex>
  )
}
