import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { Flex } from '@mantine/core'
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
    (slotIndex) => teammates[slotIndex + 1]
  )

  return (
    <Flex gap={10} style={{ flex: 1 }}>
      {TEAMMATE_SLOTS.map((slotIndex) => (
        <TeammateCard
          key={slotIndex}
          slotIndex={slotIndex}
          characterKey={extraTeammates[slotIndex]?.characterKey}
          teammateDatum={extraTeammates[slotIndex]}
          onRemove={() => removeTeammate(slotIndex)}
        />
      ))}
    </Flex>
  )
}
