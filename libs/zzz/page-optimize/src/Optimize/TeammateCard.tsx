import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type {
  CharacterKey,
  DiscSetKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import {
  CharacterName,
  CharacterSingleSelectionModal,
  DiscSetAutocomplete,
  WengineAutocomplete,
} from '@genshin-optimizer/zzz/ui'
import {
  ActionIcon,
  Button,
  CloseButton,
  Flex,
  Group,
  Stack,
  Text,
} from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { useCallback, useMemo, useState } from 'react'
import { CharacterConditionalsDisplay } from './CharacterConditionalsDisplay'
import { WEngineConditionalsDisplay } from './WEngineConditionalsDisplay'

export function TeammateCard({
  slotIndex,
  characterKey,
  onRemove,
}: {
  slotIndex: number
  characterKey: CharacterKey | undefined
  onRemove: () => void
}) {
  const mainChar = useCharacterContext()!
  const { database } = useDatabaseContext()
  const [showCharModal, onShowCharModal, onHideCharModal] = useBoolState()
  const [discSet2p, setDiscSet2p] = useState<DiscSetKey | ''>('')
  const [discSet4p, setDiscSet4p] = useState<DiscSetKey | ''>('')

  const setTeammate = useCallback(
    (ck: CharacterKey | null) => {
      database.teams.setTeammate(mainChar.key, ck, slotIndex)
    },
    [database.teams, mainChar.key, slotIndex]
  )

  const removeTeammate = useCallback(() => {
    database.teams.setTeammate(mainChar.key, null, slotIndex)
    onRemove()
  }, [database.teams, mainChar.key, slotIndex, onRemove])

  const teammate = useMemo(
    () => (characterKey ? database.chars.get(characterKey) : undefined),
    [database.chars, characterKey]
  )

  const teammateWengineKey: WengineKey | '' = teammate?.wengineKey || ''

  const setWengineKey = useCallback(
    (wKey: WengineKey | '') => {
      if (!characterKey) return
      database.chars.set(characterKey, {
        wengineKey: wKey,
      })
    },
    [characterKey, database.chars]
  )

  const syncFromRoster = useCallback(() => {
    if (!characterKey) return
    database.teams.setTeammate(mainChar.key, characterKey, slotIndex)
  }, [characterKey, database.teams, mainChar.key, slotIndex])

  if (!characterKey) {
    return (
      <CardThemed bgt="light" style={{ padding: 16 }}>
        <Stack gap="sm" align="center">
          <Text size="sm" c="dimmed">
            Teammate {slotIndex + 1}
          </Text>
          <Button
            fullWidth
            variant="outline"
            onClick={onShowCharModal}
            size="xs"
          >
            Select Teammate
          </Button>
          <CharacterSingleSelectionModal
            show={showCharModal}
            onHide={onHideCharModal}
            onSelect={(ck) => {
              if (ck) setTeammate(ck)
              onHideCharModal()
            }}
            showNone={false}
          />
        </Stack>
      </CardThemed>
    )
  }

  const charStat = getCharStat(characterKey)

  return (
    <CardThemed bgt="light" style={{ padding: 12 }}>
      <CharacterSingleSelectionModal
        show={showCharModal}
        onHide={onHideCharModal}
        onSelect={(ck) => {
          if (ck) setTeammate(ck)
          onHideCharModal()
        }}
        showNone={false}
      />
      <Stack gap="sm">
        <Flex justify="space-between" align="center">
          <Group gap="xs">
            <ImgIcon size={2} src={characterAsset(characterKey, 'circle')} />
            <Text
              size="sm"
              fw={600}
              style={{ color: charStat.attribute ?? undefined }}
            >
              <CharacterName characterKey={characterKey} />
            </Text>
          </Group>
          <Group gap={4}>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={syncFromRoster}
              title="Sync from roster"
            >
              <IconRefresh size={14} />
            </ActionIcon>
            <CloseButton size="sm" onClick={removeTeammate} />
          </Group>
        </Flex>

        <Button fullWidth size="xs" variant="subtle" onClick={onShowCharModal}>
          Change Character
        </Button>

        <CharacterConditionalsDisplay characterKey={characterKey} />

        <Stack gap={4}>
          <Text size="xs" fw={600}>
            Disc Sets
          </Text>
          <DiscSetAutocomplete
            discSetKey={discSet2p}
            setDiscSetKey={setDiscSet2p}
            label="2-Piece Set"
          />
          <DiscSetAutocomplete
            discSetKey={discSet4p}
            setDiscSetKey={setDiscSet4p}
            label="4-Piece Set"
          />
        </Stack>

        <Stack gap={4}>
          <Text size="xs" fw={600}>
            W-Engine
          </Text>
          <WengineAutocomplete
            wkey={teammateWengineKey ?? ''}
            setWKey={setWengineKey}
          />
        </Stack>

        {teammateWengineKey && (
          <WEngineConditionalsDisplay wengineKey={teammateWengineKey} />
        )}
      </Stack>
    </CardThemed>
  )
}
