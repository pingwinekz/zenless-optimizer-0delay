import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { SimpleGrid, Stack, Text } from '@mantine/core'
import { useCallback } from 'react'
import { TeammateCard } from './TeammateCard'

const TEAMMATE_SLOTS = [0, 1] as const

export function TeammatesSection() {
  const mainChar = useCharacterContext()!
  const { database } = useDatabaseContext()
  const team = useTeam(mainChar.key)!

  const removeTeammate = useCallback(
    (slotIndex: number) => {
      database.teams.setTeammate(mainChar.key, null, slotIndex)
    },
    [database.teams, mainChar.key]
  )

  const teammates = team.teammates
  const extraTeammates = TEAMMATE_SLOTS.map(
    (slotIndex) => teammates[slotIndex + 1]?.characterKey
  )

  return (
    <CardThemed bgt="light" style={{ padding: 12 }}>
      <Stack gap="sm">
        <Text size="sm" fw={600}>
          Teammates
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
          {TEAMMATE_SLOTS.map((slotIndex) => (
            <TeammateCard
              key={slotIndex}
              slotIndex={slotIndex}
              characterKey={extraTeammates[slotIndex]}
              onRemove={() => removeTeammate(slotIndex)}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </CardThemed>
  )
}
