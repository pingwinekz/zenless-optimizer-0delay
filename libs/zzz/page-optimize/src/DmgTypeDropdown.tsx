import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { DamageType } from '@genshin-optimizer/zzz/formula'
import { damageTypeKeysMap } from '@genshin-optimizer/zzz/formula-ui'
import { Box, MenuItem } from '@mantine/core'

export function DmgTypeDropdown<T extends DamageType>({
  dmgType,
  keys,
  setDmgType,
}: {
  dmgType?: T
  keys: T[]
  setDmgType: (dmgType?: T) => void
}) {
  return (
    <DropdownButton
      title={
        <Box style={{ textWrap: 'nowrap' }}>
          Dmg Type: {dmgType ? damageTypeKeysMap[dmgType] : 'Any'}
        </Box>
      }
    >
      <MenuItem
        key={'any'}
        style={
          !dmgType
            ? { backgroundColor: 'var(--mantine-color-blue-light)' }
            : undefined
        }
        disabled={!dmgType}
        onClick={() => setDmgType()}
      >
        Any
      </MenuItem>
      {keys.map((k) => (
        <MenuItem
          key={k}
          style={
            dmgType === k
              ? { backgroundColor: 'var(--mantine-color-blue-light)' }
              : undefined
          }
          disabled={dmgType === k}
          onClick={() => setDmgType(k)}
        >
          {damageTypeKeysMap[k]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
