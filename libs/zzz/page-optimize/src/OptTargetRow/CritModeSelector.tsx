import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { critModeKey } from '@genshin-optimizer/zzz/db'
import { critModeKeys } from '@genshin-optimizer/zzz/db'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { Box, MenuItem } from '@mantine/core'

// TODO: translation
const modeMap: Record<critModeKey, string> = {
  avg: 'Average',
  crit: 'Crit Hit',
  nonCrit: 'Non-Crit Hit',
}
export function CritModeSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const { critMode } = getTeamFrame0(team)
  return (
    <DropdownButton
      title={
        <Box style={{ textWrap: 'nowrap' }}>Hit mode: {modeMap[critMode]}</Box>
      }
    >
      {critModeKeys.map((k) => (
        <MenuItem
          key={k}
          style={
            critMode === k
              ? { backgroundColor: 'var(--mantine-color-blue-light)' }
              : undefined
          }
          disabled={critMode === k}
          onClick={() =>
            database.teams.setFrame0(character.key, { critMode: k })
          }
        >
          {modeMap[k]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
